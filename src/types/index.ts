export type AccountType = 'USER' | 'DEVELOPER'
export type ProjectStatus = 'DRAFT' | 'PUBLISHED' | 'SOLD'
export type DealStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED'
export type DealType = 'BUY' | 'LICENSE'

export interface User {
  id: string
  email: string
  username: string
  password?: string
  accountType: AccountType
  avatar?: string
  avatarUrl?: string
  bio?: string
  createdAt: string
  updatedAt: string
}

export interface ProjectFile {
  id?: string
  name: string
  content: string
  language: string
}

export interface Project {
  id: string
  title: string
  description: string
  slug: string
  price: number
  basePrice?: number
  category: string
  tags: string[]
  demoUrl?: string
  githubUrl?: string
  images: string[]
  thumbnailUrl?: string
  status: ProjectStatus
  authorId: string
  author: User
  likes: Like[]
  likesCount?: number
  comments: Comment[]
  commentsCount?: number
  deals: Deal[]
  files?: ProjectFile[]
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  content: string
  userId: string
  projectId: string
  user: User
  project?: Project
  createdAt: string
  updatedAt: string
}

export interface Like {
  id: string
  userId: string
  projectId: string
  user?: User
  project?: Project
  createdAt: string
}

export interface Deal {
  id: string
  price: number
  status: DealStatus
  type: DealType
  message?: string
  buyerId: string
  sellerId: string
  projectId: string
  buyer?: User
  seller?: User
  project: Project
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderUsername: string
  body: string
  createdAt: string
}

export interface Conversation {
  id: string
  projectId: string
  projectTitle: string
  developerId: string
  developerUsername: string
  clientId: string
  clientUsername: string
  lastMessageAt: string
  unreadForDeveloper: number
  unreadForClient: number
  messages: ChatMessage[]
}

export interface AuthResponse {
  user: User
  token: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
