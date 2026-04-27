import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from './useAuth'

interface WebSocketMessage {
  type: 'notification' | 'deal_update' | 'project_update' | 'chat_message' | 'system'
  data: any
  timestamp: string
}

interface UseWebSocketReturn {
  isConnected: boolean
  lastMessage: WebSocketMessage | null
  sendMessage: (message: any) => void
  reconnect: () => void
  error: string | null
}

export const useWebSocket = (url?: string): UseWebSocketReturn => {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    if (!user || wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      const wsUrl = url || `ws://localhost:34321/ws?token=${localStorage.getItem('token')}`
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setError(null)
        reconnectAttemptsRef.current = 0
        
        // Send initial authentication
        ws.send(JSON.stringify({
          type: 'auth',
          userId: user.id,
          token: localStorage.getItem('token')
        }))
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          setLastMessage(message)
          
          // Handle different message types
          switch (message.type) {
            case 'notification':
              // Could trigger toast notification
              console.log('New notification:', message.data)
              break
            case 'deal_update':
              console.log('Deal update:', message.data)
              break
            case 'project_update':
              console.log('Project update:', message.data)
              break
            case 'chat_message':
              console.log('New chat message:', message.data)
              break
            case 'system':
              console.log('System message:', message.data)
              break
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
        }
      }

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)
        wsRef.current = null

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000)
          console.log(`Attempting to reconnect in ${delay}ms...`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++
            connect()
          }, delay)
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setError('Failed to connect after multiple attempts')
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setError('Connection error')
      }

    } catch (err) {
      console.error('Failed to create WebSocket connection:', err)
      setError('Failed to connect')
    }
  }, [user, url])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected')
      wsRef.current = null
    }
    
    setIsConnected(false)
    setError(null)
  }, [setIsConnected, setError])

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket not connected, message not sent:', message)
      setError('Not connected to server')
    }
  }, [setError])

  const reconnect = useCallback(() => {
    disconnect()
    reconnectAttemptsRef.current = 0
    setTimeout(connect, 1000)
  }, [disconnect, connect])

  useEffect(() => {
    if (user) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [user, connect, disconnect])

  return {
    isConnected,
    lastMessage,
    sendMessage,
    reconnect,
    error
  }
}

export default useWebSocket
