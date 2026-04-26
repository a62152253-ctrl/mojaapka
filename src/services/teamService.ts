import { 
  Team, 
  TeamMember, 
  TeamProject, 
  TeamChannel, 
  TeamMessage, 
  TeamActivity,
  TeamInvite,
  VoiceChannel,
  VideoCall,
  CollaborativeSession,
  TeamSettings,
  TeamRole,
  ChannelType,
  MessageType,
  ActivityType,
  CallStatus
} from '../types/team'
import { User, Project } from '../types'

// Mock data for development
const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Frontend Squad',
    description: 'Building amazing user experiences',
    avatar: '/teams/frontend-squad.png',
    ownerId: 'user-1',
    members: [
      {
        id: 'member-1',
        userId: 'user-1',
        teamId: 'team-1',
        role: 'OWNER',
        user: { id: 'user-1', username: 'alice', email: 'alice@example.com', accountType: 'DEVELOPER', createdAt: '', updatedAt: '' },
        joinedAt: '2024-01-01T00:00:00Z',
        lastActiveAt: '2024-04-26T10:00:00Z',
        isOnline: true
      },
      {
        id: 'member-2',
        userId: 'user-2',
        teamId: 'team-1',
        role: 'DEVELOPER',
        user: { id: 'user-2', username: 'bob', email: 'bob@example.com', accountType: 'DEVELOPER', createdAt: '', updatedAt: '' },
        joinedAt: '2024-01-02T00:00:00Z',
        lastActiveAt: '2024-04-26T09:30:00Z',
        isOnline: true
      }
    ],
    projects: [],
    inviteCode: 'FRONTEND123',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-04-26T10:00:00Z'
  }
]

const mockChannels: TeamChannel[] = [
  {
    id: 'channel-1',
    teamId: 'team-1',
    name: 'general',
    type: 'GENERAL',
    description: 'General team discussions',
    createdBy: 'user-1',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'channel-2',
    teamId: 'team-1',
    name: 'code-review',
    type: 'CODE_REVIEW',
    description: 'Code reviews and feedback',
    createdBy: 'user-1',
    createdAt: '2024-01-01T00:00:00Z'
  }
]

const mockMessages: TeamMessage[] = [
  {
    id: 'msg-1',
    channelId: 'channel-1',
    senderId: 'user-1',
    content: 'Welcome to the team! 👋',
    type: 'TEXT',
    createdAt: '2024-04-26T09:00:00Z',
    updatedAt: '2024-04-26T09:00:00Z'
  },
  {
    id: 'msg-2',
    channelId: 'channel-1',
    senderId: 'user-2',
    content: 'Excited to work with everyone!',
    type: 'TEXT',
    createdAt: '2024-04-26T09:05:00Z',
    updatedAt: '2024-04-26T09:05:00Z'
  }
]

export class TeamService {
  // Team Management
  static async getTeamsByUserId(userId: string): Promise<Team[]> {
    return mockTeams.filter(team => 
      team.members.some(member => member.userId === userId)
    )
  }

  static async getTeamById(teamId: string): Promise<Team | null> {
    return mockTeams.find(team => team.id === teamId) || null
  }

  static async createTeam(data: {
    name: string
    description: string
    ownerId: string
  }): Promise<Team> {
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: data.name,
      description: data.description,
      ownerId: data.ownerId,
      members: [{
        id: `member-${Date.now()}`,
        userId: data.ownerId,
        teamId: `team-${Date.now()}`,
        role: 'OWNER',
        user: { id: data.ownerId, username: 'owner', email: 'owner@example.com', accountType: 'DEVELOPER', createdAt: '', updatedAt: '' },
        joinedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        isOnline: true
      }],
      projects: [],
      inviteCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    mockTeams.push(newTeam)
    return newTeam
  }

  static async updateTeam(teamId: string, data: Partial<Team>): Promise<Team> {
    const teamIndex = mockTeams.findIndex(team => team.id === teamId)
    if (teamIndex === -1) throw new Error('Team not found')
    
    mockTeams[teamIndex] = { ...mockTeams[teamIndex], ...data, updatedAt: new Date().toISOString() }
    return mockTeams[teamIndex]
  }

  static async deleteTeam(teamId: string): Promise<void> {
    const teamIndex = mockTeams.findIndex(team => team.id === teamId)
    if (teamIndex === -1) throw new Error('Team not found')
    
    mockTeams.splice(teamIndex, 1)
  }

  // Member Management
  static async addMember(teamId: string, userId: string, role: TeamRole): Promise<TeamMember> {
    const team = mockTeams.find(t => t.id === teamId)
    if (!team) throw new Error('Team not found')

    const newMember: TeamMember = {
      id: `member-${Date.now()}`,
      userId,
      teamId,
      role,
      user: { id: userId, username: 'newuser', email: 'new@example.com', accountType: 'DEVELOPER', createdAt: '', updatedAt: '' },
      joinedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      isOnline: false
    }

    team.members.push(newMember)
    team.updatedAt = new Date().toISOString()
    return newMember
  }

