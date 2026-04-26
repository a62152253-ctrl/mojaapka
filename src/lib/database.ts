// Mock database client for frontend development
// In production, this would connect to actual API endpoints

interface MockPrismaClient {
  project: {
    findMany: (args?: any) => Promise<any[]>
    findUnique: (args: any) => Promise<any>
    create: (args: any) => Promise<any>
    update: (args: any) => Promise<any>
    delete: (args: any) => Promise<any>
  }
  user: {
    findMany: (args?: any) => Promise<any[]>
    findUnique: (args: any) => Promise<any>
    create: (args: any) => Promise<any>
    update: (args: any) => Promise<any>
  }
  like: {
    findMany: (args?: any) => Promise<any[]>
    create: (args: any) => Promise<any>
    delete: (args: any) => Promise<any>
  }
  comment: {
    findMany: (args?: any) => Promise<any[]>
    create: (args: any) => Promise<any>
  }
  deal: {
    findMany: (args?: any) => Promise<any[]>
    create: (args: any) => Promise<any>
  }
  codeFile: {
    findMany: (args?: any) => Promise<any[]>
    findUnique: (args: any) => Promise<any>
    create: (args: any) => Promise<any>
    update: (args: any) => Promise<any>
    delete: (args: any) => Promise<any>
  }
  codeFolder: {
    findMany: (args?: any) => Promise<any[]>
    findUnique: (args: any) => Promise<any>
    create: (args: any) => Promise<any>
    update: (args: any) => Promise<any>
    delete: (args: any) => Promise<any>
  }
}

