import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { verifyToken, getTokenFromRequest } from '../../../src/lib/auth'
import { dealSchema } from '../../../src/lib/validations'
import { ApiResponse, Deal } from '../../../src/types'

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
  res: NextApiResponse<ApiResponse<Deal | Deal[]>>
) {
  try {
    if (req.method === 'GET') {
      const authUser = await getAuthUser(req)
      if (!authUser) {
        return res.status(401).json({ success: false, error: 'Unauthorized' })
      }
      
      const { status, type, page = 1, limit = 10 } = req.query
      
      const where: any = {}
      
      if (authUser.accountType === 'USER') {
        where.buyerId = authUser.userId
      } else {
        where.sellerId = authUser.userId
      }
      
      if (status && typeof status === 'string') {
        where.status = status
      }
      
      if (type && typeof type === 'string') {
        where.type = type
      }
      
      const skip = (Number(page) - 1) * Number(limit)
      
      const deals = await prisma.deal.findMany({
        where,
        include: {
          buyer: {
            select: { id: true, username: true, avatar: true }
          },
          seller: {
            select: { id: true, username: true, avatar: true }
          },
          project: {
            select: { id: true, title: true, slug: true, images: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      })
      
      const total = await prisma.deal.count({ where })
      
      return res.status(200).json({
        success: true,
        data: deals,
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
      if (!authUser || authUser.accountType !== 'USER') {
        return res.status(401).json({ success: false, error: 'Unauthorized' })
      }
      
      const validatedData = dealSchema.parse(req.body)
      
      const project = await prisma.project.findUnique({
        where: { id: validatedData.projectId }
      })
      
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' })
      }
      
      if (project.authorId === authUser.userId) {
        return res.status(400).json({ success: false, error: 'Cannot buy your own project' })
      }
      
      const existingDeal = await prisma.deal.findFirst({
        where: {
          buyerId: authUser.userId,
          projectId: validatedData.projectId,
          status: { in: ['PENDING', 'ACCEPTED'] }
        }
      })
      
      if (existingDeal) {
        return res.status(400).json({ success: false, error: 'Deal already exists' })
      }
      
      const deal = await prisma.deal.create({
        data: {
          price: validatedData.price,
          type: validatedData.type,
          message: validatedData.message,
          buyerId: authUser.userId,
          sellerId: validatedData.sellerId,
          projectId: validatedData.projectId
        },
        include: {
          buyer: {
            select: { id: true, username: true, avatar: true }
          },
          seller: {
            select: { id: true, username: true, avatar: true }
          },
          project: {
            select: { id: true, title: true, slug: true, images: true }
          }
        }
      })
      
      return res.status(201).json({
        success: true,
        data: deal
      })
    }
    
    return res.status(405).json({ success: false, error: 'Method not allowed' })
    
  } catch (error) {
    console.error('Deals API error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
