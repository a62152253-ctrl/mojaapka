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

function handleUnauthenticatedAccess(pathname: string, token: string | undefined, req: NextRequest) {
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  return null
}

function handleRoleBasedRedirects(payload: any, pathname: string, req: NextRequest) {
  const isDeveloper = payload.accountType === 'DEVELOPER'
  const isRegularUser = payload.accountType === 'USER'

  if (isDeveloper && userRedirectPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (isRegularUser && developerRedirectPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/projects', req.url))
  }
  
  return null
}

function createAuthenticatedResponse(payload: any, req: NextRequest) {
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

function handleInvalidToken(req: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', req.url))
  response.cookies.delete('token')
  return response
}

function isPublicRoute(pathname: string) {
  return pathname === '/login' || pathname === '/register'
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('token')?.value

  const unauthResponse = handleUnauthenticatedAccess(pathname, token, req)
  if (unauthResponse) return unauthResponse

  if (token) {
    try {
      const payload = verifyToken(token)
      
      if (payload) {
        const roleRedirectResponse = handleRoleBasedRedirects(payload, pathname, req)
        if (roleRedirectResponse) return roleRedirectResponse

        return createAuthenticatedResponse(payload, req)
      }
    } catch (error) {
      return handleInvalidToken(req)
    }
  }

  if (isPublicRoute(pathname)) {
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
