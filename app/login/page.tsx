'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [serverReady, setServerReady] = useState(false)

    // Pre-warm backend on mount (wakes Render before user clicks Sign In)
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, { cache: 'no-store' })
            .then(() => setServerReady(true))
            .catch(() => {
                // Retry once after 2s
                setTimeout(() => {
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, { cache: 'no-store' })
                        .then(() => setServerReady(true))
                        .catch(() => { })
                }, 2000)
            })
    }, [])

    const handleGoogleLogin = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`)
            if (res.ok) {
                const data = await res.json()
                window.location.href = data.auth_url
            } else {
                setLoading(false)
            }
        } catch (err) {
            console.error('Failed to get Google auth URL:', err)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-canvas flex flex-col items-center justify-center relative overflow-hidden selection:bg-highlight selection:text-ink px-4">
            {/* Grid background */}
            <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(#121212 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            {/* Floating decorative elements */}
            <div className="absolute top-20 left-10 w-48 h-24 bg-primary border-3 border-ink shadow-hard rotate-[-8deg] opacity-20 hidden md:block" />
            <div className="absolute bottom-32 right-16 w-32 h-32 border-3 border-ink shadow-hard rotate-[12deg] opacity-15 hidden md:block" />
            <div className="absolute top-40 right-20 w-24 h-16 bg-alert border-3 border-ink shadow-hard rotate-[6deg] opacity-15 hidden md:block" />

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-md animate-fade-in-up opacity-0" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
                {/* Shadow layer */}
                <div className="absolute inset-0 translate-x-3 translate-y-3 bg-ink border-3 border-ink" />

                <div className="relative bg-white border-3 border-ink overflow-hidden">
                    {/* Header */}
                    <div className="bg-primary border-b-3 border-ink p-8 text-center">
                        <Link href="/" className="inline-block">
                            <h1 className="font-display font-black text-4xl md:text-5xl tracking-tight">THE DAILY BRIEF</h1>
                        </Link>
                        <p className="font-mono text-xs mt-2 uppercase tracking-widest text-ink/60">Welcome back — log in to continue</p>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-5">
                        {/* Feature pills */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 border-2 border-ink/10 bg-canvas/50">
                                <span className="material-symbols-outlined text-primary-dark text-lg">auto_stories</span>
                                <span className="font-mono text-sm">AI summaries in Skim & Deep Dive modes</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 border-2 border-ink/10 bg-canvas/50">
                                <span className="material-symbols-outlined text-primary-dark text-lg">bolt</span>
                                <span className="font-mono text-sm">Weekly quizzes & competitive leaderboard</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 border-2 border-ink/10 bg-canvas/50">
                                <span className="material-symbols-outlined text-primary-dark text-lg">tune</span>
                                <span className="font-mono text-sm">Personalized feed from 100+ news sources</span>
                            </div>
                        </div>

                        <div className="h-px bg-ink/10" />

                        {/* Google Sign In */}
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full py-4 bg-ink text-white border-3 border-ink font-bold text-base uppercase tracking-wide shadow-hard hover:bg-primary hover:text-ink hover:shadow-hard-hover hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-wait"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                                    CONNECTING...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    LOG IN WITH GOOGLE
                                </>
                            )}
                        </button>

                        {/* Server status */}
                        {!serverReady && (
                            <div className="flex items-center justify-center gap-2 py-1">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                                <span className="font-mono text-[10px] text-ink/40 uppercase tracking-widest">Warming up server...</span>
                            </div>
                        )}

                        <div className="text-center">
                            <p className="font-mono text-xs text-ink/50">
                                Don&apos;t have an account?{' '}
                                <Link href="/register" className="font-bold text-ink underline decoration-2 decoration-primary underline-offset-2 hover:text-primary transition-colors">
                                    Sign up free
                                </Link>
                            </p>
                        </div>

                        <p className="font-mono text-[10px] text-center text-ink/30 uppercase tracking-widest">
                            By signing in, you agree to our editorial standards.
                        </p>
                    </div>
                </div>
            </div>

            {/* Back to landing */}
            <Link href="/" className="relative z-10 mt-8 font-mono text-xs text-ink/40 hover:text-ink transition-colors flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                BACK TO HOME
            </Link>
        </div>
    )
}
