import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { verifyToken, getTokenFromRequest } from '../../src/lib/auth'
import { ApiResponse, Like } from '../../src/types/index'

const prisma = new PrismaClient()

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
  return typeof projectId === 'string' && projectId.length > 0 && projectId.length <= 255
}

function sanitizeResponse(data: any): any {
  if (!data) return data
  
  const sanitized = { ...data }
  
  if (sanitized.user) {
    sanitized.user = {
      id: sanitized.user.id,
      username: sanitized.user.username,
      avatar: sanitized.user.avatar
    }
  }
  
  if (sanitized.project) {
    sanitized.project = {
      id: sanitized.project.id,
      title: sanitized.project.title
    }
  }
  
  return sanitized
}

async function validateProject(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, title: true, status: true }
  })

  if (!project) {
    throw new Error('Project not found')
  }

  if (project.status !== 'PUBLISHED') {
    throw new Error('Project not available')
  }

  return project
}

async function handleLikeProject(userId: string, projectId: string) {
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId
      }
    }
  })

  if (existingLike) {
    throw new Error('Already liked')
  }

  const like = await prisma.like.create({
    data: {
      userId,
      projectId
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

  return like
}

async function handleUnlikeProject(userId: string, projectId: string) {
  const like = await prisma.like.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId
      }
    }
  })

  if (!like) {
    throw new Error('Like not found')
  }

  await prisma.like.delete({
    where: { id: like.id }
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Like>>
) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed',
      message: 'Only POST and DELETE methods are supported'
    })
  }

  try {
    const authUser = await getAuthUser(req)
    if (!authUser) {
      return res.status(401).json({ 
        success: false, 
        error: 'Unauthorized',
        message: 'Valid authentication token required'
      })
    }

    const { projectId } = req.body

    if (!projectId || !validateProjectId(projectId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid project ID',
        message: 'Project ID is required and must be valid'
      })
    }

    try {
      await validateProject(projectId)
    } catch (projectError) {
      const error = projectError instanceof Error ? projectError : new Error('Project validation failed')
      const statusCode = error.message === 'Project not found' ? 404 : 400
      const message = error.message === 'Project not found' 
        ? 'The specified project does not exist'
        : 'Only published projects can be liked'
      
      return res.status(statusCode).json({ 
        success: false, 
        error: error.message,
        message
      })
    }

    if (req.method === 'POST') {
      try {
        const like = await handleLikeProject(authUser.userId, projectId)
        return res.status(201).json({
          success: true,
          data: sanitizeResponse(like),
          message: 'Project liked successfully'
        })
      } catch (likeError) {
        const error = likeError instanceof Error ? likeError : new Error('Like operation failed')
        if (error.message === 'Already liked') {
          return res.status(409).json({ 
            success: false, 
            error: 'Already liked',
            message: 'You have already liked this project'
          })
        }
        throw error
      }
    }

    if (req.method === 'DELETE') {
      try {
        await handleUnlikeProject(authUser.userId, projectId)
        return res.status(200).json({
          success: true,
          message: 'Like removed successfully'
        })
      } catch (unlikeError) {
        const error = unlikeError instanceof Error ? unlikeError : new Error('Unlike operation failed')
        if (error.message === 'Like not found') {
          return res.status(404).json({ 
            success: false, 
            error: 'Like not found',
            message: 'You have not liked this project'
          })
        }
        throw error
      }
    }

  } catch (error) {
    console.error('Likes API error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      method: req.method,
      body: req.body,
      timestamp: new Date().toISOString()
    })
    
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again later.'
    })
  }
}
