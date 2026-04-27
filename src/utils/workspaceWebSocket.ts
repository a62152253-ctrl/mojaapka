export interface WorkspaceMessage {
  type: 'join_workspace' | 'leave_workspace' | 'file_update' | 'cursor_update' | 'collaborator_join' | 'collaborator_leave' | 'chat_message' | 'presence_update'
  workspaceId: string
  userId: string
  timestamp: number
  data?: any
}

export interface CollaboratorCursor {
  userId: string
  line: number
  column: number
  file: string
}

export interface Collaborator {
  id: string
  name: string
  avatar: string
  cursor?: CollaboratorCursor
  color: string
  isOnline: boolean
  lastSeen: number
}

export interface ChatMessage {
  id: string
  userId: string
  username: string
  message: string
  timestamp: number
  workspaceId: string
}

export class WorkspaceWebSocket {
  private ws: WebSocket | null = null
  private workspaceId: string
  private userId: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private messageQueue: WorkspaceMessage[] = []

  private onMessageCallbacks: ((message: WorkspaceMessage) => void)[] = []
  private onCollaboratorJoinCallbacks: ((collaborator: Collaborator) => void)[] = []
  private onCollaboratorLeaveCallbacks: ((userId: string) => void)[] = []
  private onCursorUpdateCallbacks: ((cursor: CollaboratorCursor) => void)[] = []
  private onChatMessageCallbacks: ((message: ChatMessage) => void)[] = []
  private onConnectionChangeCallbacks: ((connected: boolean) => void)[] = []

  constructor(workspaceId: string, userId: string) {
    this.workspaceId = workspaceId
    this.userId = userId
  }

  connect(url: string = 'ws://localhost:8080/workspace'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${url}?workspaceId=${this.workspaceId}&userId=${this.userId}`)

        this.ws.onopen = () => {
          console.log('Connected to workspace WebSocket')
          this.reconnectAttempts = 0
          this.startHeartbeat()
          this.flushMessageQueue()
          this.notifyConnectionChange(true)
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message: WorkspaceMessage = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('WebSocket connection closed:', event.code, event.reason)
          this.stopHeartbeat()
          this.notifyConnectionChange(false)
          
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect()
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          reject(error)
        }

      } catch (error) {
        reject(error)
      }
    })
  }

  disconnect(): void {
    this.stopHeartbeat()
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`)
    
    setTimeout(() => {
      if (this.ws?.readyState !== WebSocket.OPEN) {
        this.connect().catch(console.error)
      }
    }, delay)
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.sendMessage({
        type: 'presence_update',
        workspaceId: this.workspaceId,
        userId: this.userId,
        timestamp: Date.now(),
        data: { status: 'online' }
      })
    }, 30000) // Send heartbeat every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  private handleMessage(message: WorkspaceMessage): void {
    this.onMessageCallbacks.forEach(callback => callback(message))

    switch (message.type) {
      case 'collaborator_join':
        if (message.data?.collaborator) {
          this.onCollaboratorJoinCallbacks.forEach(callback => 
            callback(message.data.collaborator)
          )
        }
        break

      case 'collaborator_leave':
        this.onCollaboratorLeaveCallbacks.forEach(callback => 
          callback(message.userId)
        )
        break

      case 'cursor_update':
        if (message.data?.cursor) {
          this.onCursorUpdateCallbacks.forEach(callback => 
            callback(message.data.cursor)
          )
        }
        break

      case 'chat_message':
        if (message.data?.message) {
          this.onChatMessageCallbacks.forEach(callback => 
            callback(message.data.message)
          )
        }
        break
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift()
      if (message) {
        this.ws.send(JSON.stringify(message))
      }
    }
  }

  private notifyConnectionChange(connected: boolean): void {
    this.onConnectionChangeCallbacks.forEach(callback => callback(connected))
  }

  sendMessage(message: WorkspaceMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      this.messageQueue.push(message)
    }
  }

  joinWorkspace(): void {
    this.sendMessage({
      type: 'join_workspace',
      workspaceId: this.workspaceId,
      userId: this.userId,
      timestamp: Date.now()
    })
  }

  leaveWorkspace(): void {
    this.sendMessage({
      type: 'leave_workspace',
      workspaceId: this.workspaceId,
      userId: this.userId,
      timestamp: Date.now()
    })
  }

  sendFileUpdate(fileId: string, content: string): void {
    this.sendMessage({
      type: 'file_update',
      workspaceId: this.workspaceId,
      userId: this.userId,
      timestamp: Date.now(),
      data: { fileId, content }
    })
  }

  sendCursorUpdate(line: number, column: number, file: string): void {
    this.sendMessage({
      type: 'cursor_update',
      workspaceId: this.workspaceId,
      userId: this.userId,
      timestamp: Date.now(),
      data: { cursor: { userId: this.userId, line, column, file } }
    })
  }

  sendChatMessage(message: string, username: string): void {
    this.sendMessage({
      type: 'chat_message',
      workspaceId: this.workspaceId,
      userId: this.userId,
      timestamp: Date.now(),
      data: { 
        message: {
          id: `msg-${Date.now()}-${Math.random()}`,
          userId: this.userId,
          username,
          message,
          timestamp: Date.now(),
          workspaceId: this.workspaceId
        }
      }
    })
  }

  // Event subscription methods
  onMessage(callback: (message: WorkspaceMessage) => void): void {
    this.onMessageCallbacks.push(callback)
  }

  onCollaboratorJoin(callback: (collaborator: Collaborator) => void): void {
    this.onCollaboratorJoinCallbacks.push(callback)
  }

  onCollaboratorLeave(callback: (userId: string) => void): void {
    this.onCollaboratorLeaveCallbacks.push(callback)
  }

  onCursorUpdate(callback: (cursor: CollaboratorCursor) => void): void {
    this.onCursorUpdateCallbacks.push(callback)
  }

  onChatMessage(callback: (message: ChatMessage) => void): void {
    this.onChatMessageCallbacks.push(callback)
  }

  onConnectionChange(callback: (connected: boolean) => void): void {
    this.onConnectionChangeCallbacks.push(callback)
  }

  // Utility methods
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  getConnectionState(): string {
    if (!this.ws) return 'disconnected'
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING: return 'connecting'
      case WebSocket.OPEN: return 'connected'
      case WebSocket.CLOSING: return 'closing'
      case WebSocket.CLOSED: return 'disconnected'
      default: return 'unknown'
    }
  }

  getWorkspaceId(): string {
    return this.workspaceId
  }

  getUserId(): string {
    return this.userId
  }
}

