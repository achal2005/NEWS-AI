'use client'

import { useRouter } from 'next/navigation'

export default function RegisterPage() {
    const router = useRouter()

    const handleGoogleSignUp = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`)
            if (res.ok) {
                const data = await res.json()
                window.location.href = data.auth_url
            }
        } catch (err) {
            console.error('Failed to get Google auth URL:', err)
        }
    }

    return (
        <div className="min-h-screen bg-canvas flex flex-col items-center justify-center relative px-4">
            {/* Grid bg */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#121212 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            <div className="relative z-10 w-full max-w-md">
                <div className="absolute inset-0 translate-x-3 translate-y-3 bg-ink border-3 border-ink" />

                <div className="relative bg-white border-3 border-ink shadow-hard overflow-hidden">
                    <div className="bg-ink border-b-3 border-ink p-8 text-center">
                        <h1 className="font-display font-black text-5xl tracking-tight text-primary">THE DAILY BRIEF</h1>
                        <p className="font-mono text-xs mt-2 uppercase tracking-widest text-primary/70">
                            Join The Intelligence Network
                        </p>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="text-center">
                            <h2 className="font-display font-bold text-2xl mb-2">Create Your Account</h2>
                            <p className="font-mono text-sm text-ink/60">
                                One click. Then we calibrate your feed.
                            </p>
                        </div>

                        <button
                            onClick={handleGoogleSignUp}
                            className="w-full py-4 bg-primary border-3 border-ink font-bold text-lg uppercase tracking-wide shadow-hard hover:shadow-hard-hover hover:-translate-y-1 transition-all flex items-center justify-center gap-3"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            SIGN UP WITH GOOGLE
                        </button>

                        <p className="font-mono text-[10px] text-center text-ink/40 uppercase tracking-widest">
                            Already have an account?{' '}
                            <a href="/login" className="underline text-ink/70 hover:text-ink">SIGN IN</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
