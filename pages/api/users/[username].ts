import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { ApiResponse, User, Project } from '../../../src/types'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ user: User; projects: Project[] }>>
) {
  const { username } = req.query
  
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ success: false, error: 'Username is required' })
  }

  try {
    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        email: true,
        username: true,
        accountType: true,
        avatar: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' })
    }

    // Get user's published projects
    const projects = await prisma.project.findMany({
      where: { 
        authorId: user.id,
        status: 'PUBLISHED'
      },
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
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // Calculate stats
    const stats = {
      projectsCount: projects.length,
      totalLikes: projects.reduce((sum: number, project: any) => sum + project._count.likes, 0),
      totalComments: projects.reduce((sum: number, project: any) => sum + project._count.comments, 0),
      totalSales: 0 // TODO: Calculate from completed deals
    }

    res.status(200).json({
      success: true,
      data: {
        user: { ...user, ...stats },
        projects
      }
    })

  } catch (error) {
    console.error('Get user profile error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
