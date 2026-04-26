import React, { useState, useEffect } from 'react'
import { 
  Users, 
  MessageSquare, 
  Video, 
  Phone, 
  Settings, 
  Plus,
  Search,
  Hash,
  Lock,
  Volume2,
  Activity,
  Calendar,
  Code,
  FileText,
  Zap
} from 'lucide-react'
import { Team, TeamMember, TeamChannel, TeamMessage, TeamActivity } from '../../types/team'
import { TeamService } from '../../services/teamService'
import { User } from '../../types'

interface TeamDashboardProps {
  user: User
  selectedTeam?: Team
  onTeamSelect?: (team: Team) => void
}

export default function TeamDashboard({ user, selectedTeam, onTeamSelect }: TeamDashboardProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [currentTeam, setCurrentTeam] = useState<Team | null>(selectedTeam || null)
  const [channels, setChannels] = useState<TeamChannel[]>([])
  const [messages, setMessages] = useState<Record<string, TeamMessage[]>>({})
  const [activities, setActivities] = useState<TeamActivity[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeChannel, setActiveChannel] = useState<TeamChannel | null>(null)

  useEffect(() => {
    loadTeams()
  }, [user.id])

  useEffect(() => {
    if (currentTeam) {
      loadTeamData()
    }
  }, [currentTeam])

  const loadTeams = async () => {
    try {
      const userTeams = await TeamService.getTeamsByUserId(user.id)
      setTeams(userTeams)
      if (userTeams.length > 0 && !currentTeam) {
        setCurrentTeam(userTeams[0])
      }
    } catch (error) {
      console.error('Failed to load teams:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTeamData = async () => {
    if (!currentTeam) return

    try {
      const [teamChannels, teamActivities] = await Promise.all([
        TeamService.getChannelsByTeamId(currentTeam.id),
        TeamService.getTeamActivities(currentTeam.id)
      ])

      setChannels(teamChannels)
      setActivities(teamActivities)

      // Load messages for each channel
      const channelMessages: Record<string, TeamMessage[]> = {}
      for (const channel of teamChannels) {
        const channelMsgs = await TeamService.getMessagesByChannelId(channel.id)
        channelMessages[channel.id] = channelMsgs
      }
      setMessages(channelMessages)

      // Set first channel as active
      if (teamChannels.length > 0 && !activeChannel) {
        setActiveChannel(teamChannels[0])
      }
    } catch (error) {
      console.error('Failed to load team data:', error)
    }
  }

  const handleTeamChange = (team: Team) => {
    setCurrentTeam(team)
    setActiveChannel(null)
    onTeamSelect?.(team)
  }

  const handleCreateTeam = async () => {
    const name = prompt('Enter team name:')
    if (!name) return

    const description = prompt('Enter team description:')
    if (!description) return

    try {
      const newTeam = await TeamService.createTeam({
        name,
        description,
        ownerId: user.id
      })
      setTeams([...teams, newTeam])
      setCurrentTeam(newTeam)
    } catch (error) {
      console.error('Failed to create team:', error)
    }
  }

  const handleCreateChannel = async () => {
    if (!currentTeam) return

    const name = prompt('Enter channel name:')
    if (!name) return

    const type = prompt('Enter channel type (GENERAL/PROJECT/CODE_REVIEW/DEPLOYMENT):') as any
    if (!type) return

    try {
      await TeamService.createChannel({
        teamId: currentTeam.id,
        name,
        type,
        description: '',
        createdBy: user.id
      })
      loadTeamData()
    } catch (error) {
      console.error('Failed to create channel:', error)
    }
  }

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const onlineMembers = currentTeam?.members.filter(member => member.isOnline) || []
  const unreadCount = Object.values(messages).reduce((total, channelMessages) => 
    total + channelMessages.filter(msg => !msg.read).length, 0
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Teams Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Teams</h2>
            <button
              onClick={handleCreateTeam}
              className="p-1 hover:bg-gray-700 rounded"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="p-2">
          {filteredTeams.map(team => (
            <button
              key={team.id}
              onClick={() => handleTeamChange(team)}
              className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${
                currentTeam?.id === team.id
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  {team.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{team.name}</p>
                  <p className="text-xs opacity-75">{team.members.length} members</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {currentTeam ? (
          <>
            {/* Channels Sidebar */}
            <div className="w-60 bg-gray-800 border-r border-gray-700">
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{currentTeam.name}</h3>
                  <button
                    onClick={handleCreateChannel}
                    className="p-1 hover:bg-gray-700 rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-2">
                <div className="mb-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Channels</p>
                  {channels.map(channel => (
                    <button
                      key={channel.id}
                      onClick={() => setActiveChannel(channel)}
                      className={`w-full text-left p-2 rounded mb-1 transition-colors ${
                        activeChannel?.id === channel.id
                          ? 'bg-gray-700 text-white'
                          : 'hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        {channel.type === 'GENERAL' && <Hash className="w-4 h-4 mr-2" />}
                        {channel.type === 'CODE_REVIEW' && <Code className="w-4 h-4 mr-2" />}
                        {channel.type === 'DEPLOYMENT' && <Zap className="w-4 h-4 mr-2" />}
                        {channel.type === 'PROJECT' && <FileText className="w-4 h-4 mr-2" />}
                        {channel.name}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Team Members</p>
                  {currentTeam.members.map(member => (
                    <div key={member.id} className="flex items-center p-2">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        member.isOnline ? 'bg-green-500' : 'bg-gray-500'
                      }`} />
                      <span className="text-sm">{member.user.username}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Quick Actions</p>
                  <div className="space-y-1">
                    <button className="w-full text-left p-2 hover:bg-gray-700 rounded text-sm flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Start Voice Call
                    </button>
                    <button className="w-full text-left p-2 hover:bg-gray-700 rounded text-sm flex items-center">
                      <Video className="w-4 h-4 mr-2" />
                      Start Video Call
                    </button>
                    <button className="w-full text-left p-2 hover:bg-gray-700 rounded text-sm flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Team Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {activeChannel ? (
                <>
                  <div className="p-4 border-b border-gray-700 bg-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {activeChannel.type === 'GENERAL' && <Hash className="w-5 h-5 mr-2" />}
                        {activeChannel.type === 'CODE_REVIEW' && <Code className="w-5 h-5 mr-2" />}
                        {activeChannel.type === 'DEPLOYMENT' && <Zap className="w-5 h-5 mr-2" />}
                        {activeChannel.type === 'PROJECT' && <FileText className="w-5 h-5 mr-2" />}
                        <h3 className="font-semibold">{activeChannel.name}</h3>
                        {activeChannel.description && (
                          <span className="ml-2 text-sm text-gray-400">{activeChannel.description}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">
                          {onlineMembers.length} online
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto">
                    {messages[activeChannel.id]?.map(message => (
                      <div key={message.id} className="mb-4">
                        <div className="flex items-start">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                            {message.senderId.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center mb-1">
                              <span className="font-medium mr-2">
                                {currentTeam.members.find(m => m.userId === message.senderId)?.user.username}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(message.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="text-gray-200">
                              {message.type === 'TEXT' && message.content}
                              {message.type === 'CODE' && (
                                <pre className="bg-gray-800 p-2 rounded text-sm overflow-x-auto">
                                  <code>{message.content}</code>
                                </pre>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-gray-700 bg-gray-800">
                    <div className="flex items-center">
                      <input
                        type="text"
                        placeholder={`Message #${activeChannel.name}`}
                        className="flex-1 bg-gray-700 rounded-lg px-4 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700">
                        <MessageSquare className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Hash className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                    <h3 className="text-lg font-semibold mb-2">Select a channel</h3>
                    <p className="text-gray-400">Choose a channel from the sidebar to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold mb-2">No team selected</h3>
              <p className="text-gray-400 mb-4">Select a team or create a new one to get started</p>
              <button
                onClick={handleCreateTeam}
                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Create Team
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
