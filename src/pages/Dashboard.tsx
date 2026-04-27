import { lazy, Suspense } from 'react'
import ErrorBoundary from '../components/ui/ErrorBoundary'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useAuth } from '../hooks/useAuth'

const DashboardPage = lazy(() => import('../../pages/dashboard').then(module => ({ 
  default: module.default 
})))

const DashboardWrapper = () => {
  const { user } = useAuth()
  
  return (
  <ErrorBoundary>
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    }>
      <DashboardPage user={user!} />
    </Suspense>
  </ErrorBoundary>
  )
}

export default DashboardWrapper
