import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { verifyToken, getTokenFromRequest } from '../../../src/lib/auth'
import { projectSchema } from '../../../src/lib/validations'
import { ApiResponse, Project } from '../../../src/types'

const prisma = new PrismaClient()

async function getAuthUser(req: NextApiRequest) {
  const token = getTokenFromRequest(req)
  if (!token) return null
  
  const payload = verifyToken(token)
  if (!payload) return null
  
  return payload
}

function validateProjectId(id: any): id is string {
  return id && typeof id === 'string'
}

function getProjectIncludeQuery() {
  return {
    author: {
      select: { id: true, username: true, avatar: true, bio: true }
    },
    likes: {
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    },
    comments: {
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    },
    _count: {
      select: {
        likes: true,
        comments: true
      }
    }
  }
}

function getSimpleProjectIncludeQuery() {
  return {
    author: {
      select: { id: true, username: true, avatar: true }
    },
    _count: {
      select: {
        likes: true,
        comments: true
      }
    }
  }
}

async function handleGetProject(id: string, res: NextApiResponse) {
  const project = await prisma.project.findUnique({
    where: { 
      id,
      OR: [
        { status: 'PUBLISHED' },
        { status: 'SOLD' }
      ]
    },
    include: getProjectIncludeQuery()
  })
  
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' })
  }
  
  return res.status(200).json({
    success: true,
    data: project
  })
}

async function validateProjectOwnership(id: string, authUser: any) {
  const project = await prisma.project.findUnique({
    where: { id }
  })
  
  if (!project) {
    return { error: 'Project not found', status: 404, project: null }
  }
  
  if (project.authorId !== authUser.userId) {
    return { error: 'Forbidden', status: 403, project }
  }
  
  return { error: null, status: null, project }
}

async function handlePutProject(id: string, req: NextApiRequest, res: NextApiResponse) {
  const authUser = await getAuthUser(req)
  if (!authUser) {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }
  
  const validation = await validateProjectOwnership(id, authUser)
  if (validation.error) {
    return res.status(validation.status).json({ success: false, error: validation.error })
  }
  
  const validatedData = projectSchema.parse(req.body)
  
  const updatedProject = await prisma.project.update({
    where: { id },
    data: validatedData,
    include: getSimpleProjectIncludeQuery()
  })
  
  return res.status(200).json({
    success: true,
    data: updatedProject
  })
}

async function handleDeleteProject(id: string, req: NextApiRequest, res: NextApiResponse) {
  const authUser = await getAuthUser(req)
  if (!authUser) {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }
  
  const validation = await validateProjectOwnership(id, authUser)
  if (validation.error) {
    return res.status(validation.status).json({ success: false, error: validation.error })
  }
  
  await prisma.project.delete({
    where: { id }
  })
  
  return res.status(200).json({
    success: true,
    message: 'Project deleted successfully'
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Project>>
) {
  const { id } = req.query
  
  if (!validateProjectId(id)) {
    return res.status(400).json({ success: false, error: 'Invalid project ID' })
  }

  try {
    if (req.method === 'GET') {
      return await handleGetProject(id, res)
    }
    
    if (req.method === 'PUT') {
      return await handlePutProject(id, req, res)
    }
    
    if (req.method === 'DELETE') {
      return await handleDeleteProject(id, req, res)
    }
    
    return res.status(405).json({ success: false, error: 'Method not allowed' })
    
  } catch (error) {
    console.error('Project API error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
