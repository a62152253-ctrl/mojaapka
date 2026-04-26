import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import ProjectViewer from './components/ProjectViewer'
import CreateProject from './components/CreateProject'
import UserProfile from './pages/UserProfile'
import Login from './pages/Login'
import DashboardPage from '../pages/dashboard'
import TestEditor from './pages/TestEditor'
import Notifications from './pages/Notifications'
import LiveWorkspace from './pages/LiveWorkspace'
import { AuthProvider, useAuth } from './hooks/useAuth'

function AppContent() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const isAuthPage = location.pathname === '/login'

  if (loading) {
    return (
      <div className="app-shell flex items-center justify-center px-4">
        <div className="surface-panel-strong w-full max-w-sm p-8 text-center">
          <div className="loading mx-auto mb-4"></div>
          <p className="font-medium text-stone-200">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      {user && !isAuthPage && <Navbar user={user} />}
      <main className={user && !isAuthPage ? 'pb-12' : ''}>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/" element={user ? (user.accountType === 'USER' ? <Home /> : <Navigate to="/dashboard" replace />) : <Navigate to="/login" replace />} />
          <Route path="/dashboard" element={user ? (user.accountType === 'DEVELOPER' ? <DashboardPage user={user} /> : <Navigate to="/" replace />) : <Navigate to="/login" replace />} />
          <Route path="/project/:id" element={user ? <ProjectViewer /> : <Navigate to="/login" replace />} />
          <Route path="/create" element={user ? (user.accountType === 'DEVELOPER' ? <CreateProject /> : <Navigate to="/" replace />) : <Navigate to="/login" replace />} />
          <Route path="/user/:username" element={user ? <UserProfile /> : <Navigate to="/login" replace />} />
          <Route path="/test-editor" element={<TestEditor />} />
          <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/login" replace />} />
          <Route path="/live-workspace" element={user ? <LiveWorkspace /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to={user ? (user.accountType === 'USER' ? "/" : "/dashboard") : "/login"} replace />} />
        </Routes>
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
