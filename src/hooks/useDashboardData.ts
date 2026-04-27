import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { apiClient } from '../lib/api'
import { Project, Deal, User } from '../types/index'
import { useAsync } from './useAsync'

interface DashboardData {
  projects: Project[]
  deals: Deal[]
  userStats: {
    totalPurchases: number
    totalSpent: number
    favoriteProjects: number
    commentsCount: number
    recentActivity: number
    savedMoney: number
  } | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export const useDashboardData = (): DashboardData => {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [userStats, setUserStats] = useState<DashboardData['userStats']>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    if (!user) return
    
    try {
      const response = await apiClient.getUserProjects(user.id)
      if (response.success && response.data) {
        setProjects(response.data)
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err)
      setError('Failed to load projects')
    }
  }, [user, setProjects, setError])

  const fetchDeals = useCallback(async () => {
    if (!user) return
    
    try {
      const response = await apiClient.getDeals()
      if (response.success && response.data) {
        // Filter deals relevant to current user
        const userDeals = response.data.filter(deal => 
          deal.buyerId === user.id || deal.sellerId === user.id
        )
        setDeals(userDeals)
      }
    } catch (err) {
      console.error('Failed to fetch deals:', err)
      setError('Failed to load deals')
    }
  }, [user, setDeals, setError])

  const fetchUserStats = useCallback(async () => {
    if (!user) return
    
    try {
      const response = await apiClient.getUserStats(user.id)
      if (response.success && response.data) {
        setUserStats(response.data)
      }
    } catch (err) {
      console.error('Failed to fetch user stats:', err)
      // Don't set error for stats failure, it's not critical
    }
  }, [user, setUserStats])

  const refresh = useCallback(async () => {
    setError(null)
    await Promise.all([
      fetchProjects(),
      fetchDeals(),
      fetchUserStats()
    ])
  }, [fetchProjects, fetchDeals, fetchUserStats, setError])

  useEffect(() => {
    if (user) {
      refresh()
    }
  }, [user, refresh])

  return {
    projects,
    deals,
    userStats,
    loading: false, // Individual loading states handled by components
    error,
    refresh
  }
}

interface UseProjectsOptions {
  status?: string
  category?: string
  tags?: string[]
  limit?: number
}

export const useProjects = (options: UseProjectsOptions = {}) => {
  const { user } = useAuth()
  
  const fetchProjects = useCallback(async () => {
    const params = {
      ...options,
      ...(user?.accountType === 'DEVELOPER' ? { author: user.id } : {})
    }
    
    const response = await apiClient.getProjects(params)
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch projects')
    }
    
    return response.data || []
  }, [user, options])

  const { data: projects = [], loading, error, execute } = useAsync(fetchProjects, true)

  return {
    projects,
    loading,
    error,
    refetch: execute
  }
}

export const useDeals = (status?: string) => {
  const { user } = useAuth()
  
  const fetchDeals = useCallback(async () => {
    if (!user) return []
    
    const params = status ? { status } : undefined
    const response = await apiClient.getDeals(params)
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch deals')
    }
    
    // Filter deals relevant to current user
    const userDeals = (response.data || []).filter(deal => 
      deal.buyerId === user.id || deal.sellerId === user.id
    )
    
    return userDeals
  }, [user, status])

  const { data: deals = [], loading, error, execute } = useAsync(fetchDeals, true)

  return {
    deals,
    loading,
    error,
    refetch: execute
  }
}

export default useDashboardData
