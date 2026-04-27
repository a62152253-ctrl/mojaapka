import { User, AccountType } from '../types/index'

const STORAGE_KEYS = {
  authUser: 'devbloxi:auth:user',
  users: 'devbloxi:users',
} as const

const createId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const readStorage = <T>(key: string, fallback: T): T => {
  if (!canUseStorage()) {
    return fallback
  }

  const rawValue = window.localStorage.getItem(key)
  if (!rawValue) {
    return fallback
  }

  try {
    return JSON.parse(rawValue) as T
  } catch (error) {
    console.error(`Failed to parse storage key "${key}":`, error)
    return fallback
  }
}

const writeStorage = <T>(key: string, value: T) => {
  if (!canUseStorage()) {
    return
  }
  window.localStorage.setItem(key, JSON.stringify(value))
}

const fallbackUsers: User[] = [
  {
    id: 'dev-1',
    email: 'developer@example.com',
    username: 'devmaster',
    password: 'dev123',
    accountType: 'DEVELOPER',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    bio: 'Full-stack builder shipping polished React, Next, and dashboard products.',
    createdAt: '2026-04-01T10:00:00.000Z',
    updatedAt: '2026-04-01T10:00:00.000Z',
  },
  {
    id: 'user-1',
    email: 'user@example.com',
    username: 'user123',
    password: 'user123',
    accountType: 'USER',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
    bio: 'Startup founder browsing projects and ready-made product launches.',
    createdAt: '2026-04-04T10:00:00.000Z',
    updatedAt: '2026-04-04T10:00:00.000Z',
  },
]

const ensureUsersSeeded = () => {
  if (!canUseStorage()) {
    return
  }

  if (!window.localStorage.getItem(STORAGE_KEYS.users)) {
    writeStorage(STORAGE_KEYS.users, fallbackUsers)
  }
}

export const getUsers = (): User[] => {
  ensureUsersSeeded()
  return readStorage(STORAGE_KEYS.users, fallbackUsers)
}

export const saveUsers = (users: User[]) => {
  writeStorage(STORAGE_KEYS.users, users)
}

export const getPersistedUser = (): User | null => {
  ensureUsersSeeded()
  return readStorage<User | null>(STORAGE_KEYS.authUser, null)
}

export const persistUserSession = (user: User | null) => {
  if (!canUseStorage()) {
    return
  }

  if (!user) {
    window.localStorage.removeItem(STORAGE_KEYS.authUser)
    window.localStorage.removeItem('token')
    return
  }

  writeStorage(STORAGE_KEYS.authUser, user)
  window.localStorage.setItem('token', `devbloxi-${user.id}`)
}

export const authenticateUser = (email: string, password: string, accountType?: AccountType): User | null => {
  const normalizedEmail = email.trim().toLowerCase()

  return (
    getUsers().find(
      (user) =>
        user.email.toLowerCase() === normalizedEmail &&
        user.password === password &&
        (!accountType || user.accountType === accountType),
    ) ?? null
  )
}

export const registerUser = (input: {
  email: string
  password: string
  username: string
  accountType: AccountType
}): User => {
  const users = getUsers()
  const normalizedEmail = input.email.trim().toLowerCase()
  const normalizedUsername = input.username.trim()

  const emailTaken = users.some((user) => user.email.toLowerCase() === normalizedEmail)
  if (emailTaken) {
    throw new Error('Email already exists')
  }

  const usernameTaken = users.some((user) => user.username.toLowerCase() === normalizedUsername.toLowerCase())
  if (usernameTaken) {
    throw new Error('Username already exists')
  }

  const createdUser: User = {
    id: createId('user'),
    email: normalizedEmail,
    username: normalizedUsername,
    password: input.password,
    accountType: input.accountType,
    avatarUrl: `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(normalizedUsername)}`,
    bio: input.accountType === 'DEVELOPER' ? 'New developer account on DevBloxi.' : 'New buyer account on DevBloxi.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  saveUsers([createdUser, ...users])
  persistUserSession(createdUser)
  return createdUser
}

// Basic conversation management for dashboard
const CONVERSATIONS_KEY = 'devbloxi:conversations'

interface Conversation {
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
  messages: Array<{
    id: string
    conversationId: string
    senderId: string
    senderUsername: string
    body: string
    createdAt: string
  }>
}

const getConversations = (): Conversation[] => {
  try {
    const stored = localStorage.getItem(CONVERSATIONS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export const getUserConversations = (userId: string, accountType: AccountType): Conversation[] => {
  return getConversations().filter(conv => 
    accountType === 'DEVELOPER' ? conv.developerId === userId : conv.clientId === userId
  ).sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
}

export const markConversationAsRead = (conversationId: string, viewerType: AccountType) => {
  const conversations = getConversations()
  const updated = conversations.map(conv => 
    conv.id === conversationId 
      ? {
          ...conv,
          unreadForDeveloper: viewerType === 'DEVELOPER' ? 0 : conv.unreadForDeveloper,
          unreadForClient: viewerType === 'USER' ? 0 : conv.unreadForClient,
        }
      : conv
  )
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(updated))
}

export const sendMarketplaceMessage = (input: {
  projectId: string
  sender: User
  recipient: User
  body: string
}): Conversation => {
  const conversations = getConversations()
  const existingConv = conversations.find(conv => 
    conv.projectId === input.projectId &&
    conv.developerId === (input.sender.accountType === 'DEVELOPER' ? input.sender.id : input.recipient.id) &&
    conv.clientId === (input.sender.accountType === 'USER' ? input.sender.id : input.recipient.id)
  )

  const message = {
    id: createId('message'),
    conversationId: existingConv?.id || createId('conversation'),
    senderId: input.sender.id,
    senderUsername: input.sender.username,
    body: input.body.trim(),
    createdAt: new Date().toISOString(),
  }

  const updatedConv: Conversation = existingConv 
    ? {
        ...existingConv,
        lastMessageAt: message.createdAt,
        unreadForDeveloper: input.sender.accountType === 'USER' ? existingConv.unreadForDeveloper + 1 : 0,
        unreadForClient: input.sender.accountType === 'DEVELOPER' ? existingConv.unreadForClient + 1 : 0,
        messages: [...existingConv.messages, message],
      }
    : {
        id: message.conversationId,
        projectId: input.projectId,
        projectTitle: 'Project',
        developerId: input.sender.accountType === 'DEVELOPER' ? input.sender.id : input.recipient.id,
        developerUsername: input.sender.accountType === 'DEVELOPER' ? input.sender.username : input.recipient.username,
        clientId: input.sender.accountType === 'USER' ? input.sender.id : input.recipient.id,
        clientUsername: input.sender.accountType === 'USER' ? input.sender.username : input.recipient.username,
        lastMessageAt: message.createdAt,
        unreadForDeveloper: input.sender.accountType === 'USER' ? 1 : 0,
        unreadForClient: input.sender.accountType === 'DEVELOPER' ? 1 : 0,
        messages: [message],
      }

  const finalConversations = existingConv 
    ? conversations.map(conv => conv.id === existingConv.id ? updatedConv : conv)
    : [updatedConv, ...conversations]

  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(finalConversations))
  return updatedConv
}

export const getProjectConversations = (projectId: string): Conversation[] => {
  return getConversations().filter(conv => conv.projectId === projectId)
}
