import { ApiResponse, AuthResponse, Project, Comment, Deal, User } from '../types/index'

class ApiClient {
  private baseURL: string
  private token: string | null = null

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
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}/api${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Request failed')
    }

    return data
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
    return this.request<Project[]>(`/projects${query ? `?${query}` : ''}`)
  }

  async getProject(id: string): Promise<ApiResponse<Project>> {
    return this.request<Project>(`/projects/${id}`)
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
    return this.request<Comment[]>(`/comments?projectId=${projectId}`)
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
    return this.request<Deal[]>(`/deals${query ? `?${query}` : ''}`)
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
    return this.request(`/users/${userId}/stats`)
  }

  async getUserLikes(userId: string): Promise<ApiResponse<Project[]>> {
    return this.request<Project[]>(`/users/${userId}/likes`)
  }

  async getUserComments(userId: string): Promise<ApiResponse<Comment[]>> {
    return this.request<Comment[]>(`/users/${userId}/comments`)
  }

  async getUserProjects(userId: string): Promise<ApiResponse<Project[]>> {
    return this.request<Project[]>(`/users/${userId}/projects`)
  }

  async getDeal(id: string): Promise<ApiResponse<Deal>> {
    return this.request<Deal>(`/deals/${id}`)
  }

  async updateDealStatus(id: string, status: string): Promise<ApiResponse<Deal>> {
    return this.request<Deal>(`/deals/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  // User
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/me')
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
