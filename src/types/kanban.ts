export interface KanbanBoard {
  id: string
  name: string
  description?: string
  projectId?: string
  teamId?: string
  columns: KanbanColumn[]
  members: BoardMember[]
  settings: KanbanSettings
  createdAt: string
  updatedAt: string
}

export interface KanbanColumn {
  id: string
  name: string
  description?: string
  color: string
  position: number
  cards: KanbanCard[]
  wipLimit?: number
  isLocked: boolean
}

export interface KanbanCard {
  id: string
  title: string
  description?: string
  type: CardType
  priority: Priority
  status: CardStatus
  assigneeIds: string[]
  labelIds: string[]
  dueDate?: string
  startDate?: string
  estimatedHours?: number
  actualHours?: number
  position: number
  columnId: string
  createdBy: string
  createdAt: string
  updatedAt: string
  attachments: CardAttachment[]
  comments: CardComment[]
  checklists: CardChecklist[]
  dependencies: CardDependency[]
  customFields: Record<string, any>
}

export type CardType = 'TASK' | 'BUG' | 'FEATURE' | 'EPIC' | 'STORY' | 'SUBTASK'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type CardStatus = 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'TESTING' | 'DONE' | 'BLOCKED'

export interface BoardMember {
  id: string
  userId: string
  boardId: string
  role: BoardRole
  joinedAt: string
}

export type BoardRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'

export interface CardLabel {
  id: string
  name: string
  color: string
  boardId: string
  createdAt: string
}

export interface CardAttachment {
  id: string
  cardId: string
  name: string
  url: string
  type: AttachmentType
  size: number
  uploadedBy: string
  uploadedAt: string
}

export type AttachmentType = 'IMAGE' | 'DOCUMENT' | 'CODE' | 'LINK' | 'OTHER'

export interface CardComment {
  id: string
  cardId: string
  content: string
  authorId: string
  createdAt: string
  updatedAt: string
  mentions: string[]
  reactions: CommentReaction[]
}

export interface CommentReaction {
  id: string
  commentId: string
  userId: string
  emoji: string
  createdAt: string
}

export interface CardChecklist {
  id: string
  cardId: string
  title: string
  items: ChecklistItem[]
  createdAt: string
}

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
  assigneeId?: string
  dueDate?: string
  createdAt: string
  completedAt?: string
}

export interface CardDependency {
  id: string
  cardId: string
  dependsOnCardId: string
  type: DependencyType
  createdAt: string
}

export type DependencyType = 'BLOCKS' | 'DEPENDS_ON' | 'RELATED_TO'

export interface KanbanSettings {
  id: string
  boardId: string
  allowCardCreation: boolean
  allowCardDeletion: boolean
  allowColumnEditing: boolean
  requireAssignee: boolean
  requireDueDate: boolean
  timeTracking: boolean
  swimlanes: boolean
  archivedCardsRetention: number
  defaultCardType: CardType
  defaultPriority: Priority
  workingDays: number[]
  workingHours: {
    start: string
    end: string
  }
}

export interface KanbanActivity {
  id: string
  boardId: string
  userId: string
  cardId?: string
  type: ActivityType
  description: string
  metadata?: ActivityMetadata
  createdAt: string
}

export type ActivityType = 
  | 'CARD_CREATED'
  | 'CARD_UPDATED'
  | 'CARD_MOVED'
  | 'CARD_DELETED'
  | 'CARD_ASSIGNED'
  | 'CARD_UNASSIGNED'
  | 'COMMENT_ADDED'
  | 'ATTACHMENT_ADDED'
  | 'CHECKLIST_CREATED'
  | 'CHECKLIST_ITEM_COMPLETED'
  | 'COLUMN_CREATED'
  | 'COLUMN_UPDATED'
  | 'LABEL_ADDED'
  | 'DEPENDENCY_ADDED'
  | 'DUE_DATE_CHANGED'
  | 'TIME_LOGGED'

export interface ActivityMetadata {
  fromColumn?: string
  toColumn?: string
  oldValue?: any
  newValue?: any
  assigneeId?: string
  fileName?: string
  checklistTitle?: string
  itemName?: string
  hours?: number
}

export interface KanbanTemplate {
  id: string
  name: string
  description: string
  category: string
  columns: KanbanColumn[]
  labels: CardLabel[]
  settings: Partial<KanbanSettings>
  isPublic: boolean
  createdBy: string
  createdAt: string
  usageCount: number
}

export interface KanbanFilter {
  id: string
  name: string
  boardId: string
  filters: {
    assignees?: string[]
    labels?: string[]
    priorities?: Priority[]
    types?: CardType[]
    dueDate?: {
      from?: string
      to?: string
    }
    createdDate?: {
      from?: string
      to?: string
    }
  }
  sortBy: SortOption
  sortOrder: 'asc' | 'desc'
  createdBy: string
  createdAt: string
}

export type SortOption = 
  | 'created_at'
  | 'updated_at'
  | 'due_date'
  | 'priority'
  | 'title'
  | 'assignee'

export interface KanbanView {
  id: string
  name: string
  boardId: string
  type: ViewType
  filters?: KanbanFilter
  groupBy?: GroupOption
  sortBy?: SortOption
  isDefault: boolean
  createdBy: string
  createdAt: string
}

export type ViewType = 'BOARD' | 'LIST' | 'CALENDAR' | 'TIMELINE' | 'STATISTICS'
export type GroupOption = 'NONE' | 'ASSIGNEE' | 'PRIORITY' | 'TYPE' | 'LABEL' | 'DUE_DATE'

export interface TimeEntry {
  id: string
  cardId: string
  userId: string
  hours: number
  description?: string
  date: string
  createdAt: string
}

export interface KanbanStatistics {
  totalCards: number
  cardsByStatus: Record<CardStatus, number>
  cardsByPriority: Record<Priority, number>
  cardsByType: Record<CardType, number>
  overdueCards: number
  completedCards: number
  totalEstimatedHours: number
  totalActualHours: number
  averageCycleTime: number
  burndownData: BurndownPoint[]
}

export interface BurndownPoint {
  date: string
  ideal: number
  actual: number
}

export interface Sprint {
  id: string
  boardId: string
  name: string
  description?: string
  startDate: string
  endDate: string
  status: SprintStatus
  goal?: string
  cardIds: string[]
  completedCardIds: string[]
  createdAt: string
  updatedAt: string
}

export type SprintStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
