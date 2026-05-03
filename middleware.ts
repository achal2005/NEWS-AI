import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Edge middleware for auth-gating protected routes.
 * FIX 3: Reads the `auth_token` HttpOnly cookie (set by backend).
 * Edge middleware CAN read HttpOnly cookies — they are sent with every request.
 */

const PROTECTED_PREFIXES = ['/dashboard', '/article', '/quiz', '/leaderboard', '/profile', '/onboarding']
const PUBLIC_PATHS = ['/', '/login', '/register', '/privacy', '/terms']
const PUBLIC_PREFIXES = ['/auth', '/_next', '/favicon', '/api']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Allow public paths and Next.js internals
    if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next()
    if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) return NextResponse.next()

    // Check if this is a protected route
    const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))
    if (!isProtected) return NextResponse.next()

    // FIX 3: Read HttpOnly cookie `auth_token` (renamed from `token`)
    const token = request.cookies.get('auth_token')?.value

    if (!token) {
        // Redirect to landing page
        const loginUrl = new URL('/', request.url)
        return NextResponse.redirect(loginUrl)
    }

    // Validate JWT expiry (decode payload without signature verification — safe at edge)
    try {
        const [, payloadB64] = token.split('.')
        if (payloadB64) {
            // Handle base64url encoding (replace - with + and _ with /)
            const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/')
            const payload = JSON.parse(atob(base64))
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                // Token expired — clear cookie and redirect
                const response = NextResponse.redirect(new URL('/', request.url))
                response.cookies.delete('auth_token')  // FIX 3: renamed
                return response
            }
        }
    } catch {
        // Malformed token — clear and redirect
        const response = NextResponse.redirect(new URL('/', request.url))
        response.cookies.delete('auth_token')  // FIX 3: renamed
        return response
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
