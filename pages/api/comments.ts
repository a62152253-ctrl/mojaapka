import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { verifyToken, getTokenFromRequest } from '../../src/lib/auth'
import { commentSchema } from '../../src/lib/validations'
import { ApiResponse, Comment } from '../../src/types'

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
  res: NextApiResponse<ApiResponse<Comment | Comment[]>>
) {
  try {
    if (req.method === 'GET') {
      const { projectId } = req.query
      
      if (!projectId || typeof projectId !== 'string') {
        return res.status(400).json({ success: false, error: 'Project ID is required' })
      }
      
      const comments = await prisma.comment.findMany({
        where: { projectId },
        include: {
          user: {
            select: { id: true, username: true, avatar: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
      })
      
      return res.status(200).json({
        success: true,
        data: comments
      })
    }
    
    if (req.method === 'POST') {
      const authUser = await getAuthUser(req)
      if (!authUser) {
        return res.status(401).json({ success: false, error: 'Unauthorized' })
      }
      
      const validatedData = commentSchema.parse(req.body)
      
      const project = await prisma.project.findUnique({
        where: { id: validatedData.projectId }
      })
      
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' })
      }
      
      const comment = await prisma.comment.create({
        data: {
          content: validatedData.content,
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
      
      return res.status(201).json({
        success: true,
        data: comment
      })
    }
    
    return res.status(405).json({ success: false, error: 'Method not allowed' })
    
  } catch (error) {
    console.error('Comments API error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
