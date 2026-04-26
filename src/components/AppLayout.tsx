import { ReactNode, useState, useEffect } from 'react'
import { useToast } from './Toast'
import { ToastContainer } from './Toast'
import ErrorBoundary from './ErrorBoundary'
import { LoadingStates } from './LoadingSpinner'

interface AppLayoutProps {
  children: ReactNode
  loading?: boolean
  error?: string | null
  title?: string
  description?: string
  showHeader?: boolean
  showFooter?: boolean
  headerContent?: ReactNode
  footerContent?: ReactNode
}

export default function AppLayout({
  children,
  loading = false,
  error = null,
  title,
  description,
  showHeader = true,
  showFooter = true,
  headerContent,
  footerContent
}: AppLayoutProps) {
  const { toasts, removeToast } = useToast()
  const [isOnline, setIsOnline] = useState(true)

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Show loading state
  if (loading) {
    return <LoadingStates.FullPage />
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Connection Status Banner */}
        {!isOnline && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <p className="text-sm text-yellow-800">
                You are currently offline. Some features may not be available.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-yellow-600 hover:text-yellow-800 font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        {showHeader && (
          <header className="bg-white border-b border-gray-200 shadow-sm">
            {headerContent || (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">D</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h1 className="text-lg font-semibold text-gray-900">
                        {title || 'DevBlox'}
                      </h1>
                      {description && (
                        <p className="text-sm text-gray-500">{description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {/* User menu placeholder */}
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            )}
          </header>
        )}

        {/* Main Content */}
        <main className="flex-1">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>

        {/* Footer */}
        {showFooter && (
          <footer className="bg-white border-t border-gray-200">
            {footerContent || (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center text-gray-500 text-sm">
                  <p>&copy; 2024 DevBlox. All rights reserved.</p>
                </div>
              </div>
            )}
          </footer>
        )}

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    </ErrorBoundary>
  )
}

// Layout variants for different use cases
export const LayoutVariants = {
  // Full page layout with header and footer
  Default: (props: Omit<AppLayoutProps, 'showHeader' | 'showFooter'>) => (
    <AppLayout {...props} showHeader={true} showFooter={true} />
  ),

  // Minimal layout (no header/footer)
  Minimal: (props: Omit<AppLayoutProps, 'showHeader' | 'showFooter'>) => (
    <AppLayout {...props} showHeader={false} showFooter={false} />
  ),

  // Auth layout (centered, no header/footer)
  Auth: (props: Omit<AppLayoutProps, 'showHeader' | 'showFooter'>) => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <ErrorBoundary>
        {props.children}
      </ErrorBoundary>
    </div>
  ),

  // Dashboard layout (sidebar + main content)
  Dashboard: ({ children, sidebar }: { children: ReactNode; sidebar: ReactNode }) => (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
          {sidebar}
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  ),

  // Modal layout (overlay)
  Modal: ({ children, onClose }: { children: ReactNode; onClose: () => void }) => (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}
