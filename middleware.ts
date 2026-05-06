import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Edge middleware for auth-gating protected routes.
 * 
 * NOTE: Since the backend (onrender.com) and frontend (vercel.app) are on
 * different domains, the HttpOnly auth_token cookie set by the backend is
 * scoped to onrender.com — it is NOT visible to Vercel's edge middleware.
 * 
 * Auth enforcement is handled client-side via the AuthProvider which calls
 * /api/auth/me with credentials: 'include'. If that fails, the user is
 * redirected to the landing page from within React.
 * 
 * This middleware only does lightweight checks:
 * - Let public paths through immediately
 * - Let protected paths through (client-side auth will handle redirection)
 */

const PROTECTED_PREFIXES = ['/dashboard', '/article', '/quiz', '/leaderboard', '/profile', '/onboarding', '/globe']
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

    // Read the client-side set cookie
    const token = request.cookies.get('token')?.value

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
                response.cookies.delete('token')
                return response
            }
        }
    } catch {
        // Malformed token — clear and redirect
        const response = NextResponse.redirect(new URL('/', request.url))
        response.cookies.delete('token')
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
