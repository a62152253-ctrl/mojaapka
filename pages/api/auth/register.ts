import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { hashPassword, generateToken } from '../../../src/lib/auth'
import { registerSchema } from '../../../src/lib/validations'
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
    const validatedData = registerSchema.parse(req.body)
    
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username }
        ]
      }
    })

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: existingUser.email === validatedData.email ? 'Email already exists' : 'Username already exists'
      })
    }

    const hashedPassword = await hashPassword(validatedData.password)

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        username: validatedData.username,
        password: hashedPassword,
        accountType: validatedData.accountType,
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

    const token = generateToken(user)

    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=604800`)

    res.status(201).json({
      success: true,
      data: { user, token }
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}
