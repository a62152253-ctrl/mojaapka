import {
  KanbanBoard,
  KanbanColumn,
  KanbanCard,
  BoardMember,
  CardLabel,
  CardAttachment,
  CardComment,
  CardChecklist,
  CardDependency,
  KanbanSettings,
  KanbanActivity,
  KanbanTemplate,
  KanbanFilter,
  KanbanView,
  TimeEntry,
  KanbanStatistics,
  Sprint,
  CardType,
  Priority,
  CardStatus,
  BoardRole,
  ActivityType,
  ViewType,
  SprintStatus
} from '../types/kanban'
import { User } from '../types'

// Mock data for development
const mockBoards: KanbanBoard[] = [
  {
    id: 'board-1',
    name: 'Frontend Development',
    description: 'Track frontend tasks and features',
    projectId: 'project-1',
    columns: [
      {
        id: 'col-1',
        name: 'Backlog',
        color: '#6B7280',
        position: 0,
        cards: [],
        wipLimit: 10,
        isLocked: false
      },
      {
        id: 'col-2',
        name: 'In Progress',
        color: '#3B82F6',
        position: 1,
        cards: [],
        wipLimit: 3,
        isLocked: false
      },
      {
        id: 'col-3',
        name: 'Review',
        color: '#F59E0B',
        position: 2,
        cards: [],
        wipLimit: 5,
        isLocked: false
      },
      {
        id: 'col-4',
        name: 'Done',
        color: '#10B981',
        position: 3,
        cards: [],
        isLocked: false
      }
    ],
    members: [],
    settings: {
      id: 'settings-1',
      boardId: 'board-1',
      allowCardCreation: true,
      allowCardDeletion: true,
      allowColumnEditing: true,
      requireAssignee: false,
      requireDueDate: false,
      timeTracking: true,
      swimlanes: false,
      archivedCardsRetention: 30,
      defaultCardType: 'TASK',
      defaultPriority: 'MEDIUM',
      workingDays: [1, 2, 3, 4, 5],
      workingHours: { start: '09:00', end: '17:00' }
    },
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-04-26T10:00:00Z'
  }
]

const mockCards: KanbanCard[] = [
  {
    id: 'card-1',
    title: 'Implement user authentication',
    description: 'Add login and registration functionality',
    type: 'FEATURE',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assigneeIds: ['user-1'],
    labelIds: ['label-1'],
    dueDate: '2024-05-01T00:00:00Z',
    estimatedHours: 8,
    actualHours: 5,
    position: 0,
    columnId: 'col-2',
    createdBy: 'user-1',
    createdAt: '2024-04-20T00:00:00Z',
    updatedAt: '2024-04-26T10:00:00Z',
    attachments: [],
    comments: [],
    checklists: [],
    dependencies: [],
    customFields: {}
  }
]

const mockLabels: CardLabel[] = [
  {
    id: 'label-1',
    name: 'Frontend',
    color: '#3B82F6',
    boardId: 'board-1',
    createdAt: '2024-04-01T00:00:00Z'
  }
]

export class KanbanService {
  // Board Management
  static async getBoardsByUserId(userId: string): Promise<KanbanBoard[]> {
    return mockBoards.filter(board => 
      board.members.some(member => member.userId === userId)
    )
  }

  static async getBoardById(boardId: string): Promise<KanbanBoard | null> {
    const board = mockBoards.find(b => b.id === boardId)
    if (!board) return null

    // Load cards for each column
    board.columns = board.columns.map(column => ({
      ...column,
      cards: mockCards.filter(card => card.columnId === column.id)
    }))

    return board
  }

