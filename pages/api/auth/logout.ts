import type { NextApiRequest, NextApiResponse } from 'next'
import { ApiResponse } from '../../../src/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  res.setHeader('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0')
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  })
}
