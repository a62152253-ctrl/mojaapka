import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { User } from '../types/index'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
const TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '7d'

export interface JWTPayload {
  userId: string
  email: string
  username: string
  accountType: string
  type: 'access' | 'refresh'
  iat?: number
  exp?: number
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface AuthResult {
  user: Omit<User, 'password'>
  tokens: TokenPair
}

export const generateTokenPair = (user: User): TokenPair => {
  const now = Math.floor(Date.now() / 1000)
  
  const accessPayload: Omit<JWTPayload, 'type'> = {
    userId: user.id,
    email: user.email,
    username: user.username,
    accountType: user.accountType,
  }
  
  const refreshPayload: Omit<JWTPayload, 'type'> = {
    userId: user.id,
    email: user.email,
    username: user.username,
    accountType: user.accountType,
  }
  
  const accessToken = jwt.sign(
    { ...accessPayload, type: 'access' as const, iat: now }, 
    JWT_SECRET, 
    { expiresIn: TOKEN_EXPIRY }
  )
  
  const refreshToken = jwt.sign(
    { ...refreshPayload, type: 'refresh' as const, iat: now }, 
    JWT_REFRESH_SECRET, 
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  )
  
  return { accessToken, refreshToken }
}

export const generateToken = (user: User): string => {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
    accountType: user.accountType,
    type: 'access'
  }
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

export const verifyToken = (token: string, type: 'access' | 'refresh' = 'access'): JWTPayload | null => {
  try {
    const secret = type === 'access' ? JWT_SECRET : JWT_REFRESH_SECRET
    const payload = jwt.verify(token, secret) as JWTPayload
    
    if (payload.type !== type) {
      return null
    }
    
    return payload
  } catch (error) {
    console.error('Token verification error:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

export const refreshAccessToken = (refreshToken: string): string | null => {
  try {
    const payload = verifyToken(refreshToken, 'refresh')
    if (!payload) {
      return null
    }
    
    const accessPayload: Omit<JWTPayload, 'type' | 'iat' | 'exp'> = {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
      accountType: payload.accountType,
    }
    
    return jwt.sign(
      { ...accessPayload, type: 'access' as const }, 
      JWT_SECRET, 
      { expiresIn: TOKEN_EXPIRY }
    )
  } catch (error) {
    console.error('Token refresh error:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

export const hashPassword = async (password: string): Promise<string> => {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }
  
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(password, salt)
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error('Password comparison error:', error)
    return false
  }
}

export const validatePasswordStrength = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const getTokenFromRequest = (req: any): string | null => {
  const authHeader = req.headers?.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    if (token && token.split('.').length === 3) {
      return token
    }
  }
  
  const cookieToken = req.cookies?.token
  if (cookieToken && cookieToken.split('.').length === 3) {
    return cookieToken
  }
  
  return null
}

export const generateSecureToken = (): string => {
  return crypto.randomBytes(32).toString('hex')
}

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '')
}

export const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export const rateLimitCheck = (identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean => {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= maxAttempts) {
    return false
  }
  
  record.count++
  return true
}
