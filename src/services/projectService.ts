import { Comment, Project, ProjectFile, User, AccountType } from '../types/index'

const STORAGE_KEY = 'devbloxi:projects'

const createId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

const getProjects = (): Project[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const saveProjects = (projects: Project[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

const getProjectById = (id: string): Project | undefined => {
  return getProjects().find(p => p.id === id)
}

export class ProjectService {
  static async getAllProjects(): Promise<Project[]> {
    return getProjects()
  }

  static async getProjectById(id: string): Promise<Project | null> {
    return getProjectById(id) ?? null
  }

  static async getProjectsByAuthor(authorId: string): Promise<Project[]> {
    return getProjects().filter(p => p.authorId === authorId)
  }

  static async createProject(data: {
    title: string
    description: string
    slug: string
    price: number
    category: string
    tags: string[]
    authorId: string
    thumbnailUrl?: string
    files?: ProjectFile[]
  }): Promise<Project> {
    const projects = getProjects()
    const newProject: Project = {
      id: createId('project'),
      title: data.title,
      description: data.description,
      slug: data.slug,
      price: data.price,
      basePrice: data.price,
      category: data.category,
      tags: data.tags,
      authorId: data.authorId,
      author: {
        id: data.authorId,
        username: 'developer',
        email: 'dev@example.com',
        accountType: 'DEVELOPER' as AccountType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      thumbnailUrl: data.thumbnailUrl,
      images: data.thumbnailUrl ? [data.thumbnailUrl] : [],
      files: data.files || [],
      likes: [],
      comments: [],
      deals: [],
      likesCount: 0,
      commentsCount: 0,
      status: 'PUBLISHED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    saveProjects([newProject, ...projects])
    return newProject
  }

  static async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const projects = getProjects()
    const project = getProjectById(id)
    if (!project) {
      throw new Error('Project not found')
    }
    
    const updatedProject = { ...project, ...data, updatedAt: new Date().toISOString() }
    saveProjects(projects.map(p => p.id === id ? updatedProject : p))
    return updatedProject
  }

  static async deleteProject(id: string): Promise<Project | null> {
    const project = getProjectById(id)
    if (!project) {
      return null
    }

    const remainingProjects = getProjects().filter(p => p.id !== id)
    saveProjects(remainingProjects)
    return project
  }

  static async createCodeFile(data: {
    name: string
    content: string
    language: string
    projectId: string
  }) {
    const project = getProjectById(data.projectId)
    if (!project) {
      throw new Error('Project not found')
    }

    const nextFile: ProjectFile = {
      id: `${data.projectId}-${Date.now()}`,
      name: data.name,
      content: data.content,
      language: data.language,
    }

    this.updateProject(data.projectId, {
      files: [...(project.files ?? []), nextFile],
    })

    return nextFile
  }

  static async updateCodeFile(id: string, data: Partial<ProjectFile>) {
    return { id, ...data }
  }

  static async deleteCodeFile(id: string) {
    return { id }
  }

  static async createFolder(data: { name: string; path: string; projectId: string; parentId?: string }) {
    return data
  }

  static async getProjectFiles(projectId: string): Promise<ProjectFile[]> {
    return getProjectById(projectId)?.files ?? []
  }

  static async getProjectFolders() {
    return []
  }

  static async likeProject(userId: string, projectId: string) {
    const project = getProjectById(projectId)
    if (!project) {
      throw new Error('Project not found')
    }

    const existingLike = project.likes.find(like => like.userId === userId)
    const likes = existingLike 
      ? project.likes.filter(like => like.userId !== userId)
      : [...project.likes, {
          id: createId('like'),
          userId,
          projectId,
          user: {
            id: userId,
            username: 'user',
            email: 'user@example.com',
            accountType: 'USER' as AccountType,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          createdAt: new Date().toISOString(),
        }]

    this.updateProject(projectId, {
      likes,
      likesCount: likes.length,
    })

    return { project, liked: !existingLike }
  }

  static async unlikeProject(userId: string, projectId: string) {
    return this.likeProject(userId, projectId)
  }

  static async addComment(data: {
    content: string
    userId: string
    projectId: string
    user?: User
  }): Promise<Comment> {
    const project = getProjectById(data.projectId)
    if (!project) {
      throw new Error('Project not found')
    }

    const comment: Comment = {
      id: createId('comment'),
      content: data.content,
      userId: data.userId,
      projectId: data.projectId,
      user: data.user || {
        id: data.userId,
        username: 'user',
        email: 'user@example.com',
        accountType: 'USER' as AccountType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.updateProject(data.projectId, {
      comments: [comment, ...project.comments],
      commentsCount: project.comments.length + 1,
    })

    return comment
  }

  static async createDeal(data: {
    price: number
    type: 'BUY' | 'LICENSE'
    message?: string
    buyerId: string
    sellerId: string
    projectId: string
  }) {
    return {
      id: `deal-${Date.now()}`,
      ...data,
      status: 'PENDING' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
}
