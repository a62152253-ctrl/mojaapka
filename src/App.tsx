import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import ProjectViewer from './components/ProjectViewer'
import CreateProject from './pages/CreateProject'
import UserProfile from './pages/UserProfile'
import Login from './pages/Login'
import DashboardPage from '../pages/dashboard'
import TestEditor from './pages/TestEditor'
import Notifications from './pages/Notifications'
import LiveWorkspace from './pages/LiveWorkspace'
import Projects from '../pages/projects'
import SettingsPage from '../pages/dashboard/settings'
import { AuthProvider, useAuth } from './hooks/useAuth'

function LoadingState() {
  return (
    <div className="app-shell flex items-center justify-center px-4">
      <div className="surface-panel-strong w-full max-w-sm p-8 text-center">
        <div className="loading mx-auto mb-4"></div>
        <p className="font-medium text-stone-200">Loading your workspace...</p>
      </div>
    </div>
  )
}

function ProtectedRoute({ children, requiredAccountType }: { children: React.ReactNode; requiredAccountType?: 'USER' | 'DEVELOPER' }) {
  const { user } = useAuth()
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (requiredAccountType && user.accountType !== requiredAccountType) {
    const redirectPath = user.accountType === 'USER' ? '/' : '/dashboard'
    return <Navigate to={redirectPath} replace />
  }
  
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  
  if (user) {
    const redirectPath = user.accountType === 'USER' ? '/' : '/dashboard'
    return <Navigate to={redirectPath} replace />
  }
  
  return <>{children}</>
}

function AppRoutes() {
  const { user } = useAuth()
  
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute requiredAccountType="USER">
            <Home />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute requiredAccountType="DEVELOPER">
            <DashboardPage user={user!} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/project/:id" 
        element={
          <ProtectedRoute>
            <ProjectViewer />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/create" 
        element={
          <ProtectedRoute requiredAccountType="DEVELOPER">
            <CreateProject />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/user/:username" 
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } 
      />
      <Route path="/test-editor" element={<TestEditor />} />
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/live-workspace" 
        element={
          <ProtectedRoute>
            <LiveWorkspace />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/projects" 
        element={
          <ProtectedRoute>
            <Projects />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <SettingsPage user={user!} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="*" 
        element={
          <ProtectedRoute>
            {user?.accountType === 'USER' ? <Navigate to="/" replace /> : <Navigate to="/dashboard" replace />}
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}

function AppContent() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const isAuthPage = location.pathname === '/login'

  if (loading) {
    return <LoadingState />
  }

  return (
    <div className="app-shell">
      {user && !isAuthPage && <Navbar user={user} />}
      <main className={user && !isAuthPage ? 'pb-12' : ''}>
        <AppRoutes />
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