  static async removeMember(teamId: string, userId: string): Promise<void> {
    const team = mockTeams.find(t => t.id === teamId)
    if (!team) throw new Error('Team not found')

    team.members = team.members.filter(member => member.userId !== userId)
    team.updatedAt = new Date().toISOString()
  }

  static async updateMemberRole(teamId: string, userId: string, role: TeamRole): Promise<TeamMember> {
    const team = mockTeams.find(t => t.id === teamId)
    if (!team) throw new Error('Team not found')

    const member = team.members.find(m => m.userId === userId)
    if (!member) throw new Error('Member not found')

    member.role = role
    team.updatedAt = new Date().toISOString()
    return member
  }

  // Channel Management
  static async getChannelsByTeamId(teamId: string): Promise<TeamChannel[]> {
    return mockChannels.filter(channel => channel.teamId === teamId)
  }

  static async createChannel(data: {
    teamId: string
    name: string
    type: ChannelType
    description?: string
    createdBy: string
  }): Promise<TeamChannel> {
    const newChannel: TeamChannel = {
      id: `channel-${Date.now()}`,
      teamId: data.teamId,
      name: data.name,
      type: data.type,
      description: data.description,
      createdBy: data.createdBy,
      createdAt: new Date().toISOString()
    }

    mockChannels.push(newChannel)
    return newChannel
  }

  // Message Management
  static async getMessagesByChannelId(channelId: string, limit = 50): Promise<TeamMessage[]> {
    return mockMessages
      .filter(msg => msg.channelId === channelId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(0, limit)
  }

  static async sendMessage(data: {
    channelId: string
    senderId: string
    content: string
    type: MessageType
    metadata?: any
  }): Promise<TeamMessage> {
    const newMessage: TeamMessage = {
      id: `msg-${Date.now()}`,
      channelId: data.channelId,
      senderId: data.senderId,
      content: data.content,
      type: data.type,
      metadata: data.metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    mockMessages.push(newMessage)
    return newMessage
  }

  // Activity Management
  static async getTeamActivities(teamId: string, limit = 20): Promise<TeamActivity[]> {
    return [] // Implement activity tracking
  }

  static async logActivity(data: {
    teamId: string
    userId: string
    type: ActivityType
    description: string
    metadata?: any
  }): Promise<TeamActivity> {
    const activity: TeamActivity = {
      id: `activity-${Date.now()}`,
      teamId: data.teamId,
      userId: data.userId,
      type: data.type,
      description: data.description,
      metadata: data.metadata,
      createdAt: new Date().toISOString()
    }

    // Store activity (in real app, this would save to database)
    return activity
  }

  // Voice/Video Calls
  static async startVoiceCall(data: {
    teamId: string
    channelId?: string
    initiatedBy: string
    maxParticipants?: number
  }): Promise<VoiceChannel> {
    const voiceChannel: VoiceChannel = {
      id: `voice-${Date.now()}`,
      teamId: data.teamId,
      name: `Voice Call ${new Date().toLocaleTimeString()}`,
      participants: [data.initiatedBy],
      maxParticipants: data.maxParticipants || 10,
      isLocked: false,
      createdAt: new Date().toISOString()
    }

    return voiceChannel
  }

  static async startVideoCall(data: {
    teamId: string
    channelId?: string
    initiatedBy: string
  }): Promise<VideoCall> {
    const videoCall: VideoCall = {
      id: `video-${Date.now()}`,
      teamId: data.teamId,
      channelId: data.channelId,
      initiatedBy: data.initiatedBy,
      participants: [data.initiatedBy],
      status: 'WAITING',
      startedAt: new Date().toISOString()
    }

    return videoCall
  }

  // Collaborative Editing
  static async startCollaborativeSession(data: {
    projectId: string
    teamId: string
    participants: string[]
    language: string
    content: string
  }): Promise<CollaborativeSession> {
    const session: CollaborativeSession = {
      id: `session-${Date.now()}`,
      projectId: data.projectId,
      teamId: data.teamId,
      participants: data.participants,
      language: data.language,
      content: data.content,
      cursorPositions: {},
      selections: {},
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString()
    }

    return session
  }

  static async updateCollaborativeSession(sessionId: string, data: {
    content?: string
    cursorPositions?: Record<string, any>
    selections?: Record<string, any>
  }): Promise<CollaborativeSession> {
    // Update session logic
    throw new Error('Not implemented')
  }

  // Team Settings
  static async getTeamSettings(teamId: string): Promise<TeamSettings> {
    return {
      id: `settings-${teamId}`,
      teamId,
      allowInvites: true,
      requireApproval: false,
      defaultMemberRole: 'DEVELOPER',
      maxMembers: 50,
      retentionDays: 90,
      integrations: {
        github: {
          enabled: false,
          repositories: []
        },
        slack: {
          enabled: false
        },
        discord: {
          enabled: false
        }
      }
    }
  }

  static async updateTeamSettings(teamId: string, settings: Partial<TeamSettings>): Promise<TeamSettings> {
    const currentSettings = await this.getTeamSettings(teamId)
    return { ...currentSettings, ...settings }
  }
}
