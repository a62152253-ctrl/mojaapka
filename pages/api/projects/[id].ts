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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Project>>
) {
  const { id } = req.query
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid project ID' })
  }

  try {
    if (req.method === 'GET') {
      const project = await prisma.project.findUnique({
        where: { 
          id,
          OR: [
            { status: 'PUBLISHED' },
            { status: 'SOLD' }
          ]
        },
        include: {
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
      })
      
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' })
      }
      
      return res.status(200).json({
        success: true,
        data: project
      })
    }
    
    if (req.method === 'PUT') {
      const authUser = await getAuthUser(req)
      if (!authUser) {
        return res.status(401).json({ success: false, error: 'Unauthorized' })
      }
      
      const project = await prisma.project.findUnique({
        where: { id }
      })
      
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' })
      }
      
      if (project.authorId !== authUser.userId) {
        return res.status(403).json({ success: false, error: 'Forbidden' })
      }
      
      const validatedData = projectSchema.parse(req.body)
      
      const updatedProject = await prisma.project.update({
        where: { id },
        data: validatedData,
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
      
      return res.status(200).json({
        success: true,
        data: updatedProject
      })
    }
    
    if (req.method === 'DELETE') {
      const authUser = await getAuthUser(req)
      if (!authUser) {
        return res.status(401).json({ success: false, error: 'Unauthorized' })
      }
      
      const project = await prisma.project.findUnique({
        where: { id }
      })
      
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' })
      }
      
      if (project.authorId !== authUser.userId) {
        return res.status(403).json({ success: false, error: 'Forbidden' })
      }
      
      await prisma.project.delete({
        where: { id }
      })
      
      return res.status(200).json({
        success: true,
        message: 'Project deleted successfully'
      })
    }
    
    return res.status(405).json({ success: false, error: 'Method not allowed' })
    
  } catch (error) {
    console.error('Project API error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
