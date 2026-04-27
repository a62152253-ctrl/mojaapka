import { ApiResponse, AuthResponse, Project, Comment, Deal, User } from '../types/index'

class ApiClient {
  private baseURL: string
  private token: string | null = null
  private cache = new Map<string, { data: any; timestamp: number }>()
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  constructor(baseURL: string = '') {
    this.baseURL = baseURL
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token')
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
    this.clearCache() // Clear cache when token changes
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
    this.clearCache()
  }

  private clearCache() {
    this.cache.clear()
  }

  private getCacheKey(endpoint: string, options?: RequestInit): string {
    return `${endpoint}:${JSON.stringify(options)}`
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    if (cached) {
      this.cache.delete(key)
    }
    return null
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useCache: boolean = false
  ): Promise<ApiResponse<T>> {
    const cacheKey = this.getCacheKey(endpoint, options)
    
    // Try cache first for GET requests
    if (useCache && (!options.method || options.method === 'GET')) {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        return cached
      }
    }

    const url = `${this.baseURL}/api${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: AbortSignal.timeout(10000), // 10 second timeout
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Cache successful GET responses
      if (useCache && (!options.method || options.method === 'GET')) {
        this.setCache(cacheKey, data)
      }
      
      return data
    } catch (error) {
      // Enhanced error logging
      console.error('API Request Error:', {
        endpoint,
        method: options.method || 'GET',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
      
      throw error
    }
  }

  // Auth
  async login(credentials: {
    username: string
    password: string
    accountType: 'USER' | 'DEVELOPER'
  }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async register(userData: {
    email: string
    username: string
    password: string
    accountType: 'USER' | 'DEVELOPER'
  }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    })
    this.clearToken()
    return response
  }

  // Projects
  async getProjects(params?: {
    query?: string
    category?: string
    tags?: string[]
    minPrice?: number
    maxPrice?: number
    sortBy?: string
    sortOrder?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<Project[]>> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            searchParams.set(key, value.join(','))
          } else {
            searchParams.set(key, String(value))
          }
        }
      })
    }

    const query = searchParams.toString()
    return this.request<Project[]>(`/projects${query ? `?${query}` : ''}`, {}, true)
  }

  async getProject(id: string): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/projects/${id}`, {}, true)
  }

  async createProject(projectData: Partial<Project>): Promise<ApiResponse<Project>> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    })
  }

  async updateProject(id: string, projectData: Partial<Project>): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    })
  }

  async deleteProject(id: string): Promise<ApiResponse> {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    })
  }

  // Likes
  async toggleLike(projectId: string): Promise<ApiResponse> {
    return this.request('/likes', {
      method: 'POST',
      body: JSON.stringify({ projectId }),
    })
  }

  async removeLike(projectId: string): Promise<ApiResponse> {
    return this.request('/likes', {
      method: 'DELETE',
      body: JSON.stringify({ projectId }),
    })
  }

  // Comments
  async getComments(projectId: string): Promise<ApiResponse<Comment[]>> {
    return this.request<Comment[]>(`/comments?projectId=${projectId}`, {}, true)
  }

  async addComment(content: string, projectId: string): Promise<ApiResponse<Comment>> {
    return this.request<Comment>('/comments', {
      method: 'POST',
      body: JSON.stringify({ content, projectId }),
    })
  }

  // Deals
  async getDeals(params?: {
    status?: string
    type?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<Deal[]>> {
    const searchParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value))
        }
      })
    }

    const query = searchParams.toString()
    return this.request<Deal[]>(`/deals${query ? `?${query}` : ''}`, {}, true)
  }

  async createDeal(dealData: Partial<Deal>): Promise<ApiResponse<Deal>> {
    return this.request<Deal>('/deals', {
      method: 'POST',
      body: JSON.stringify(dealData),
    })
  }

  async updateDeal(id: string, dealData: Partial<Deal>): Promise<ApiResponse<Deal>> {
    return this.request<Deal>(`/deals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dealData),
    })
  }

  // User specific methods for dashboard
  async getUserStats(userId: string): Promise<ApiResponse<{
    totalPurchases: number
    totalSpent: number
    favoriteProjects: number
    commentsCount: number
    recentActivity: number
    savedMoney: number
  }>> {
    return this.request(`/users/${userId}/stats`, {}, true)
  }

  async getUserLikes(userId: string): Promise<ApiResponse<Project[]>> {
    return this.request<Project[]>(`/users/${userId}/likes`, {}, true)
  }

  async getUserComments(userId: string): Promise<ApiResponse<Comment[]>> {
    return this.request<Comment[]>(`/users/${userId}/comments`, {}, true)
  }

  async getUserProjects(userId: string): Promise<ApiResponse<Project[]>> {
    return this.request<Project[]>(`/users/${userId}/projects`, {}, true)
  }

  async getDeal(id: string): Promise<ApiResponse<Deal>> {
    return this.request<Deal>(`/deals/${id}`, {}, true)
  }

  async updateDealStatus(id: string, status: string): Promise<ApiResponse<Deal>> {
    return this.request<Deal>(`/deals/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  // User
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/me', {}, true)
  }

  async updateProfile(userData: { username?: string; bio?: string }): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  async updatePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<ApiResponse> {
    return this.request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    })
  }
}

export const apiClient = new ApiClient()
export default ApiClient
