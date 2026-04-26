import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  accountType: z.enum(['USER', 'DEVELOPER']),
})

export const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  demoUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  images: z.array(z.string().url()).optional(),
})

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment too long'),
  projectId: z.string().min(1, 'Project ID is required'),
})

export const dealSchema = z.object({
  price: z.number().min(0, 'Price must be positive'),
  type: z.enum(['BUY', 'LICENSE']),
  message: z.string().max(500, 'Message too long').optional(),
  projectId: z.string().min(1, 'Project ID is required'),
  sellerId: z.string().min(1, 'Seller ID is required'),
})

export const searchSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  sortBy: z.enum(['createdAt', 'price', 'likesCount']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(50).optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ProjectInput = z.infer<typeof projectSchema>
export type CommentInput = z.infer<typeof commentSchema>
export type DealInput = z.infer<typeof dealSchema>
export type SearchInput = z.infer<typeof searchSchema>
