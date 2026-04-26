import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { ApiResponse, Project } from '../../../src/types'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Project>>
) {
  const { slug } = req.query
  
  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid slug' })
  }

  try {
    if (req.method === 'GET') {
      const project = await prisma.project.findUnique({
        where: { 
          slug,
          status: 'PUBLISHED' // Only return published projects to users
        },
        include: {
          author: {
            select: { 
              id: true, 
              username: true, 
              avatar: true, 
              bio: true 
            }
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
        return res.status(404).json({ 
          success: false, 
          error: 'Project not found or not published' 
        })
      }
      
      return res.status(200).json({
        success: true,
        data: project
      })
    }
    
    return res.status(405).json({ success: false, error: 'Method not allowed' })
    
  } catch (error) {
    console.error('Project by slug API error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
