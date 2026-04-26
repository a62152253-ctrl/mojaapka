import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { comparePassword, generateToken } from '../../../src/lib/auth'
import { loginSchema } from '../../../src/lib/validations'
import { ApiResponse, AuthResponse } from '../../../src/types'

const prisma = new PrismaClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<AuthResponse>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const validatedData = loginSchema.parse(req.body)
    
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (!user || !user.password) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }

    const isValidPassword = await comparePassword(validatedData.password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }

    const userResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      accountType: user.accountType,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    const token = generateToken(userResponse)

    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=604800`)

    res.status(200).json({
      success: true,
      data: { user: userResponse, token }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
