import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { verifyToken, getTokenFromRequest, rateLimitCheck } from '../../src/lib/auth'
import { commentSchema } from '../../src/lib/validations'
import { ApiResponse, Comment } from '../../src/types/index'

const prisma = new PrismaClient()

// Comment cache with 5-minute TTL
const commentCache = new Map<string, { data: Comment[]; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000

function getCachedComments(projectId: string): Comment[] | null {
  const cached = commentCache.get(projectId)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  if (cached) {
    commentCache.delete(projectId)
  }
  return null
}

function setCachedComments(projectId: string, data: Comment[]): void {
  commentCache.set(projectId, { data, timestamp: Date.now() })
}

async function getAuthUser(req: NextApiRequest) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) return null
    
    const payload = verifyToken(token)
    if (!payload) return null
    
    return payload
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

function validateProjectId(projectId: string): boolean {
  return typeof projectId === 'string' && projectId.length > 0 && projectId.length <= 255 && /^[a-zA-Z0-9-_]+$/.test(projectId)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Comment | Comment[]>>
) {
  // Rate limiting
  const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
  if (!rateLimitCheck(clientIP, 10, 60000)) { // 10 requests per minute
    return res.status(429).json({ 
      success: false, 
      error: 'Too many requests',
      message: 'Please try again later'
    })
  }

  try {
    if (req.method === 'GET') {
      const { projectId, page = '1', limit = '20' } = req.query
      
      if (!projectId || typeof projectId !== 'string' || !validateProjectId(projectId)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid project ID',
          message: 'Project ID must be a valid string'
        })
      }
      
      // Check cache first
      const cacheKey = `${projectId}:${page}:${limit}`
      const cachedComments = getCachedComments(cacheKey)
      if (cachedComments) {
        return res.status(200).json({
          success: true,
          data: cachedComments,
          cached: true
        })
      }
      
      const pageNum = parseInt(page as string, 10)
      const limitNum = Math.min(parseInt(limit as string, 10), 50) // Max 50 per request
      
      const [comments, totalCount] = await Promise.all([
        prisma.comment.findMany({
          where: { projectId },
          include: {
            user: {
              select: { id: true, username: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip: (pageNum - 1) * limitNum,
          take: limitNum
        }),
        prisma.comment.count({ where: { projectId } })
      ])
      
      setCachedComments(cacheKey, comments)
      
      return res.status(200).json({
        success: true,
        data: comments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitNum)
        }
      })
    }
    
    if (req.method === 'POST') {
      const authUser = await getAuthUser(req)
      if (!authUser) {
        return res.status(401).json({ 
          success: false, 
          error: 'Unauthorized',
          message: 'Authentication required'
        })
      }
      
      // Validate request body
      let validatedData
      try {
        validatedData = commentSchema.parse(req.body)
      } catch (validationError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid input data',
          message: validationError instanceof Error ? validationError.message : 'Validation failed'
        })
      }
      
      // Check if project exists and is published
      const project = await prisma.project.findUnique({
        where: { id: validatedData.projectId },
        select: { id: true, title: true, status: true }
      })
      
      if (!project) {
        return res.status(404).json({ 
          success: false, 
          error: 'Project not found',
          message: 'The specified project does not exist'
        })
      }
      
      if (project.status !== 'PUBLISHED') {
        return res.status(400).json({ 
          success: false, 
          error: 'Project not available',
          message: 'Comments can only be added to published projects'
        })
      }
      
      // Check for duplicate comments (same user, same project, within 1 minute)
      const recentComment = await prisma.comment.findFirst({
        where: {
          userId: authUser.userId,
          projectId: validatedData.projectId,
          createdAt: {
            gte: new Date(Date.now() - 60000) // 1 minute ago
          }
        }
      })
      
      if (recentComment) {
        return res.status(429).json({
          success: false,
          error: 'Duplicate comment',
          message: 'Please wait before posting another comment'
        })
      }
      
      const comment = await prisma.comment.create({
        data: {
          content: validatedData.content.trim(),
          userId: authUser.userId,
          projectId: validatedData.projectId
        },
        include: {
          user: {
            select: { id: true, username: true, avatar: true }
          },
          project: {
            select: { id: true, title: true }
          }
        }
      })
      
      // Clear cache for this project
      commentCache.delete(validatedData.projectId)
      
      return res.status(201).json({
        success: true,
        data: comment,
        message: 'Comment posted successfully'
      })
    }
    
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed',
      message: 'Only GET and POST methods are supported'
    })
    
  } catch (error) {
    console.error('Comments API error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      method: req.method,
      body: req.body,
      query: req.query,
      timestamp: new Date().toISOString()
    })
    
    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: isDevelopment ? (error instanceof Error ? error.message : 'Unknown error') : 'An unexpected error occurred'
    })
  }
}
