import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { verifyToken, getTokenFromRequest } from '../../../src/lib/auth'
import { ApiResponse, User } from '../../../src/types'

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
  res: NextApiResponse<ApiResponse<User>>
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const authUser = await getAuthUser(req)
  if (!authUser) {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }

  const { username, bio } = req.body

  try {
    // Check if username is already taken (if changing)
    if (username && username !== authUser.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      })
      
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'Username already taken' })
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: authUser.userId },
      data: {
        ...(username && { username }),
        ...(bio !== undefined && { bio }),
      },
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

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
