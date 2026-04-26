import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { verifyToken, getTokenFromRequest } from '../../../src/lib/auth'
import { ApiResponse, User } from '../../../src/types'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<User>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const token = getTokenFromRequest(req)
  if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' })
  }

  const payload = verifyToken(token)
  if (!payload) {
    return res.status(401).json({ success: false, error: 'Invalid token' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
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

    res.status(200).json({
      success: true,
      data: user
    })

  } catch (error) {
    console.error('Get current user error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
