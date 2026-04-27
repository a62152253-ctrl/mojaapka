import React, { useState, useEffect, useCallback } from 'react'
import { FileText, Users, Settings, BarChart3, Zap, Shield, Globe, Database, Cloud, Lock, Unlock } from 'lucide-react'

interface ProjectData {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  price: number
  status: 'draft' | 'published' | 'archived'
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    avatar: string
    email: string
  }
  stats: {
    views: number
    likes: number
    downloads: number
    revenue: number
  }
}

interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: 'developer' | 'client' | 'admin'
  accountType: 'DEVELOPER' | 'USER'
  stats: {
    projects: number
    revenue: number
    clients: number
  }
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  const [projects, setProjects] = useState<ProjectData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'analytics' | 'settings'>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data loading
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const mockUser: User = {
          id: '1',
          name: 'Alex Developer',
          email: 'alex@example.com',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
          role: 'developer',
          accountType: 'DEVELOPER',
          stats: {
            projects: 12,
            revenue: 15420,
            clients: 8
          }
        }

        const mockProjects: ProjectData[] = [
          {
            id: '1',
            title: 'E-Commerce Dashboard',
            description: 'Modern React dashboard with real-time analytics and inventory management',
            category: 'web-development',
            tags: ['react', 'typescript', 'tailwind', 'analytics'],
            price: 299,
            status: 'published',
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-20T14:22:00Z',
            author: mockUser,
            stats: {
              views: 1250,
              likes: 89,
              downloads: 34,
              revenue: 10166
            }
          },
          {
            id: '2',
            title: 'Task Management System',
            description: 'Collaborative task management with real-time updates and team features',
            category: 'web-development',
            tags: ['vue', 'nodejs', 'websocket', 'collaboration'],
            price: 199,
            status: 'published',
            createdAt: '2024-01-10T09:15:00Z',
            updatedAt: '2024-01-18T16:45:00Z',
            author: mockUser,
            stats: {
              views: 890,
              likes: 67,
              downloads: 28,
              revenue: 5572
            }
          }
        ]

        setUser(mockUser)
        setProjects(mockProjects)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  const handleProjectAction = useCallback((action: string, projectId: string) => {
    console.log(`Action: ${action} on project ${projectId}`)
  }, [])

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-blue-500 mr-3" />
              <h1 className="text-xl font-bold">DevBloxi</h1>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'dashboard' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'projects' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Projects
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'analytics' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'settings' ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                Settings
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
              <div className="flex items-center space-x-2">
                <img src={user?.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
                <span className="text-sm">{user?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Projects</p>
                    <p className="text-2xl font-bold">{user?.stats.projects}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Revenue</p>
                    <p className="text-2xl font-bold">${user?.stats.revenue.toLocaleString()}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Clients</p>
                    <p className="text-2xl font-bold">{user?.stats.clients}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Active Status</p>
                    <p className="text-2xl font-bold">Online</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Recent Projects */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Projects</h2>
              <div className="space-y-4">
                {filteredProjects.slice(0, 3).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{project.title}</h3>
                      <p className="text-sm text-gray-400">{project.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>{project.stats.views} views</span>
                        <span>{project.stats.downloads} downloads</span>
                        <span>${project.stats.revenue} revenue</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleProjectAction('edit', project.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">All Projects</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Create New Project
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div key={project.id} className="bg-gray-800 rounded-lg overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-blue-600 to-purple-600"></div>
                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-700 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-500">${project.price}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleProjectAction('edit', project.id)}
                          className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleProjectAction('delete', project.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics</h2>
            <div className="bg-gray-800 rounded-lg p-6">
              <p className="text-gray-400">Analytics dashboard coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Settings</h2>
            <div className="bg-gray-800 rounded-lg p-6">
              <p className="text-gray-400">Settings panel coming soon...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
