'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Newspaper } from 'lucide-react'
import { useAuth } from '@/lib/auth'

function AuthCallbackContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { login } = useAuth()
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const code = searchParams.get('code')

        if (!code) {
            setError('Authentication failed. No authorization code received.')
            return
        }

        const handleCallback = async () => {
            try {
                const result = await login(code)
                if (result && !result.profileComplete) {
                    router.push('/register')
                } else {
                    router.push('/')
                }
            } catch (err) {
                setError('Authentication failed. Please try again.')
            }
        }

        handleCallback()
    }, [searchParams, login, router])

    return (
        <div className="min-h-screen flex items-center justify-center px-gutter">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
            >
                {error ? (
                    <>
                        <div
                            className="w-14 h-14 mx-auto mb-6 flex items-center justify-center rounded-sm"
                            style={{ backgroundColor: 'var(--danger)', color: 'var(--paper)' }}
                        >
                            <Newspaper className="w-7 h-7" />
                        </div>
                        <h2 className="font-serif text-xl mb-3" style={{ color: 'var(--ink)' }}>
                            {error}
                        </h2>
                        <button
                            onClick={() => router.push('/login')}
                            className="btn-primary mt-4"
                        >
                            Try Again
                        </button>
                    </>
                ) : (
                    <>
                        <div
                            className="w-14 h-14 mx-auto mb-6 flex items-center justify-center rounded-sm"
                            style={{ backgroundColor: 'var(--ink)' }}
                        >
                            <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--paper)', borderTopColor: 'transparent' }} />
                        </div>
                        <h2 className="font-serif text-xl mb-2" style={{ color: 'var(--ink)' }}>
                            Authenticating...
                        </h2>
                        <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                            Verifying your credentials
                        </p>
                    </>
                )}
            </motion.div>
        </div>
    )
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--ink-faint)', borderTopColor: 'var(--ink)' }} />
            </div>
        }>
            <AuthCallbackContent />
        </Suspense>
    )
}
