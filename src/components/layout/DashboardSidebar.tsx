import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { 
  Home, 
  Rocket,
  LogOut, 
  Plus,
  Bell,
  User
} from 'lucide-react'
import { User as UserType } from '../../types/index'
import { useAuth } from '../../hooks/useAuth'

interface DashboardSidebarProps {
  user: UserType
  activePath?: string
}

export default function DashboardSidebar({ user, activePath }: DashboardSidebarProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      navigate('/login')
    }
  }

  const menuItems = [
    {
      section: 'main',
      items: [
        {
          icon: Home,
          label: 'Dashboard',
          href: '/dashboard',
          description: 'Overview and workspace'
        },
        {
          icon: User,
          label: 'Profile',
          href: `/user/${user.username}`,
          description: 'View your public profile'
        }
      ]
    },
    {
      section: 'workspace',
      title: 'Build',
      items: [
        {
          icon: Rocket,
          label: 'Live Workspace',
          href: '/live-workspace',
          description: 'Real-time collaborative coding'
        },
        {
          icon: Plus,
          label: 'Create Project',
          href: '/create',
          description: 'Open project publishing flow'
        }
      ]
    },
    {
      section: 'updates',
      items: [
        {
          icon: Bell,
          label: 'Notifications',
          href: '/notifications',
          description: 'Sales and project alerts'
        }
      ]
    }
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') return activePath === '/dashboard' && !window.location.search.includes('tab=')
    if (href.includes('?')) {
      const [path, query] = href.split('?')
      const [, tabValue] = query.split('=')
      return activePath === path && new URLSearchParams(window.location.search).get('tab') === tabValue
    }
    return activePath === href || activePath?.startsWith(href)
  }

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <Link to="/dashboard" className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold">D</span>
          </div>
          <span className="text-white font-bold text-xl">DevBlox</span>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full" />
            ) : (
              <span className="text-white font-bold">
                {user.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="text-white font-medium">{user.username}</p>
            <p className="text-gray-400 text-sm capitalize">{user.accountType.toLowerCase()}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        {menuItems.map((section) => (
          <div key={section.section} className="mb-6">
            {section.title && (
              <div className="mb-2 text-gray-400">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {section.title}
                </span>
              </div>
            )}
            
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      active
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="flex-1">
                      <p className="font-medium">{item.label}</p>
                      {item.description && (
                        <p className="text-xs opacity-75">{item.description}</p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {/* Logout */}
        <div className="pt-6 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </div>
  )
}
