import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { verifyToken, getTokenFromRequest } from '../../src/lib/auth'
import { ApiResponse, Like } from '../../src/types'

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
  res: NextApiResponse<ApiResponse<Like>>
) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const authUser = await getAuthUser(req)
  if (!authUser) {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }

  const { projectId } = req.body

  if (!projectId) {
    return res.status(400).json({ success: false, error: 'Project ID is required' })
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' })
    }

    if (req.method === 'POST') {
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_projectId: {
            userId: authUser.userId,
            projectId
          }
        }
      })

      if (existingLike) {
        return res.status(400).json({ success: false, error: 'Already liked' })
      }

      const like = await prisma.like.create({
        data: {
          userId: authUser.userId,
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

      return res.status(201).json({
        success: true,
        data: like
      })
    }

    if (req.method === 'DELETE') {
      const like = await prisma.like.findUnique({
        where: {
          userId_projectId: {
            userId: authUser.userId,
            projectId
          }
        }
      })

      if (!like) {
        return res.status(404).json({ success: false, error: 'Like not found' })
      }

      await prisma.like.delete({
        where: { id: like.id }
      })

      return res.status(200).json({
        success: true,
        message: 'Like removed successfully'
      })
    }

  } catch (error) {
    console.error('Likes API error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
