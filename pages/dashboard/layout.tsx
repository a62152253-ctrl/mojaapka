import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { GetServerSideProps } from 'next'
import DashboardSidebar from '../../src/components/layout/DashboardSidebar'
import { User } from '../../src/types'

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

export async function getServerSideProps(context: any) {
  const token = context.req.cookies.token
  
  if (!token) {
    return { 
      props: { user: null },
      redirect: {
        destination: '/login',
        permanent: false
      }
    }
  }

  try {
    // TODO: Verify JWT token and get user data
    return { props: { user: null } }
  } catch (error) {
    return { 
      props: { user: null },
      redirect: {
        destination: '/login',
        permanent: false
      }
    }
  }
}
