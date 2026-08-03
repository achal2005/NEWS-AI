'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback, useRef } from 'react'

type ServerStatus = 'checking' | 'ready' | 'slow' | 'error'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [serverStatus, setServerStatus] = useState<ServerStatus>('checking')
    const [authError, setAuthError] = useState<string | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const checkServer = useCallback(async () => {
        setServerStatus('checking')

        // Set a 10-second timeout — if server hasn't responded, let the user proceed anyway
        timeoutRef.current = setTimeout(() => {
            setServerStatus((prev) => (prev === 'checking' ? 'ready' : prev))
        }, 10000)

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, { cache: 'no-store' })
            if (res.ok) {
                if (timeoutRef.current) clearTimeout(timeoutRef.current)
                setServerStatus('ready')
                return
            }
        } catch {
            // First attempt failed, retry after 2s
        }

        // Retry once after 2s
        await new Promise((r) => setTimeout(r, 2000))

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, { cache: 'no-store' })
            if (res.ok) {
                if (timeoutRef.current) clearTimeout(timeoutRef.current)
                setServerStatus('ready')
                return
            }
        } catch {
            // Second attempt failed
        }

        // Both failed — if timeout hasn't already set 'slow', set 'error'
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setServerStatus((prev) => (prev === 'slow' ? 'slow' : 'error'))
    }, [])

    useEffect(() => {
        checkServer()
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [checkServer])

    const handleGoogleLogin = async () => {
        setLoading(true)
        setAuthError(null)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`)
            if (res.ok) {
                const data = await res.json()
                window.location.href = data.auth_url
            } else {
                setAuthError('Failed to connect to authentication service. Please try again.')
                setLoading(false)
            }
        } catch (err) {
            console.error('Failed to get Google auth URL:', err)
            setAuthError('Unable to reach the server. It may still be starting up — please wait a moment and try again.')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-canvas flex flex-col items-center justify-center relative overflow-hidden selection:bg-highlight selection:text-ink px-4">
            {/* Newsprint grain */}
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#242019 0.5px, transparent 0.6px)', backgroundSize: '4px 4px' }} />

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-md animate-fade-in-up opacity-0" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
                {/* Shadow layer */}
                <div className="absolute inset-0 translate-x-2.5 translate-y-2.5 bg-ink border-2 border-ink" />

                <div className="relative bg-surface border-2 border-ink overflow-hidden">
                    {/* Header */}
                    <div className="bg-primary border-b-2 border-ink p-8 text-center">
                        <Link href="/" className="inline-block">
                            <h1 className="font-display font-black text-5xl md:text-6xl tracking-tight text-canvas">Nutshell</h1>
                        </Link>
                        <p className="font-mono text-[11px] mt-2 uppercase tracking-[0.2em] text-canvas/70">Welcome back — sign in to continue</p>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-5">
                        {/* Feature pills */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 border-2 border-ink/10 bg-canvas/50">
                                <span className="material-symbols-outlined text-primary-dark text-lg">auto_stories</span>
                                <span className="font-mono text-sm">AI summaries in Skim &amp; Deep Dive modes</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 border-2 border-ink/10 bg-canvas/50">
                                <span className="material-symbols-outlined text-primary-dark text-lg">bolt</span>
                                <span className="font-mono text-sm">Weekly quizzes &amp; competitive leaderboard</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 border-2 border-ink/10 bg-canvas/50">
                                <span className="material-symbols-outlined text-primary-dark text-lg">tune</span>
                                <span className="font-mono text-sm">Personalized feed from 100+ news sources</span>
                            </div>
                        </div>

                        <div className="h-px bg-ink/10" />

                        {/* Auth Error Banner */}
                        {authError && (
                            <div className="border-2 border-primary bg-primary/5 p-4 flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary text-xl flex-shrink-0 mt-0.5">error</span>
                                <div className="flex-1">
                                    <p className="font-mono text-sm text-ink/80">{authError}</p>
                                    <button
                                        onClick={() => { setAuthError(null); handleGoogleLogin() }}
                                        className="mt-2 font-bold text-xs uppercase tracking-wider text-primary hover:text-ink transition-colors underline decoration-2 underline-offset-2"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Google Sign In */}
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading || serverStatus !== 'ready'}
                            className="w-full py-4 bg-ink text-white border-2 border-ink font-bold text-base uppercase tracking-wide shadow-hard hover:bg-primary hover:text-ink hover:shadow-hard-hover hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-wait"
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
                        {serverStatus === 'checking' && (
                            <div className="flex items-center justify-center gap-2 py-1">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                                <span className="font-mono text-[10px] text-ink/40 uppercase tracking-widest">Warming up server...</span>
                            </div>
                        )}

                        {serverStatus === 'ready' && (
                            <div className="flex items-center justify-center gap-2 py-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span className="font-mono text-[10px] text-ink/40 uppercase tracking-widest">Server ready</span>
                            </div>
                        )}

                        {serverStatus === 'slow' && (
                            <div className="border-2 border-yellow-500/30 bg-yellow-50 p-3 text-center">
                                <p className="font-mono text-xs text-ink/60 mb-2">Server is starting up, please try again in a moment.</p>
                                <button
                                    onClick={checkServer}
                                    className="font-bold text-xs uppercase tracking-wider text-ink hover:text-primary transition-colors border-2 border-ink px-3 py-1 bg-white shadow-hard-sm hover:-translate-y-0.5"
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {serverStatus === 'error' && (
                            <div className="border-2 border-primary/30 bg-primary/5 p-3 text-center">
                                <p className="font-mono text-xs text-ink/60 mb-2">Service temporarily unavailable.</p>
                                <button
                                    onClick={checkServer}
                                    className="font-bold text-xs uppercase tracking-wider text-ink hover:text-primary transition-colors border-2 border-ink px-3 py-1 bg-white shadow-hard-sm hover:-translate-y-0.5"
                                >
                                    Retry
                                </button>
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

            {/* Back to landing — icon and text properly separated */}
            <Link href="/" className="relative z-10 mt-8 font-mono text-xs text-ink/40 hover:text-ink transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>BACK TO HOME</span>
            </Link>
        </div>
    )
}
