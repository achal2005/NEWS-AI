'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Newspaper, LogIn, Sparkles, Shield, BookOpen } from 'lucide-react'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleGoogleLogin = async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`)

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.detail || 'Login failed')
            }

            const data = await res.json()
            window.location.href = data.auth_url
        } catch (err: any) {
            // Try to extract error message from response if possible, otherwise default
            const msg = err.message || 'Unable to connect. Please try again.'

            // If it's a configured error from our backend check
            if (msg.includes("Google Login is not configured")) {
                setError("Google Login is not configured on the server.")
            } else {
                setError('Unable to connect to login service.')
            }
            setLoading(false)
        }
    }

    const features = [
        { icon: Sparkles, text: 'AI-powered summaries in two reading modes' },
        { icon: Shield, text: 'Fact-checked articles with veracity scores' },
        { icon: BookOpen, text: 'Weekly quizzes and a competitive leaderboard' },
    ]

    return (
        <div className="min-h-screen flex items-center justify-center px-gutter py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-sm text-center"
            >
                {/* Logo */}
                <div className="mb-8">
                    <div
                        className="w-14 h-14 mx-auto mb-5 flex items-center justify-center rounded-sm"
                        style={{ backgroundColor: 'var(--ink)' }}
                    >
                        <Newspaper className="w-7 h-7" style={{ color: 'var(--paper)' }} />
                    </div>
                    <h1 className="font-serif text-headline mb-2" style={{ color: 'var(--ink)' }}>
                        The Daily Brief
                    </h1>
                    <p className="text-xs uppercase tracking-[0.15em] font-semibold" style={{ color: 'var(--ink-muted)' }}>
                        AI-Curated Intelligence
                    </p>
                </div>

                <div className="editorial-rule-double !max-w-[3rem] !mx-auto" />

                {/* Features */}
                <div className="my-8 space-y-4 text-left">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="flex items-start gap-3"
                        >
                            <div
                                className="w-8 h-8 flex items-center justify-center rounded-sm flex-shrink-0 mt-0.5"
                                style={{ backgroundColor: 'var(--paper-sunken)', border: '1px solid var(--border)' }}
                            >
                                <f.icon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                            </div>
                            <p className="text-sm" style={{ color: 'var(--ink-light)' }}>
                                {f.text}
                            </p>
                        </motion.div>
                    ))}
                </div>

                <div className="editorial-rule" />

                {/* Error */}
                {error && (
                    <div
                        className="p-3 mb-4 text-sm rounded-sm"
                        style={{ backgroundColor: 'var(--danger)', color: 'var(--paper)' }}
                    >
                        {error}
                    </div>
                )}

                {/* Google Sign In */}
                <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-sm text-sm font-semibold transition-all disabled:opacity-50"
                    style={{
                        backgroundColor: 'var(--ink)',
                        color: 'var(--paper)',
                    }}
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--paper)', borderTopColor: 'transparent' }} />
                            Connecting...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </>
                    )}
                </button>

                <p className="text-xs mt-6" style={{ color: 'var(--ink-faint)' }}>
                    By signing in, you agree to our editorial standards.
                </p>
            </motion.div>
        </div>
    )
}
