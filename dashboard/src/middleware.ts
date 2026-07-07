import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('zarss_session')
  const { pathname } = request.nextUrl

  // Skip static assets, Next internals, api/login, login page, and Meta webhook
  // IMPORTANT: /api/meta/webhook MUST be public — Meta sends unauthenticated GET challenges
  // and POST events. Any auth gate here will break webhook verification and event delivery.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/login') ||
    pathname.startsWith('/api/meta/webhook') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/fonts') ||
    pathname === '/login'
  ) {
    return NextResponse.next()
  }

  // If there is no valid session, redirect to /login
  if (!session || session.value !== 'true') {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
