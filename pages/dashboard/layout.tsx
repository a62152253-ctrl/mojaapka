import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import DashboardSidebar from '../../src/components/layout/DashboardSidebar'
import { User } from '../../src/types/index'

interface DashboardLayoutProps {
  user: User
  children: ReactNode
}

export default function DashboardLayout({ user, children }: DashboardLayoutProps) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <DashboardSidebar user={user} activePath={location.pathname} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </div>
      </div>
    </div>
  )
}

