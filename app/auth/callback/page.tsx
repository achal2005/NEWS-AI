'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'

function CallbackHandler() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { login } = useAuth()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const code = searchParams.get('code')
        if (code) {
            login(code)
                .then(({ profileComplete }) => {
                    router.push(profileComplete ? '/dashboard' : '/onboarding')
                })
                .catch((err: Error) => setError(err.message))
        } else {
            setError('No authorization code received')
        }
    }, [searchParams, login, router])

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
