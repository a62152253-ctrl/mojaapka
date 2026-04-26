import { ProjectService } from '../services/projectService'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export class ProjectsAPI {
  // Get all projects
  static async getAllProjects(): Promise<ApiResponse> {
    try {
      const projects = await ProjectService.getAllProjects()

      return {
        success: true,
        data: projects
      }
    } catch (error) {
      console.error('Get all projects error:', error)
      return {
        success: false,
        error: 'Failed to fetch projects'
      }
    }
  }

  // Get project by ID
  static async getProjectById(id: string): Promise<ApiResponse> {
    try {
      const project = await ProjectService.getProjectById(id)
      
      if (!project) {
        return {
          success: false,
          error: 'Project not found'
        }
      }
      return {
        success: true,
        data: project
      }
    } catch (error) {
      console.error('Get project by ID error:', error)
      return {
        success: false,
        error: 'Failed to fetch project'
      }
    }
  }

  // Create new project
  static async createProject(data: {
    title: string
    description: string
    slug: string
    price: number
    category: string
    tags: string[]
    authorId: string
    thumbnailUrl?: string
    files?: Array<{
      name: string
      content: string
      language: string
    }>
  }): Promise<ApiResponse> {
    try {
      const project = await ProjectService.createProject(data)

      return {
        success: true,
        data: project
      }
    } catch (error) {
      console.error('Create project error:', error)
      return {
        success: false,
        error: 'Failed to create project'
      }
    }
  }

  // Update project
  static async updateProject(id: string, data: {
    title?: string
    description?: string
    price?: number
    category?: string
    tags?: string[]
    status?: 'DRAFT' | 'PUBLISHED' | 'SOLD'
    thumbnailUrl?: string
  }): Promise<ApiResponse> {
    try {
      const project = await ProjectService.updateProject(id, data as any)

      return {
        success: true,
        data: project
      }
    } catch (error) {
      console.error('Update project error:', error)
      return {
        success: false,
        error: 'Failed to update project'
      }
    }
  }

  // Delete project
  static async deleteProject(id: string): Promise<ApiResponse> {
    try {
      await ProjectService.deleteProject(id)
      
      return {
        success: true,
        message: 'Project deleted successfully'
      }
    } catch (error) {
      console.error('Delete project error:', error)
      return {
        success: false,
        error: 'Failed to delete project'
      }
    }
  }

  // Get projects by author
  static async getProjectsByAuthor(authorId: string): Promise<ApiResponse> {
    try {
      const projects = await ProjectService.getProjectsByAuthor(authorId)

      return {
        success: true,
        data: projects
      }
    } catch (error) {
      console.error('Get projects by author error:', error)
      return {
        success: false,
        error: 'Failed to fetch author projects'
      }
    }
  }

  // Like project
  static async likeProject(userId: string, projectId: string): Promise<ApiResponse> {
    try {
      const like = await ProjectService.likeProject(userId, projectId)
      
      return {
        success: true,
        data: like
      }
    } catch (error) {
      console.error('Like project error:', error)
      return {
        success: false,
        error: 'Failed to like project'
      }
    }
  }

  // Unlike project
  static async unlikeProject(userId: string, projectId: string): Promise<ApiResponse> {
    try {
      await ProjectService.unlikeProject(userId, projectId)
      
      return {
        success: true,
        message: 'Project unliked successfully'
      }
    } catch (error) {
      console.error('Unlike project error:', error)
      return {
        success: false,
        error: 'Failed to unlike project'
      }
    }
  }

  // Add comment
  static async addComment(data: {
    content: string
    userId: string
    projectId: string
    user?: any
  }): Promise<ApiResponse> {
    try {
      const comment = await ProjectService.addComment(data)
      
      return {
        success: true,
        data: comment
      }
    } catch (error) {
      console.error('Add comment error:', error)
      return {
        success: false,
        error: 'Failed to add comment'
      }
    }
  }
}
