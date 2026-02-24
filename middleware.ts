import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Edge middleware for auth-gating protected routes.
 * Reads the `token` cookie (set by auth.tsx on login).
 * If no token and user tries to access protected paths, redirect to landing.
 */

const PROTECTED_PREFIXES = ['/dashboard', '/article', '/quiz', '/leaderboard', '/profile', '/onboarding']
const PUBLIC_PATHS = ['/', '/login', '/register']
const PUBLIC_PREFIXES = ['/auth', '/_next', '/favicon', '/api']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Allow public paths and Next.js internals
    if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next()
    if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) return NextResponse.next()

    // Check if this is a protected route
    const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))
    if (!isProtected) return NextResponse.next()

    // Check for auth token in cookie
    const token = request.cookies.get('token')?.value

    if (!token) {
        // Redirect to landing page
        const loginUrl = new URL('/', request.url)
        return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except static files and images
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
