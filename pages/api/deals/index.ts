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

function getDealIncludeQuery() {
  return {
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
}

function buildWhereClause(authUser: any, status: any, type: any) {
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
  
  return where
}

function getPaginationParams(page: any, limit: any) {
  const pageNum = Number(page)
  const limitNum = Number(limit)
  const skip = (pageNum - 1) * limitNum
  
  return { pageNum, limitNum, skip }
}

async function handleGetDeals(req: NextApiRequest, res: NextApiResponse) {
  const authUser = await getAuthUser(req)
  if (!authUser) {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }
  
  const { status, type, page = 1, limit = 10 } = req.query
  
  const where = buildWhereClause(authUser, status, type)
  const { pageNum, limitNum, skip } = getPaginationParams(page, limit)
  
  const deals = await prisma.deal.findMany({
    where,
    include: getDealIncludeQuery(),
    orderBy: { createdAt: 'desc' },
    skip,
    take: limitNum
  })
  
  const total = await prisma.deal.count({ where })
  
  return res.status(200).json({
    success: true,
    data: deals,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    }
  })
}

async function validateDealCreation(validatedData: any, authUser: any) {
  const project = await prisma.project.findUnique({
    where: { id: validatedData.projectId }
  })
  
  if (!project) {
    return { error: 'Project not found', status: 404 }
  }
  
  if (project.authorId === authUser.userId) {
    return { error: 'Cannot buy your own project', status: 400 }
  }
  
  const existingDeal = await prisma.deal.findFirst({
    where: {
      buyerId: authUser.userId,
      projectId: validatedData.projectId,
      status: { in: ['PENDING', 'ACCEPTED'] }
    }
  })
  
  if (existingDeal) {
    return { error: 'Deal already exists', status: 400 }
  }
  
  return { error: null, status: null }
}

async function handlePostDeal(req: NextApiRequest, res: NextApiResponse) {
  const authUser = await getAuthUser(req)
  if (!authUser || authUser.accountType !== 'USER') {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }
  
  const validatedData = dealSchema.parse(req.body)
  
  const validation = await validateDealCreation(validatedData, authUser)
  if (validation.error) {
    return res.status(validation.status).json({ success: false, error: validation.error })
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
    include: getDealIncludeQuery()
  })
  
  return res.status(201).json({
    success: true,
    data: deal
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Deal | Deal[]>>
) {
  try {
    if (req.method === 'GET') {
      return await handleGetDeals(req, res)
    }
    
    if (req.method === 'POST') {
      return await handlePostDeal(req, res)
    }
    
    return res.status(405).json({ success: false, error: 'Method not allowed' })
    
  } catch (error) {
    console.error('Deals API error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
