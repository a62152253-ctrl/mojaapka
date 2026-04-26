import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { User } from '../types/index'
import {
  authenticateUser,
  getPersistedUser,
  persistUserSession,
  registerUser,
} from '../services/authService'

interface AuthContextType {
  user: User | null
  loading: boolean
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const setUser = (userData: User | null) => {
    setUserState(userData)
    persistUserSession(userData)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const persistedUser = getPersistedUser()
      if (!persistedUser) {
        setLoading(false)
        return
      }

      setUserState(persistedUser)
    } catch (error) {
      console.error('Auth check error:', error)
      persistUserSession(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const account = authenticateUser(email, password)

      if (!account) {
        throw new Error('Invalid credentials')
      }

      setUser(account)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (userData: {
    email: string
    username: string
    password: string
    accountType: 'DEVELOPER' | 'USER'
  }) => {
    try {
      const newUser = registerUser(userData)
      setUser(newUser)
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      console.log('Logging out...')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
    }
  }

  const updateUser = (userData: Partial<User>) => {
    setUserState((previous) => {
      if (!previous) {
        return null
      }

      const nextUser = { ...previous, ...userData, updatedAt: new Date().toISOString() }
      persistUserSession(nextUser)
      return nextUser
    })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUser,
        setUser
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