  static async createBoard(data: {
    name: string
    description?: string
    projectId?: string
    teamId?: string
    createdBy: string
  }): Promise<KanbanBoard> {
    const newBoard: KanbanBoard = {
      id: `board-${Date.now()}`,
      name: data.name,
      description: data.description,
      projectId: data.projectId,
      teamId: data.teamId,
      columns: [
        {
          id: `col-${Date.now()}-1`,
          name: 'To Do',
          color: '#6B7280',
          position: 0,
          cards: [],
          isLocked: false
        },
        {
          id: `col-${Date.now()}-2`,
          name: 'In Progress',
          color: '#3B82F6',
          position: 1,
          cards: [],
          isLocked: false
        },
        {
          id: `col-${Date.now()}-3`,
          name: 'Done',
          color: '#10B981',
          position: 2,
          cards: [],
          isLocked: false
        }
      ],
      members: [{
        id: `member-${Date.now()}`,
        userId: data.createdBy,
        boardId: `board-${Date.now()}`,
        role: 'OWNER',
        joinedAt: new Date().toISOString()
      }],
      settings: {
        id: `settings-${Date.now()}`,
        boardId: `board-${Date.now()}`,
        allowCardCreation: true,
        allowCardDeletion: true,
        allowColumnEditing: true,
        requireAssignee: false,
        requireDueDate: false,
        timeTracking: true,
        swimlanes: false,
        archivedCardsRetention: 30,
        defaultCardType: 'TASK',
        defaultPriority: 'MEDIUM',
        workingDays: [1, 2, 3, 4, 5],
        workingHours: { start: '09:00', end: '17:00' }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    mockBoards.push(newBoard)
    return newBoard
  }

  static async updateBoard(boardId: string, data: Partial<KanbanBoard>): Promise<KanbanBoard> {
    const boardIndex = mockBoards.findIndex(board => board.id === boardId)
    if (boardIndex === -1) throw new Error('Board not found')

    mockBoards[boardIndex] = { ...mockBoards[boardIndex], ...data, updatedAt: new Date().toISOString() }
    return mockBoards[boardIndex]
  }

  static async deleteBoard(boardId: string): Promise<void> {
    const boardIndex = mockBoards.findIndex(board => board.id === boardId)
    if (boardIndex === -1) throw new Error('Board not found')

    mockBoards.splice(boardIndex, 1)
  }

  // Column Management
  static async createColumn(data: {
    boardId: string
    name: string
    color: string
    position: number
    wipLimit?: number
  }): Promise<KanbanColumn> {
    const board = mockBoards.find(b => b.id === data.boardId)
    if (!board) throw new Error('Board not found')

    const newColumn: KanbanColumn = {
      id: `col-${Date.now()}`,
      name: data.name,
      color: data.color,
      position: data.position,
      cards: [],
      wipLimit: data.wipLimit,
      isLocked: false
    }

    board.columns.push(newColumn)
    board.updatedAt = new Date().toISOString()
    return newColumn
  }

  static async updateColumn(columnId: string, data: Partial<KanbanColumn>): Promise<KanbanColumn> {
    for (const board of mockBoards) {
      const column = board.columns.find(c => c.id === columnId)
      if (column) {
        Object.assign(column, data)
        board.updatedAt = new Date().toISOString()
        return column
      }
    }
    throw new Error('Column not found')
  }

  static async deleteColumn(columnId: string): Promise<void> {
    for (const board of mockBoards) {
      const columnIndex = board.columns.findIndex(c => c.id === columnId)
      if (columnIndex !== -1) {
        board.columns.splice(columnIndex, 1)
        board.updatedAt = new Date().toISOString()
        return
      }
    }
    throw new Error('Column not found')
  }

  // Card Management
  static async createCard(data: {
    title: string
    description?: string
    type: CardType
    priority: Priority
    columnId: string
    assigneeIds?: string[]
    labelIds?: string[]
    dueDate?: string
    estimatedHours?: number
    createdBy: string
  }): Promise<KanbanCard> {
    const newCard: KanbanCard = {
      id: `card-${Date.now()}`,
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
      status: 'TODO',
      assigneeIds: data.assigneeIds || [],
      labelIds: data.labelIds || [],
      dueDate: data.dueDate,
      estimatedHours: data.estimatedHours,
      position: 0,
      columnId: data.columnId,
      createdBy: data.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: [],
      comments: [],
      checklists: [],
      dependencies: [],
      customFields: {}
    }

    mockCards.push(newCard)
    return newCard
  }

  static async updateCard(cardId: string, data: Partial<KanbanCard>): Promise<KanbanCard> {
    const cardIndex = mockCards.findIndex(card => card.id === cardId)
    if (cardIndex === -1) throw new Error('Card not found')

    mockCards[cardIndex] = { ...mockCards[cardIndex], ...data, updatedAt: new Date().toISOString() }
    return mockCards[cardIndex]
  }

  static async moveCard(cardId: string, fromColumnId: string, toColumnId: string, position: number): Promise<KanbanCard> {
    const card = mockCards.find(c => c.id === cardId)
    if (!card) throw new Error('Card not found')

    card.columnId = toColumnId
    card.position = position
    card.updatedAt = new Date().toISOString()

    // Update status based on column
    const toColumn = mockBoards.flatMap(b => b.columns).find(c => c.id === toColumnId)
    if (toColumn) {
      card.status = this.getColumnStatus(toColumn.name)
    }

    return card
  }

  static async deleteCard(cardId: string): Promise<void> {
    const cardIndex = mockCards.findIndex(card => card.id === cardId)
    if (cardIndex === -1) throw new Error('Card not found')

    mockCards.splice(cardIndex, 1)
  }

  // Label Management
  static async getLabelsByBoardId(boardId: string): Promise<CardLabel[]> {
    return mockLabels.filter(label => label.boardId === boardId)
  }

  static async createLabel(data: {
    boardId: string
    name: string
    color: string
  }): Promise<CardLabel> {
    const newLabel: CardLabel = {
      id: `label-${Date.now()}`,
      boardId: data.boardId,
      name: data.name,
      color: data.color,
      createdAt: new Date().toISOString()
    }

    mockLabels.push(newLabel)
    return newLabel
  }

  // Comments
  static async addComment(data: {
    cardId: string
    content: string
    authorId: string
    mentions?: string[]
  }): Promise<CardComment> {
    const newComment: CardComment = {
      id: `comment-${Date.now()}`,
      cardId: data.cardId,
      content: data.content,
      authorId: data.authorId,
      mentions: data.mentions || [],
      reactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const card = mockCards.find(c => c.id === data.cardId)
    if (card) {
      card.comments.push(newComment)
    }

    return newComment
  }

  // Time Tracking
  static async logTime(data: {
    cardId: string
    userId: string
    hours: number
    description?: string
    date: string
  }): Promise<TimeEntry> {
    const timeEntry: TimeEntry = {
      id: `time-${Date.now()}`,
      cardId: data.cardId,
      userId: data.userId,
      hours: data.hours,
      description: data.description,
      date: data.date,
      createdAt: new Date().toISOString()
    }

    // Update card's actual hours
    const card = mockCards.find(c => c.id === data.cardId)
    if (card) {
      card.actualHours = (card.actualHours || 0) + data.hours
    }

    return timeEntry
  }

  // Statistics
  static async getBoardStatistics(boardId: string): Promise<KanbanStatistics> {
    const board = mockBoards.find(b => b.id === boardId)
    if (!board) throw new Error('Board not found')

    const boardCards = mockCards.filter(card => 
      board.columns.some(column => column.cards.some(c => c.id === card.id))
    )

    const cardsByStatus: Record<CardStatus, number> = {
      BACKLOG: 0,
      TODO: 0,
      IN_PROGRESS: 0,
      REVIEW: 0,
      TESTING: 0,
      DONE: 0,
      BLOCKED: 0
    }

    const cardsByPriority: Record<Priority, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      URGENT: 0
    }

    const cardsByType: Record<CardType, number> = {
      TASK: 0,
      BUG: 0,
      FEATURE: 0,
      EPIC: 0,
      STORY: 0,
      SUBTASK: 0
    }

    let totalEstimatedHours = 0
    let totalActualHours = 0
    let overdueCards = 0

    boardCards.forEach(card => {
      cardsByStatus[card.status]++
      cardsByPriority[card.priority]++
      cardsByType[card.type]++
      
      if (card.estimatedHours) totalEstimatedHours += card.estimatedHours
      if (card.actualHours) totalActualHours += card.actualHours
      
      if (card.dueDate && new Date(card.dueDate) < new Date()) {
        overdueCards++
      }
    })

    return {
      totalCards: boardCards.length,
      cardsByStatus,
      cardsByPriority,
      cardsByType,
      overdueCards,
      completedCards: cardsByStatus.DONE,
      totalEstimatedHours,
      totalActualHours,
      averageCycleTime: 0, // Calculate based on completion data
      burndownData: [] // Generate burndown data
    }
  }

  // Templates
  static async getTemplates(): Promise<KanbanTemplate[]> {
    return [
      {
        id: 'template-1',
        name: 'Basic Kanban',
        description: 'Simple To Do, In Progress, Done workflow',
        category: 'General',
        columns: [
          { id: 't1-col-1', name: 'To Do', color: '#6B7280', position: 0, cards: [], isLocked: false },
          { id: 't1-col-2', name: 'In Progress', color: '#3B82F6', position: 1, cards: [], isLocked: false },
          { id: 't1-col-3', name: 'Done', color: '#10B981', position: 2, cards: [], isLocked: false }
        ],
        labels: [],
        settings: {
          allowCardCreation: true,
          allowCardDeletion: true,
          allowColumnEditing: true,
          requireAssignee: false,
          requireDueDate: false,
          timeTracking: false,
          swimlanes: false,
          archivedCardsRetention: 30,
          defaultCardType: 'TASK',
          defaultPriority: 'MEDIUM',
          workingDays: [1, 2, 3, 4, 5],
          workingHours: { start: '09:00', end: '17:00' }
        },
        isPublic: true,
        createdBy: 'system',
        createdAt: '2024-01-01T00:00:00Z',
        usageCount: 150
      }
    ]
  }

  static async createBoardFromTemplate(templateId: string, boardName: string, createdBy: string): Promise<KanbanBoard> {
    const templates = await this.getTemplates()
    const template = templates.find(t => t.id === templateId)
    if (!template) throw new Error('Template not found')

    return this.createBoard({
      name: boardName,
      description: `Created from ${template.name} template`,
      createdBy
    })
  }

  // Helper methods
  private static getColumnStatus(columnName: string): CardStatus {
    const statusMap: Record<string, CardStatus> = {
      'Backlog': 'BACKLOG',
      'To Do': 'TODO',
      'In Progress': 'IN_PROGRESS',
      'Review': 'REVIEW',
      'Testing': 'TESTING',
      'Done': 'DONE',
      'Blocked': 'BLOCKED'
    }
    return statusMap[columnName] || 'TODO'
  }
}
