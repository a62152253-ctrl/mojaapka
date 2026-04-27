import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, User, LogOut, Plus, Home, Sparkles, LayoutDashboard, Bell, Settings } from 'lucide-react'
import { User as UserType } from '../../types/index'
import { useAuth } from '../../hooks/useAuth'
import ErrorBoundary from '../ui/ErrorBoundary'
import LoadingSpinner from '../ui/LoadingSpinner'

interface NavbarProps {
  user?: UserType | null
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const { user: authUser, logout, loading, error, clearError } = useAuth()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const searchRef = useRef<HTMLInputElement | null>(null)
  const navigate = useNavigate()
  const currentUser = user ?? authUser

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShowProfileMenu(false)
    }
  }, [menuRef, setShowProfileMenu])

  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setShowProfileMenu(false)
      searchRef.current?.blur()
    }
  }, [setShowProfileMenu, searchRef])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [handleClickOutside, handleEscape])

  const handleLogout = useCallback(async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }, [logout, navigate])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      searchRef.current?.blur()
    }
  }, [searchQuery, navigate, setSearchQuery, searchRef])

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e as any)
    }
  }, [handleSearch])

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-stone-950/75 backdrop-blur-xl">
      <div className="section-shell">
        <div className="flex min-h-[4.75rem] items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-300 to-amber-300 text-sm font-extrabold text-stone-950 shadow-soft">
              DB
            </div>
            <div>
              <span className="block font-['Space_Grotesk'] text-lg font-bold tracking-tight text-stone-50">
                DevBloxi
              </span>
              <span className="block text-xs uppercase tracking-[0.24em] text-stone-500">
                Developer Platform
              </span>
            </div>
          </Link>

          <div className="hidden flex-1 md:flex md:max-w-xl">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search curated builds, templates, and MVPs"
                className="input-base pl-11 pr-24"
                disabled={isSearching}
                aria-label="Search projects and templates"
              />
              <button
                type="submit"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500"
                disabled={isSearching}
              >
                {isSearching ? 'Searching...' : 'Explore'}
              </button>
            </form>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {error && (
              <div className="hidden md:flex items-center gap-2 rounded-full border border-rose-300/20 bg-rose-300/10 px-3 py-2 text-xs text-rose-300">
                <span>{error}</span>
                <button
                  onClick={clearError}
                  className="text-rose-400 hover:text-rose-300"
                  aria-label="Clear error"
                >
                  ×
                </button>
              </div>
            )}
            
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : currentUser ? (
              <>
                {currentUser.accountType === 'DEVELOPER' && (
                  <Link
                    to="/create"
                    className="btn-primary px-4 py-2.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">New Project</span>
                  </Link>
                )}

                <button
                  className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-400 md:inline-flex md:items-center md:gap-2 transition hover:border-white/20 hover:bg-white/[0.08]"
                  onClick={() => navigate('/notifications')}
                  aria-label="Notifications"
                >
                  <Bell className="h-3.5 w-3.5 text-amber-300" />
                  Notifications
                </button>

                <button
                  className="hidden rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-stone-400 md:inline-flex md:items-center md:gap-2 transition hover:border-white/20 hover:bg-white/[0.08]"
                  onClick={() => navigate('/settings')}
                  aria-label="Settings"
                >
                  <Settings className="h-3.5 w-3.5 text-blue-300" />
                  Settings
                </button>

                <div ref={menuRef} className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-2 text-stone-200 transition hover:border-white/20 hover:bg-white/[0.08]"
                    aria-expanded={showProfileMenu}
                    aria-haspopup="true"
                    aria-label="User menu"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-300/85 to-amber-300/85 text-sm font-bold text-stone-950">
                      {currentUser.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="hidden text-left sm:block">
                      <span className="block text-sm font-semibold text-stone-100">{currentUser.username}</span>
                      <span className="block text-xs text-stone-500">
                        {currentUser.accountType === 'DEVELOPER' ? 'Developer' : 'Collector'}
                      </span>
                    </div>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-3 w-60 overflow-hidden rounded-3xl border border-white/10 bg-stone-900/95 p-2 shadow-medium backdrop-blur-xl">
                      <Link
                        to={currentUser.accountType === 'DEVELOPER' ? '/dashboard' : '/'}
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-stone-300 transition hover:bg-white/[0.06] hover:text-white"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        {currentUser.accountType === 'DEVELOPER' ? (
                          <LayoutDashboard className="h-4 w-4 text-teal-300" />
                        ) : (
                          <Home className="h-4 w-4 text-teal-300" />
                        )}
                        {currentUser.accountType === 'DEVELOPER' ? 'Dashboard' : 'Home'}
                      </Link>
                      <Link
                        to={`/user/${currentUser.username}`}
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-stone-300 transition hover:bg-white/[0.06] hover:text-white"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <User className="h-4 w-4 text-amber-300" />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-stone-300 transition hover:bg-white/[0.06] hover:text-white"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <Settings className="h-4 w-4 text-blue-300" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="mt-1 flex w-full items-center gap-3 rounded-2xl border-t border-white/10 px-4 py-3 text-left text-sm text-stone-300 transition hover:bg-white/[0.06] hover:text-white"
                      >
                        <LogOut className="h-4 w-4 text-rose-300" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="btn-primary px-4 py-2.5"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
