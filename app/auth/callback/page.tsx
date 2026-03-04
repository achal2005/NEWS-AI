'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/lib/auth'

function CallbackHandler() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { login } = useAuth()
    const [error, setError] = useState<string | null>(null)
    const attemptedRef = useRef(false)

    useEffect(() => {
        // Prevent double-invocation from React StrictMode or re-renders
        if (attemptedRef.current) return
        attemptedRef.current = true

        const code = searchParams.get('code')
        if (!code) {
            setError('No authorization code received')
            return
        }

        const attemptLogin = async (retries = 2) => {
            for (let attempt = 0; attempt <= retries; attempt++) {
                try {
                    const { profileComplete } = await login(code)
                    // Successful login — redirect immediately
                    router.replace(profileComplete ? '/dashboard' : '/onboarding')
                    return
                } catch (err) {
                    console.error(`Login attempt ${attempt + 1} failed:`, err)
                    if (attempt < retries) {
                        // Wait before retrying (Render cold start can take a while)
                        await new Promise(r => setTimeout(r, 3000 * (attempt + 1)))
                    }
                }
            }
            // All retries exhausted
            setError('Login failed. The server may be waking up — please try again.')
        }

        attemptLogin()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="min-h-screen bg-canvas flex items-center justify-center">
            <div className="relative">
                <div className="absolute inset-0 translate-x-2 translate-y-2 bg-ink" />
                <div className="relative bg-white border-3 border-ink p-12 shadow-hard text-center">
                    {error ? (
                        <>
                            <span className="material-symbols-outlined text-5xl text-alert mb-4 block">error</span>
                            <h2 className="font-display font-bold text-2xl mb-2">AUTH ERROR</h2>
                            <p className="font-mono text-sm text-ink/60 mb-6">{error}</p>
                            <a href="/login" className="px-6 py-3 bg-primary border-3 border-ink shadow-hard font-bold inline-block">
                                TRY AGAIN
                            </a>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 border-3 border-ink border-t-primary animate-spin mx-auto mb-6" />
                            <h2 className="font-display font-bold text-2xl mb-2">AUTHENTICATING</h2>
                            <p className="font-mono text-sm text-ink/60">Establishing secure connection...</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-canvas flex items-center justify-center">
                <div className="w-12 h-12 border-3 border-ink border-t-primary animate-spin" />
            </div>
        }>
            <CallbackHandler />
        </Suspense>
    )
}
