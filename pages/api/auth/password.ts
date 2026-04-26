import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { verifyToken, getTokenFromRequest, comparePassword, hashPassword } from '../../../src/lib/auth'
import { ApiResponse } from '../../../src/types'

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
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const authUser = await getAuthUser(req)
  if (!authUser) {
    return res.status(401).json({ success: false, error: 'Unauthorized' })
  }

  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: 'Current password and new password are required' })
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' })
  }

  try {
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { password: true }
    })

    if (!user || !user.password) {
      return res.status(400).json({ success: false, error: 'User not found' })
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.password)
    if (!isValidPassword) {
      return res.status(400).json({ success: false, error: 'Current password is incorrect' })
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword)

    // Update password
    await prisma.user.update({
      where: { id: authUser.userId },
      data: { password: hashedNewPassword }
    })

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    })

  } catch (error) {
    console.error('Password update error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
