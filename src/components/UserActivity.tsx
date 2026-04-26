import { Clock, MessageSquare, Heart, Eye, ShoppingBag, Star } from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'purchase' | 'like' | 'comment' | 'view' | 'download'
  title: string
  description?: string
  timestamp: string
  metadata?: {
    price?: number
    username?: string
    projectName?: string
  }
}

interface UserActivityProps {
  activities: ActivityItem[]
  loading?: boolean
}

export default function UserActivity({ activities, loading = false }: UserActivityProps) {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'purchase':
        return <ShoppingBag className="w-4 h-4 text-green-400" />
      case 'like':
        return <Heart className="w-4 h-4 text-red-400" />
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-blue-400" />
      case 'view':
        return <Eye className="w-4 h-4 text-purple-400" />
      case 'download':
        return <Star className="w-4 h-4 text-yellow-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'purchase':
        return 'bg-green-500/20 border-green-500/30'
      case 'like':
        return 'bg-red-500/20 border-red-500/30'
      case 'comment':
        return 'bg-blue-500/20 border-blue-500/30'
      case 'view':
        return 'bg-purple-500/20 border-purple-500/30'
      case 'download':
        return 'bg-yellow-500/20 border-yellow-500/30'
      default:
        return 'bg-gray-500/20 border-gray-500/30'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)
      
      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins} minutes ago`
      if (diffHours < 24) return `${diffHours} hours ago`
      if (diffDays < 7) return `${diffDays} days ago`
      return date.toLocaleDateString()
    } catch {
      return 'Just now'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 border border-gray-700 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">No activity yet</h3>
        <p className="text-gray-500">Your recent activity will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-white font-medium">{activity.title}</h4>
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
              
              {activity.description && (
                <p className="text-gray-400 text-sm">{activity.description}</p>
              )}
              
              {activity.metadata && (
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  {activity.metadata.price && (
                    <span className="flex items-center space-x-1">
                      <span>Price:</span>
                      <span className="text-green-400 font-medium">${activity.metadata.price}</span>
                    </span>
                  )}
                  {activity.metadata.username && (
                    <span className="flex items-center space-x-1">
                      <span>From:</span>
                      <span className="text-blue-400">{activity.metadata.username}</span>
                    </span>
                  )}
                  {activity.metadata.projectName && (
                    <span className="flex items-center space-x-1">
                      <span>Project:</span>
                      <span className="text-purple-400">{activity.metadata.projectName}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
