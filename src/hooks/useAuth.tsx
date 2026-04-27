import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react'
import { User } from '../types/index'
import {
  authenticateUser,
  getPersistedUser,
  persistUserSession,
  registerUser,
} from '../services/authService'
import { apiClient } from '../lib/api'
import { useToast } from './useToast'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: {
    email: string
    username: string
    password: string
    accountType: 'DEVELOPER' | 'USER'
  }) => Promise<void>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  setUser: (userData: User | null) => void
  refreshUser: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { success, error: showToast } = useToast()

  const setUser = useCallback((userData: User | null) => {
    setUserState(userData)
    persistUserSession(userData)
    setError(null)
  }, [setError])

  const checkAuth = useCallback(async () => {
    try {
      const persistedUser = getPersistedUser()
      if (!persistedUser) {
        setLoading(false)
        return
      }

      // Validate token with server
      try {
        const response = await apiClient.getCurrentUser()
        if (response.success && response.data) {
          setUserState(response.data)
        } else {
          // Token invalid, clear session
          persistUserSession(null)
          setUserState(null)
        }
      } catch (serverError) {
        // Server unavailable, use persisted user
        setUserState(persistedUser)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      persistUserSession(null)
      setUserState(null)
      setError('Authentication failed')
    } finally {
      setLoading(false)
    }
  }, [setUserState, setError, setLoading, setUser])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const account = authenticateUser(email, password)

      if (!account) {
        throw new Error('Invalid credentials')
      }

      setUser(account)
      success('Login successful', `Welcome back, ${account.username}!`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setError(errorMessage)
      showToast('Login failed', errorMessage)
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [success, showToast, setUser, setError, setLoading])

  const register = useCallback(async (userData: {
    email: string
    username: string
    password: string
    accountType: 'DEVELOPER' | 'USER'
  }) => {
    setLoading(true)
    setError(null)
    
    try {
      const newUser = registerUser(userData)
      setUser(newUser)
      success('Registration successful', `Welcome to DevBloxi, ${newUser.username}!`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      setError(errorMessage)
      showToast('Registration failed', errorMessage)
      console.error('Registration error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [success, showToast, setUser, setError, setLoading])

  const logout = useCallback(async () => {
    setLoading(true)
    
    try {
      // Clear API client token
      apiClient.clearToken()
      console.log('Logging out...')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setLoading(false)
    }
  }, [setUser, setLoading])

  const updateUser = useCallback((userData: Partial<User>) => {
    setUserState((previous) => {
      if (!previous) {
        return null
      }

      const nextUser = { ...previous, ...userData, updatedAt: new Date().toISOString() }
      persistUserSession(nextUser)
      return nextUser
    })
  }, [setUserState])

  const refreshUser = useCallback(async () => {
    if (!user) return
    
    try {
      const response = await apiClient.getCurrentUser()
      if (response.success && response.data) {
        setUserState(response.data)
      }
    } catch (error) {
      console.error('User refresh error:', error)
      setError('Failed to refresh user data')
    }
  }, [user, setError])

  const clearError = useCallback(() => {
    setError(null)
  }, [setError])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        setUser,
        refreshUser,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