// Mock data for development
const mockProjects = [
  {
    id: '1',
    title: 'Modern Burger Restaurant',
    description: 'Complete restaurant website with online ordering system',
    slug: 'burger-website',
    price: 299,
    category: 'Food & Restaurant',
    tags: ['react', 'tailwind', 'restaurant', 'ecommerce'],
    demoUrl: 'https://example.com/demo1',
    githubUrl: 'https://github.com/example/burger-site',
    images: ['https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Burger+Site'],
    thumbnailUrl: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Burger+Site',
    status: 'PUBLISHED',
    authorId: '1',
    author: {
      id: '1',
      username: 'devmaster',
      email: 'devmaster@example.com',
      accountType: 'DEVELOPER',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    likes: [],
    comments: [],
    deals: [],
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  }
]

const mockUsers = [
  {
    id: '1',
    username: 'devmaster',
    email: 'devmaster@example.com',
    accountType: 'DEVELOPER',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: '2',
    username: 'user123',
    email: 'user@example.com',
    accountType: 'USER',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
]

const mockDeals = [
  {
    id: '1',
    price: 299,
    status: 'COMPLETED',
    type: 'BUY',
    buyerId: '2',
    sellerId: '1',
    projectId: '1',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-20'
  }
]

const mockLikes = [
  {
    id: '1',
    userId: '2',
    projectId: '1',
    createdAt: '2024-01-18'
  }
]

const mockComments = [
  {
    id: '1',
    content: 'Great project!',
    userId: '2',
    projectId: '1',
    createdAt: '2024-01-19',
    updatedAt: '2024-01-19'
  }
]

// Create mock client
const mockPrismaClient: MockPrismaClient = {
  project: {
    findMany: async (args?: any) => {
      console.log('Mock: project.findMany', args)
      return mockProjects
    },
    findUnique: async (args: any) => {
      console.log('Mock: project.findUnique', args)
      return mockProjects.find(p => p.id === args.where.id) || null
    },
    create: async (args: any) => {
      console.log('Mock: project.create', args)
      const newProject = {
        id: Date.now().toString(),
        ...args.data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      mockProjects.push(newProject)
      return newProject
    },
    update: async (args: any) => {
      console.log('Mock: project.update', args)
      const index = mockProjects.findIndex(p => p.id === args.where.id)
      if (index !== -1) {
        mockProjects[index] = { ...mockProjects[index], ...args.data, updatedAt: new Date().toISOString() }
        return mockProjects[index]
      }
      return null
    },
    delete: async (args: any) => {
      console.log('Mock: project.delete', args)
      const index = mockProjects.findIndex(p => p.id === args.where.id)
      if (index !== -1) {
        const deleted = mockProjects[index]
        mockProjects.splice(index, 1)
        return deleted
      }
      return null
    }
  },
  user: {
    findMany: async (args?: any) => {
      console.log('Mock: user.findMany', args)
      return mockUsers
    },
    findUnique: async (args: any) => {
      console.log('Mock: user.findUnique', args)
      return mockUsers.find(u => u.id === args.where.id) || null
    },
    create: async (args: any) => {
      console.log('Mock: user.create', args)
      const newUser = {
        id: Date.now().toString(),
        ...args.data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      mockUsers.push(newUser)
      return newUser
    },
    update: async (args: any) => {
      console.log('Mock: user.update', args)
      const index = mockUsers.findIndex(u => u.id === args.where.id)
      if (index !== -1) {
        mockUsers[index] = { ...mockUsers[index], ...args.data, updatedAt: new Date().toISOString() }
        return mockUsers[index]
      }
      return null
    }
  },
  like: {
    findMany: async (args?: any) => {
      console.log('Mock: like.findMany', args)
      return mockLikes
    },
    create: async (args: any) => {
      console.log('Mock: like.create', args)
      const newLike = { id: Date.now().toString(), ...args.data }
      mockLikes.push(newLike)
      return newLike
    },
    delete: async (args: any) => {
      console.log('Mock: like.delete', args)
      const index = mockLikes.findIndex(l => l.userId === args.where.userId && l.projectId === args.where.projectId)
      if (index !== -1) {
        const deleted = mockLikes[index]
        mockLikes.splice(index, 1)
        return deleted
      }
      return null
    }
  },
  comment: {
    findMany: async (args?: any) => {
      console.log('Mock: comment.findMany', args)
      return mockComments
    },
    create: async (args: any) => {
      console.log('Mock: comment.create', args)
      const newComment = { id: Date.now().toString(), ...args.data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      mockComments.push(newComment)
      return newComment
    }
  },
  deal: {
    findMany: async (args?: any) => {
      console.log('Mock: deal.findMany', args)
      let filteredDeals = mockDeals
      
      if (args?.where?.status) {
        filteredDeals = filteredDeals.filter(deal => deal.status === args.where.status)
      }
      if (args?.where?.buyerId) {
        filteredDeals = filteredDeals.filter(deal => deal.buyerId === args.where.buyerId)
      }
      if (args?.where?.sellerId) {
        filteredDeals = filteredDeals.filter(deal => deal.sellerId === args.where.sellerId)
      }
      
      return filteredDeals
    },
    create: async (args: any) => {
      console.log('Mock: deal.create', args)
      const newDeal = { id: Date.now().toString(), ...args.data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      mockDeals.push(newDeal)
      return newDeal
    }
  },
  codeFile: {
    findMany: async (args?: any) => {
      console.log('Mock: codeFile.findMany', args)
      return []
    },
    findUnique: async (args: any) => {
      console.log('Mock: codeFile.findUnique', args)
      return null
    },
    create: async (args: any) => {
      console.log('Mock: codeFile.create', args)
      return { id: Date.now().toString(), ...args.data, size: args.data.content?.length || 0 }
    },
    update: async (args: any) => {
      console.log('Mock: codeFile.update', args)
      return { id: Date.now().toString(), ...args.data }
    },
    delete: async (args: any) => {
      console.log('Mock: codeFile.delete', args)
      return { id: Date.now().toString() }
    }
  },
  codeFolder: {
    findMany: async (args?: any) => {
      console.log('Mock: codeFolder.findMany', args)
      return []
    },
    findUnique: async (args: any) => {
      console.log('Mock: codeFolder.findUnique', args)
      return null
    },
    create: async (args: any) => {
      console.log('Mock: codeFolder.create', args)
      return { id: Date.now().toString(), ...args.data }
    },
    update: async (args: any) => {
      console.log('Mock: codeFolder.update', args)
      return { id: Date.now().toString(), ...args.data }
    },
    delete: async (args: any) => {
      console.log('Mock: codeFolder.delete', args)
      return { id: Date.now().toString() }
    }
  }
}

export const prisma = mockPrismaClient
