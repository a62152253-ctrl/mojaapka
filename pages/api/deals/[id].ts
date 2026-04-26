import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { verifyToken, getTokenFromRequest } from '../../../src/lib/auth'
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
  res: NextApiResponse<ApiResponse<Deal>>
) {
  const { id } = req.query
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ success: false, error: 'Invalid deal ID' })
  }

  try {
    const deal = await prisma.deal.findUnique({
      where: { id },
      include: {
        buyer: {
          select: { id: true, username: true, avatar: true }
        },
        seller: {
          select: { id: true, username: true, avatar: true }
        },
        project: {
          select: { id: true, title: true, slug: true, images: true, price: true }
        }
      }
    })
    
    if (!deal) {
      return res.status(404).json({ success: false, error: 'Deal not found' })
    }
    
    if (req.method === 'GET') {
      const authUser = await getAuthUser(req)
      if (!authUser || (deal.buyerId !== authUser.userId && deal.sellerId !== authUser.userId)) {
        return res.status(403).json({ success: false, error: 'Forbidden' })
      }
      
      return res.status(200).json({
        success: true,
        data: deal
      })
    }
    
    if (req.method === 'PUT') {
      const authUser = await getAuthUser(req)
      if (!authUser) {
        return res.status(401).json({ success: false, error: 'Unauthorized' })
      }
      
      if (deal.sellerId !== authUser.userId) {
        return res.status(403).json({ success: false, error: 'Only seller can update deal status' })
      }
      
      const { status } = req.body
      
      if (!['ACCEPTED', 'REJECTED', 'COMPLETED'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status' })
      }
      
      if (deal.status !== 'PENDING' && status !== 'COMPLETED') {
        return res.status(400).json({ success: false, error: 'Cannot update non-pending deal' })
      }
      
      const updatedDeal = await prisma.deal.update({
        where: { id },
        data: { status },
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
      
      if (status === 'COMPLETED') {
        await prisma.project.update({
          where: { id: deal.projectId },
          data: { status: 'SOLD' }
        })
      }
      
      return res.status(200).json({
        success: true,
        data: updatedDeal
      })
    }
    
    return res.status(405).json({ success: false, error: 'Method not allowed' })
    
  } catch (error) {
    console.error('Deal API error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
