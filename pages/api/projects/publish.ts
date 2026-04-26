import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { verifyToken, getTokenFromRequest } from '../../../src/lib/auth'
import { ApiResponse, Project } from '../../../src/types'

const prisma = new PrismaClient()

async function getAuthUser(req: NextApiRequest) {
  const token = getTokenFromRequest(req)
  if (!token) return null
  
  const payload = verifyToken(token)
  if (!payload) return null
  
  return payload
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Project>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const authUser = await getAuthUser(req)
  if (!authUser || authUser.accountType !== 'DEVELOPER') {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }

  const { projectId } = req.body

  if (!projectId) {
    return res.status(400).json({ success: false, error: 'Project ID is required' })
  }

  try {
    // Check if project belongs to the developer
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' })
    }

    if (project.authorId !== authUser.userId) {
      return res.status(403).json({ success: false, error: 'Forbidden' })
    }

    // Publish project - make it visible to all users
    const publishedProject = await prisma.project.update({
      where: { id: projectId },
      data: { status: 'PUBLISHED' },
      include: {
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
    })

    res.status(200).json({
      success: true,
      data: publishedProject,
      message: 'Project published successfully! It is now visible to all users.'
    })

  } catch (error) {
    console.error('Publish project error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
