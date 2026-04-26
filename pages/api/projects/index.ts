import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { verifyToken, getTokenFromRequest } from '../../../src/lib/auth'
import { projectSchema, searchSchema } from '../../../src/lib/validations'
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
  res: NextApiResponse<ApiResponse<Project | Project[]>>
) {
  try {
    if (req.method === 'GET') {
      const { query, category, tags, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc', page = 1, limit = 12 } = req.query
      
      const where: any = { status: 'PUBLISHED' }
      
      if (query && typeof query === 'string') {
        where.OR = [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ]
      }
      
      if (category && typeof category === 'string') {
        where.category = category
      }
      
      if (tags && typeof tags === 'string') {
        const tagArray = tags.split(',')
        where.tags = { hasSome: tagArray }
      }
      
      if (minPrice || maxPrice) {
        where.price = {}
        if (minPrice) where.price.gte = Number(minPrice)
        if (maxPrice) where.price.lte = Number(maxPrice)
      }
      
      const skip = (Number(page) - 1) * Number(limit)
      
      const projects = await prisma.project.findMany({
        where,
        include: {
          author: {
            select: { id: true, username: true, avatar: true }
          },
          likes: {
            select: { userId: true }
          },
          comments: {
            select: { id: true }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        },
        orderBy: { [sortBy as string]: sortOrder as 'asc' | 'desc' },
        skip,
        take: Number(limit)
      })
      
      const total = await prisma.project.count({ where })
      
      return res.status(200).json({
        success: true,
        data: projects,
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      })
    }
    
    if (req.method === 'POST') {
      const authUser = await getAuthUser(req)
      if (!authUser || authUser.accountType !== 'DEVELOPER') {
        return res.status(401).json({ success: false, error: 'Unauthorized' })
      }
      
      const validatedData = projectSchema.parse(req.body)
      
      const slug = validatedData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + Date.now()
      
      const project = await prisma.project.create({
        data: {
          ...validatedData,
          slug,
          authorId: authUser.userId,
          status: 'DRAFT'
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
        }
      })
      
      return res.status(201).json({
        success: true,
        data: project
      })
    }
    
    return res.status(405).json({ success: false, error: 'Method not allowed' })
    
  } catch (error) {
    console.error('Projects API error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