// Factory function for creating workspace connections
export function createWorkspaceConnection(
  workspaceId: string, 
  userId: string,
  serverUrl?: string
): WorkspaceWebSocket {
  const ws = new WorkspaceWebSocket(workspaceId, userId)
  
  if (serverUrl) {
    ws.connect(serverUrl).catch(console.error)
  }
  
  return ws
}

// Mock WebSocket server for development
export class MockWorkspaceServer {
  private workspaces: Map<string, Set<WebSocket>> = new Map()
  private collaborators: Map<string, Map<string, Collaborator>> = new Map()

  constructor(private port: number = 8080) {
    this.startServer()
  }

  private startServer(): void {
    // In a real implementation, this would be a Node.js WebSocket server
    // For now, we'll provide a mock interface that can be used for testing
    console.log(`Mock workspace server started on port ${this.port}`)
  }

  addClientToWorkspace(workspaceId: string, client: WebSocket, userId: string): void {
    if (!this.workspaces.has(workspaceId)) {
      this.workspaces.set(workspaceId, new Set())
      this.collaborators.set(workspaceId, new Map())
    }

    this.workspaces.get(workspaceId)!.add(client)

    const collaborator: Collaborator = {
      id: userId,
      name: `User ${userId}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      color: this.generateUserColor(userId),
      isOnline: true,
      lastSeen: Date.now()
    }

    this.collaborators.get(workspaceId)!.set(userId, collaborator)

    // Notify other clients
    this.broadcastToWorkspace(workspaceId, {
      type: 'collaborator_join',
      workspaceId,
      userId,
      timestamp: Date.now(),
      data: { collaborator }
    }, client)
  }

  removeClientFromWorkspace(workspaceId: string, client: WebSocket, userId: string): void {
    const workspace = this.workspaces.get(workspaceId)
    if (workspace) {
      workspace.delete(client)
      
      if (workspace.size === 0) {
        this.workspaces.delete(workspaceId)
        this.collaborators.delete(workspaceId)
      } else {
        this.collaborators.get(workspaceId)!.delete(userId)
        
        // Notify other clients
        this.broadcastToWorkspace(workspaceId, {
          type: 'collaborator_leave',
          workspaceId,
          userId,
          timestamp: Date.now()
        })
      }
    }
  }

  broadcastFileUpdate(workspaceId: string, userId: string, fileId: string, content: string): void {
    this.broadcastToWorkspace(workspaceId, {
      type: 'file_update',
      workspaceId,
      userId,
      timestamp: Date.now(),
      data: { fileId, content }
    })
  }

  broadcastCursorUpdate(workspaceId: string, userId: string, cursor: CollaboratorCursor): void {
    this.broadcastToWorkspace(workspaceId, {
      type: 'cursor_update',
      workspaceId,
      userId,
      timestamp: Date.now(),
      data: { cursor }
    })
  }

  broadcastChatMessage(workspaceId: string, userId: string, message: ChatMessage): void {
    this.broadcastToWorkspace(workspaceId, {
      type: 'chat_message',
      workspaceId,
      userId,
      timestamp: Date.now(),
      data: { message }
    })
  }

  private broadcastToWorkspace(
    workspaceId: string, 
    message: any, 
    excludeClient?: WebSocket
  ): void {
    const workspace = this.workspaces.get(workspaceId)
    if (workspace) {
      const messageStr = JSON.stringify(message)
      
      workspace.forEach(client => {
        if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
          client.send(messageStr)
        }
      })
    }
  }

  private generateUserColor(userId: string): string {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ]
    
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    return colors[Math.abs(hash) % colors.length]
  }

  getWorkspaceCollaborators(workspaceId: string): Collaborator[] {
    const collaborators = this.collaborators.get(workspaceId)
    return collaborators ? Array.from(collaborators.values()) : []
  }

  getWorkspaceStats(workspaceId: string): { clientCount: number; collaboratorCount: number } {
    const clients = this.workspaces.get(workspaceId)
    const collaborators = this.collaborators.get(workspaceId)
    
    return {
      clientCount: clients?.size || 0,
      collaboratorCount: collaborators?.size || 0
    }
  }
}
