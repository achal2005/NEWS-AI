'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function RegisterPage() {
    const [loading, setLoading] = useState(false)
    const [authError, setAuthError] = useState<string | null>(null)

    const handleGoogleSignUp = async () => {
        setLoading(true)
        setAuthError(null)
        try {
            const res = await fetch(`/api/auth/google`)
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
        <div className="min-h-screen bg-canvas flex flex-col items-center justify-center relative px-4 selection:bg-highlight selection:text-ink">
            {/* Newsprint grain */}
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#242019 0.5px, transparent 0.6px)', backgroundSize: '4px 4px' }} />

            <div className="relative z-10 w-full max-w-md animate-fade-in-up opacity-0" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
                <div className="absolute inset-0 translate-x-2.5 translate-y-2.5 bg-ink border-2 border-ink" />

                <div className="relative bg-surface border-2 border-ink overflow-hidden">
                    {/* Header */}
                    <div className="bg-primary border-b-2 border-ink p-8 text-center">
                        <Link href="/" className="inline-block">
                            <h1 className="font-display font-black text-5xl md:text-6xl tracking-tight text-canvas">Nutshell</h1>
                        </Link>
                        <p className="font-mono text-[11px] mt-2 uppercase tracking-[0.2em] text-canvas/70">
                            Create your free account
                        </p>
                    </div>

                    <div className="p-8 space-y-5">
                        <div className="text-center">
                            <h2 className="font-display font-bold text-2xl mb-2">Create Your Account</h2>
                            <p className="font-mono text-sm text-ink/60">
                                One click. Then we calibrate your feed.
                            </p>
                        </div>

                        {/* Feature pills — matching login page */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 border-2 border-ink/10 bg-canvas/50">
                                <span className="material-symbols-outlined text-primary text-lg">auto_stories</span>
                                <span className="font-mono text-sm">AI summaries in Skim &amp; Deep Dive modes</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 border-2 border-ink/10 bg-canvas/50">
                                <span className="material-symbols-outlined text-primary text-lg">bolt</span>
                                <span className="font-mono text-sm">Weekly quizzes &amp; competitive leaderboard</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 border-2 border-ink/10 bg-canvas/50">
                                <span className="material-symbols-outlined text-primary text-lg">tune</span>
                                <span className="font-mono text-sm">Personalized feed from 100+ news sources</span>
                            </div>
                        </div>

                        {/* 3-Step onboarding flow */}
                        <div className="border-2 border-ink bg-canvas/30 p-4">
                            <p className="font-mono text-[10px] text-ink/40 uppercase tracking-widest mb-3">What happens next</p>
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col items-center flex-1">
                                    <div className="w-8 h-8 bg-primary border-2 border-ink flex items-center justify-center font-black text-sm text-white shadow-hard-sm">1</div>
                                    <span className="font-mono text-[10px] font-bold mt-1.5 text-center">Sign Up</span>
                                </div>
                                <div className="w-6 h-0.5 bg-ink/20 flex-shrink-0" />
                                <div className="flex flex-col items-center flex-1">
                                    <div className="w-8 h-8 bg-ink border-2 border-ink flex items-center justify-center font-black text-sm text-primary shadow-hard-sm">2</div>
                                    <span className="font-mono text-[10px] font-bold mt-1.5 text-center">Pick Interests</span>
                                </div>
                                <div className="w-6 h-0.5 bg-ink/20 flex-shrink-0" />
                                <div className="flex flex-col items-center flex-1">
                                    <div className="w-8 h-8 bg-primary border-2 border-ink flex items-center justify-center font-black text-sm text-white shadow-hard-sm">3</div>
                                    <span className="font-mono text-[10px] font-bold mt-1.5 text-center">Read Feed</span>
                                </div>
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
                                        onClick={() => { setAuthError(null); handleGoogleSignUp() }}
                                        className="mt-2 font-bold text-xs uppercase tracking-wider text-primary hover:text-ink transition-colors underline decoration-2 underline-offset-2"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Google Sign Up */}
                        <button
                            onClick={handleGoogleSignUp}
                            disabled={loading}
                            className="w-full py-4 bg-primary border-2 border-ink font-bold text-lg uppercase tracking-wide shadow-hard hover:shadow-hard-hover hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-wait"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-ink border-t-transparent animate-spin rounded-full" />
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
                                    SIGN UP WITH GOOGLE
                                </>
                            )}
                        </button>

                        <p className="font-mono text-[10px] text-center text-ink/40 uppercase tracking-widest">
                            Already have an account?{' '}
                            <Link href="/login" className="font-bold text-ink underline decoration-2 decoration-primary underline-offset-2 hover:text-primary transition-colors">SIGN IN</Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Back to landing */}
            <Link href="/" className="relative z-10 mt-8 font-mono text-xs text-ink/40 hover:text-ink transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>BACK TO HOME</span>
            </Link>
        </div>
    )
}
