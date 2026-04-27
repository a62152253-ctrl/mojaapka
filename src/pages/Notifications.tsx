import { useState, useEffect } from 'react'
import { Bell, Check, X, DollarSign, MessageSquare, Heart, AlertCircle, Settings, Filter, Search, Calendar, Clock, Star, Users, Zap, ExternalLink, Reply, Forward, Archive, Trash2, Eye, FolderOpen, Briefcase } from 'lucide-react'

type NotificationType = 'sale' | 'comment' | 'like' | 'system' | 'follow' | 'workspace' | 'project'

interface Notification {
  id: number
  type: NotificationType
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  priority?: 'low' | 'medium' | 'high'
  sender?: {
    name: string
    avatar?: string
    username: string
  }
  metadata?: {
    amount?: number
    rating?: number
    projectName?: string
    commentId?: number
  }
  actions?: {
    reply?: boolean
    forward?: boolean
    archive?: boolean
  }
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'sale',
      title: 'New Sale!',
      message: 'Your React Dashboard Template was purchased by john_doe',
      timestamp: '2 minutes ago',
      read: false,
      priority: 'high',
      actionUrl: '/dashboard/sales',
      metadata: {
        amount: 29,
        projectName: 'React Dashboard Template'
      },
      sender: {
        name: 'John Doe',
        username: 'john_doe'
      }
    },
    {
      id: 2,
      type: 'comment',
      title: 'New Comment',
      message: 'Sarah left a comment on your E-commerce Components: "Great work! This saved me hours of development time."',
      timestamp: '1 hour ago',
      read: false,
      priority: 'medium',
      actionUrl: '/project/123/comments',
      metadata: {
        commentId: 456,
        projectName: 'E-commerce Components'
      },
      sender: {
        name: 'Sarah Johnson',
        username: 'sarah_j',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
      },
      actions: {
        reply: true,
        forward: true
      }
    },
    {
      id: 3,
      type: 'like',
      title: 'New Like',
      message: 'Mike liked your Useless React Hooks',
      timestamp: '3 hours ago',
      read: true,
      priority: 'low',
      actionUrl: '/project/456',
      metadata: {
        projectName: 'Useless React Hooks'
      },
      sender: {
        name: 'Mike Chen',
        username: 'mike_c'
      }
    },
    {
      id: 4,
      type: 'system',
      title: 'System Update',
      message: 'New features have been added to the marketplace including advanced search and better filtering options.',
      timestamp: '1 day ago',
      read: true,
      priority: 'medium',
      actionUrl: '/updates'
    },
    {
      id: 5,
      type: 'follow',
      title: 'New Follower',
      message: 'Emma started following your work. She has purchased 5 items from the marketplace.',
      timestamp: '2 days ago',
      read: true,
      priority: 'low',
      actionUrl: '/user/emma',
      sender: {
        name: 'Emma Wilson',
        username: 'emma_w',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma'
      }
    },
    {
      id: 6,
      type: 'sale',
      title: 'Another Sale!',
      message: 'Your Dark Theme Pack was purchased by developer_pro',
      timestamp: '3 days ago',
      read: true,
      priority: 'high',
      actionUrl: '/dashboard/sales',
      metadata: {
        amount: 5,
        projectName: 'Dark Theme Pack'
      },
      sender: {
        name: 'Developer Pro',
        username: 'developer_pro'
      }
    },
    {
      id: 7,
      type: 'comment',
      title: 'Review Received',
      message: 'Alex left a 5-star review on your Next.js Blog Template: "Excellent template, well documented and easy to customize!"',
      timestamp: '4 days ago',
      read: false,
      priority: 'high',
      actionUrl: '/project/789/reviews',
      metadata: {
        rating: 5,
        projectName: 'Next.js Blog Template',
        commentId: 789
      },
      sender: {
        name: 'Alex Thompson',
        username: 'alex_t'
      },
      actions: {
        reply: true
      }
    },
    {
      id: 8,
      type: 'workspace',
      title: 'Workspace Invitation',
      message: 'Sarah invited you to collaborate on the E-commerce Redesign workspace',
      timestamp: '5 minutes ago',
      read: false,
      priority: 'high',
      actionUrl: '/live-workspace',
      sender: {
        name: 'Sarah Johnson',
        username: 'sarah_j',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
      },
      actions: {
        reply: true,
        forward: true
      }
    },
    {
      id: 9,
      type: 'project',
      title: 'Project Created Successfully',
      message: 'Your new project "Client Dashboard" has been created and is now available in your workspace',
      timestamp: '10 minutes ago',
      read: false,
      priority: 'medium',
      actionUrl: '/live-workspace',
      metadata: {
        projectName: 'Client Dashboard'
      }
    },
    {
      id: 10,
      type: 'workspace',
      title: 'Live Session Started',
      message: 'Mike started a live coding session in the React Components workspace',
      timestamp: '30 minutes ago',
      read: true,
      priority: 'low',
      actionUrl: '/live-workspace',
      sender: {
        name: 'Mike Chen',
        username: 'mike_c'
      }
    }
  ])

  const [filter, setFilter] = useState<'all' | 'unread' | 'sales' | 'social' | 'workspace'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: false,
    salesAlerts: true,
    commentAlerts: true,
    followAlerts: true,
    systemUpdates: true
  })
  const [archivedNotifications, setArchivedNotifications] = useState<number[]>([])

  const getNotificationIcon = (type: NotificationType, priority?: string) => {
    const iconClass = priority === 'high' ? 'text-red-600' : 
                      priority === 'medium' ? 'text-yellow-600' : 'text-gray-600'
    
    switch (type) {
      case 'sale':
        return <DollarSign className={`w-5 h-5 ${iconClass}`} />
      case 'comment':
        return <MessageSquare className={`w-5 h-5 ${iconClass}`} />
      case 'like':
        return <Heart className={`w-5 h-5 ${iconClass}`} />
      case 'system':
        return <AlertCircle className={`w-5 h-5 ${iconClass}`} />
      case 'follow':
        return <Users className={`w-5 h-5 ${iconClass}`} />
      case 'workspace':
        return <FolderOpen className={`w-5 h-5 ${iconClass}`} />
      case 'project':
        return <Briefcase className={`w-5 h-5 ${iconClass}`} />
      default:
        return <Bell className={`w-5 h-5 ${iconClass}`} />
    }
  }

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const markAsUnread = (id: number) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: false } : notif
      )
    )
  }

  const toggleNotificationSelection = (id: number) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(notifId => notifId !== id)
        : [...prev, id]
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
    setSelectedNotifications(prev => prev.filter(notifId => notifId !== id))
  }

  const archiveNotification = (id: number) => {
    setArchivedNotifications(prev => [...prev, id])
    deleteNotification(id)
  }

  const bulkDelete = () => {
    setNotifications(prev => prev.filter(notif => !selectedNotifications.includes(notif.id)))
    setSelectedNotifications([])
  }

  const bulkArchive = () => {
    setArchivedNotifications(prev => [...prev, ...selectedNotifications])
    setNotifications(prev => prev.filter(notif => !selectedNotifications.includes(notif.id)))
    setSelectedNotifications([])
  }

  const bulkMarkAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => 
        selectedNotifications.includes(notif.id) ? { ...notif, read: true } : notif
      )
    )
  }

  const filteredNotifications = notifications.filter(notif => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'unread' && !notif.read) ||
      (filter === 'sales' && notif.type === 'sale') ||
      (filter === 'social' && ['comment', 'like', 'follow'].includes(notif.type)) ||
      (filter === 'workspace' && ['workspace', 'project'].includes(notif.type))
    
    const matchesSearch = !searchQuery || 
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (notif.sender?.name && notif.sender.name.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesFilter && matchesSearch
  })

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Enhanced Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1 hover:bg-blue-50 rounded-lg"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
            {selectedNotifications.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedNotifications.length} selected
                </span>
                <button
                  onClick={bulkMarkAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Mark as read
                </button>
                <button
                  onClick={bulkArchive}
                  className="text-sm text-yellow-600 hover:text-yellow-700"
                >
                  Archive
                </button>
                <button
                  onClick={bulkDelete}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Search Bar */}
        {showSearch && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Bell className="w-4 h-4" />
              All
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                {notifications.length}
              </span>
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                filter === 'unread' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Eye className="w-4 h-4" />
              Unread
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
                {unreadCount}
              </span>
            </button>
            <button
              onClick={() => setFilter('sales')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                filter === 'sales' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Sales
            </button>
            <button
              onClick={() => setFilter('social')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                filter === 'social' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4" />
              Social
            </button>
            <button
              onClick={() => setFilter('workspace')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                filter === 'workspace' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              Workspace
            </button>
          </div>
        </div>

        {/* Enhanced Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg shadow-sm border transition-all hover:shadow-md ${
                !notification.read 
                  ? 'border-blue-200 bg-blue-50' 
                  : 'border-gray-200'
              } ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Selection Checkbox */}
                  <button
                    onClick={() => toggleNotificationSelection(notification.id)}
                    className={`mt-1 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedNotifications.includes(notification.id)
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {selectedNotifications.includes(notification.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </button>
                  
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${
                            !notification.read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </h3>
                          {notification.priority === 'high' && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                              High Priority
                            </span>
                          )}
                          {notification.metadata?.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                              <span className="text-xs text-gray-600">{notification.metadata.rating}</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-2">
                          {notification.message}
                        </p>
                        
                        {/* Sender Info */}
                        {notification.sender && (
                          <div className="flex items-center gap-2 mb-2">
                            {notification.sender.avatar ? (
                              <img 
                                src={notification.sender.avatar} 
                                alt={notification.sender.name}
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">
                                  {notification.sender.name.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                {notification.sender.name}
                              </span>
                              <span className="text-xs text-gray-500 ml-1">
                                @{notification.sender.username}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {/* Metadata */}
                        {notification.metadata?.amount && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-green-600">
                              +${notification.metadata.amount}
                            </span>
                            <span className="text-xs text-gray-500">
                              from {notification.metadata.projectName}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{notification.timestamp}</span>
                          </div>
                          {notification.type === 'sale' && (
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              <span>Instant delivery</span>
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-4">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                            title="Mark as read"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {notification.read && (
                          <button
                            onClick={() => markAsUnread(notification.id)}
                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                            title="Mark as unread"
                          >
                            <Bell className="w-4 h-4" />
                          </button>
                        )}
                        {notification.actions?.reply && (
                          <button
                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                            title="Reply"
                          >
                            <Reply className="w-4 h-4" />
                          </button>
                        )}
                        {notification.actions?.forward && (
                          <button
                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                            title="Forward"
                          >
                            <Forward className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => archiveNotification(notification.id)}
                          className="p-1.5 text-gray-400 hover:bg-yellow-100 rounded transition-colors"
                          title="Archive"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1.5 text-gray-400 hover:bg-red-100 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    {notification.actionUrl && (
                      <button className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                        View Details
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </h3>
            <p className="text-gray-600">
              {filter === 'unread' 
                ? 'You\'re all caught up!' 
                : 'No notifications match your current filter.'
              }
            </p>
          </div>
        )}

        {/* Enhanced Notification Settings */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Notification Settings
            </h3>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              Configure all settings
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Delivery Methods</h4>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Email notifications</span>
                <input 
                  type="checkbox" 
                  checked={notificationSettings.emailNotifications}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                  className="rounded" 
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Push notifications</span>
                <input 
                  type="checkbox" 
                  checked={notificationSettings.pushNotifications}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                  className="rounded" 
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Weekly digest</span>
                <input 
                  type="checkbox" 
                  checked={notificationSettings.weeklyDigest}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, weeklyDigest: e.target.checked }))}
                  className="rounded" 
                />
              </label>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Notification Types</h4>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Sales alerts</span>
                <input 
                  type="checkbox" 
                  checked={notificationSettings.salesAlerts}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, salesAlerts: e.target.checked }))}
                  className="rounded" 
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Comment alerts</span>
                <input 
                  type="checkbox" 
                  checked={notificationSettings.commentAlerts}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, commentAlerts: e.target.checked }))}
                  className="rounded" 
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Follow alerts</span>
                <input 
                  type="checkbox" 
                  checked={notificationSettings.followAlerts}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, followAlerts: e.target.checked }))}
                  className="rounded" 
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-gray-700">System updates</span>
                <input 
                  type="checkbox" 
                  checked={notificationSettings.systemUpdates}
                  onChange={(e) => setNotificationSettings(prev => ({ ...prev, systemUpdates: e.target.checked }))}
                  className="rounded" 
                />
              </label>
            </div>
          </div>
        </div>
        
        {/* Archived Notifications */}
        {archivedNotifications.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Archive className="w-4 h-4" />
                Archived Notifications
              </h3>
              <span className="text-sm text-gray-500">
                {archivedNotifications.length} items
              </span>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              View archived notifications
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
