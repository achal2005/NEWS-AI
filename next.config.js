/** @type {import('next').NextConfig} */

// Where the FastAPI backend actually lives. Used only as the server-side proxy
// target for the rewrites below — the browser never talks to it directly.
const BACKEND_ORIGIN = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// Backend route prefixes to proxy. Deliberately specific so the local Next.js
// API route (/api/globe-news) is NOT proxied to the backend.
const BACKEND_PREFIXES = ['auth', 'news', 'user', 'quiz', 'leaderboard']

const nextConfig = {
    reactStrictMode: true,
    output: 'standalone',
    images: {
        // Allow external images from any news source domain
        remotePatterns: [
            { protocol: 'https', hostname: '**' },
            { protocol: 'http', hostname: '**' },
        ],
    },
    // First-party API proxy: the browser calls same-origin /api/* and /health,
    // and Vercel/Next forwards to the backend. This makes the auth cookie
    // first-party (set on the app's own domain), so browsers that block
    // third-party cookies no longer break login. No backend change required.
    async rewrites() {
        return [
            ...BACKEND_PREFIXES.map((p) => ({
                source: `/api/${p}/:path*`,
                destination: `${BACKEND_ORIGIN}/api/${p}/:path*`,
            })),
            { source: '/health', destination: `${BACKEND_ORIGIN}/health` },
        ]
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-inline' https://accounts.google.com",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "font-src 'self' https://fonts.gstatic.com",
                            "img-src 'self' data: blob: https: http:",
                            "connect-src 'self' https: http:",
                        ].join('; '),
                    },
                ],
            },
        ]
    },
}

module.exports = nextConfig
