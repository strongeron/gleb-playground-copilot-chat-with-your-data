import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Basic password protection
const BASIC_AUTH_USERNAME = process.env.BASIC_AUTH_USERNAME || 'admin'
const BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD || 'your-secure-password-here'

export function middleware(request: NextRequest) {
  // Skip password protection for static assets and API routes that need public access
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next()
  }

  // Check for basic auth header
  const basicAuth = request.headers.get('authorization')

  if (basicAuth) {
    const auth = basicAuth.split(' ')[1]
    const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':')

    if (user === BASIC_AUTH_USERNAME && pwd === BASIC_AUTH_PASSWORD) {
      return NextResponse.next()
    }
  }

  // Return 401 with basic auth challenge
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
      'Content-Type': 'text/plain',
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
