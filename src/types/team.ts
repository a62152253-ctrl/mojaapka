export interface Team {
  id: string
  name: string
  description: string
  avatar?: string
  ownerId: string
  members: TeamMember[]
  projects: TeamProject[]
  inviteCode: string
  createdAt: string
  updatedAt: string
}

export interface TeamMember {
  id: string
  userId: string
  teamId: string
  role: TeamRole
  user: User
  joinedAt: string
  lastActiveAt: string
  isOnline: boolean
}

export type TeamRole = 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'VIEWER'

export interface TeamProject {
  id: string
  teamId: string
  projectId: string
  project: Project
  addedAt: string
  addedBy: string
}

export interface TeamChannel {
  id: string
  teamId: string
  name: string
  type: ChannelType
  description?: string
  createdBy: string
  createdAt: string
}

export type ChannelType = 'GENERAL' | 'PROJECT' | 'CODE_REVIEW' | 'DEPLOYMENT'

export interface TeamMessage {
  id: string
  channelId: string
  senderId: string
  content: string
  type: MessageType
  metadata?: MessageMetadata
  createdAt: string
  updatedAt: string
  reactions?: MessageReaction[]
  threadId?: string
}

export type MessageType = 'TEXT' | 'CODE' | 'FILE' | 'IMAGE' | 'LINK' | 'MENTION'

export interface MessageMetadata {
  codeLanguage?: string
  fileName?: string
  fileSize?: number
  fileType?: string
  linkPreview?: LinkPreview
  mentionedUsers?: string[]
}

export interface LinkPreview {
  url: string
  title: string
  description: string
  image?: string
}

export interface MessageReaction {
  id: string
  messageId: string
  userId: string
  emoji: string
  createdAt: string
}

export interface TeamActivity {
  id: string
  teamId: string
  userId: string
  type: ActivityType
  description: string
  metadata?: ActivityMetadata
  createdAt: string
}

export type ActivityType = 
  | 'MEMBER_JOINED' 
  | 'MEMBER_LEFT' 
  | 'PROJECT_ADDED' 
  | 'PROJECT_UPDATED' 
  | 'CODE_COMMIT' 
  | 'DEPLOYMENT_STARTED' 
  | 'DEPLOYMENT_COMPLETED' 
  | 'CODE_REVIEW_REQUESTED' 
  | 'CODE_REVIEW_COMPLETED'

export interface ActivityMetadata {
  projectId?: string
  projectName?: string
  commitHash?: string
  commitMessage?: string
  deploymentUrl?: string
  reviewId?: string
  reviewStatus?: string
}

export interface TeamInvite {
  id: string
  teamId: string
  invitedBy: string
  invitedEmail: string
  role: TeamRole
  token: string
  expiresAt: string
  createdAt: string
}

export interface VoiceChannel {
  id: string
  teamId: string
  name: string
  participants: string[]
  maxParticipants: number
  isLocked: boolean
  createdAt: string
}

export interface VideoCall {
  id: string
  teamId: string
  channelId?: string
  initiatedBy: string
  participants: string[]
  status: CallStatus
  startedAt: string
  endedAt?: string
  recordingUrl?: string
}

export type CallStatus = 'WAITING' | 'ACTIVE' | 'ENDED' | 'FAILED'

export interface ScreenShare {
  id: string
  callId: string
  userId: string
  isActive: boolean
  startedAt: string
  endedAt?: string
}

export interface CollaborativeSession {
  id: string
  projectId: string
  teamId: string
  participants: string[]
  activeFile?: string
  language: string
  content: string
  cursorPositions: Record<string, CursorPosition>
  selections: Record<string, Selection>
  createdAt: string
  lastActivityAt: string
}

export interface CursorPosition {
  userId: string
  line: number
  column: number
  color: string
}

export interface Selection {
  userId: string
  start: { line: number; column: number }
  end: { line: number; column: number }
  color: string
}

export interface TeamSettings {
  id: string
  teamId: string
  allowInvites: boolean
  requireApproval: boolean
  defaultMemberRole: TeamRole
  maxMembers: number
  retentionDays: number
  integrations: TeamIntegrations
}

export interface TeamIntegrations {
  github?: {
    enabled: boolean
    repositories: string[]
    webhookUrl?: string
  }
  slack?: {
    enabled: boolean
    webhookUrl?: string
    channelId?: string
  }
  discord?: {
    enabled: boolean
    webhookUrl?: string
    channelId?: string
  }
}

// Re-export User from main types
import { User, Project } from './index'
