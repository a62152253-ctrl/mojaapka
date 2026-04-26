import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './src/lib/auth'

// Paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/dashboard/',
  '/projects/new',
  '/dashboard/projects',
  '/dashboard/projects/new',
  '/dashboard/deals',
  '/dashboard/settings',
  '/api/projects',
  '/api/deals',
  '/api/likes',
  '/api/comments',
  '/api/auth/profile',
  '/api/auth/password'
]

// Paths that redirect to dashboard if user is developer
const developerRedirectPaths = ['/']

// Paths that redirect to home if user is regular user
const userRedirectPaths = ['/dashboard', '/dashboard/']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('token')?.value

  // Check if path requires authentication
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  
  if (isProtectedPath && !token) {
    // Redirect to login if trying to access protected route without token
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (token) {
    try {
      const payload = verifyToken(token)
      
      if (payload) {
        // User is authenticated, check role-based redirects
        const isDeveloper = payload.accountType === 'DEVELOPER'
        const isRegularUser = payload.accountType === 'USER'

        // Redirect developers away from user-only routes
        if (isDeveloper && userRedirectPaths.some(path => pathname.startsWith(path))) {
          return NextResponse.redirect(new URL('/dashboard', req.url))
        }

        // Redirect regular users away from developer-only routes
        if (isRegularUser && developerRedirectPaths.some(path => pathname.startsWith(path))) {
          return NextResponse.redirect(new URL('/projects', req.url))
        }

        // Add user info to headers for API routes
        const requestHeaders = new Headers(req.headers)
        requestHeaders.set('x-user-id', payload.userId)
        requestHeaders.set('x-user-email', payload.email)
        requestHeaders.set('x-user-username', payload.username)
        requestHeaders.set('x-user-role', payload.accountType)

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
      }
    } catch (error) {
      // Invalid token, clear it and redirect to login
      const response = NextResponse.redirect(new URL('/login', req.url))
      response.cookies.delete('token')
      return response
    }
  }

  // Allow access to login/register pages
  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
