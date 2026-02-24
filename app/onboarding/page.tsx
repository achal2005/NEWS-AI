'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/auth'

const CATEGORIES = [
    { id: 'technology', name: 'Technology', icon: '💻' },
    { id: 'science', name: 'Science', icon: '🔬' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'health', name: 'Health', icon: '🏥' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
]

export default function OnboardingPage() {
    const router = useRouter()
    const { token, refreshUser } = useAuth()
    const [step, setStep] = useState(0)
    const [role, setRole] = useState<'kid' | 'pro' | null>(null)
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [displayName, setDisplayName] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const toggleCategory = (id: string) => {
        setSelectedCategories(prev =>
            prev.includes(id)
                ? prev.filter(c => c !== id)
                : [...prev, id]
        )
    }

    const handleSubmit = async () => {
        if (!role || selectedCategories.length === 0 || !displayName.trim()) return
        setSubmitting(true)
        setError(null)

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
            const res = await fetch(`${apiUrl}/api/auth/complete-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({
                    display_name: displayName.trim(),
                    preferred_categories: selectedCategories,
                    summary_mode: role,
                }),
            })

            if (!res.ok) {
                throw new Error('Failed to save profile')
            }

            await refreshUser()
            router.push('/dashboard')
        } catch (e) {
            setError('Something went wrong. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const canProceed = () => {
        if (step === 0) return role !== null
        if (step === 1) return selectedCategories.length > 0
        if (step === 2) return displayName.trim().length >= 2
        return false
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ backgroundColor: 'var(--paper)' }}>
            <div className="w-full max-w-xl">
                {/* Progress */}
                <div className="flex gap-2 mb-12 justify-center">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{
                                width: i === step ? '3rem' : '1.5rem',
                                backgroundColor: i <= step ? 'var(--ink)' : 'var(--border)',
                            }}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* ── Step 0: Choose Role ──────────────────── */}
                    {step === 0 && (
                        <motion.div
                            key="role"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="font-serif text-3xl font-bold text-center mb-3" style={{ color: 'var(--ink)' }}>
                                How do you like your news?
                            </h2>
                            <p className="text-sm text-center mb-10" style={{ color: 'var(--ink-muted)' }}>
                                Choose your reading mode — you can always change this later
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setRole('kid')}
                                    className="editorial-card p-8 text-center transition-all duration-300"
                                    style={{
                                        borderColor: role === 'kid' ? 'var(--accent)' : 'var(--border)',
                                        borderWidth: role === 'kid' ? '2px' : '1px',
                                        transform: role === 'kid' ? 'scale(1.03)' : 'scale(1)',
                                    }}
                                >
                                    <div className="text-6xl mb-4">🎈</div>
                                    <h3 className="font-serif text-xl font-bold mb-2" style={{ color: 'var(--ink)' }}>
                                        Kid Mode
                                    </h3>
                                    <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                                        Fun, simple, emoji-filled summaries
                                    </p>
                                </button>

                                <button
                                    onClick={() => setRole('pro')}
                                    className="editorial-card p-8 text-center transition-all duration-300"
                                    style={{
                                        borderColor: role === 'pro' ? 'var(--accent)' : 'var(--border)',
                                        borderWidth: role === 'pro' ? '2px' : '1px',
                                        transform: role === 'pro' ? 'scale(1.03)' : 'scale(1)',
                                    }}
                                >
                                    <div className="text-6xl mb-4">🎯</div>
                                    <h3 className="font-serif text-xl font-bold mb-2" style={{ color: 'var(--ink)' }}>
                                        Pro Mode
                                    </h3>
                                    <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                                        Executive-style analysis & data
                                    </p>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Step 1: Pick Categories ─────────────── */}
                    {step === 1 && (
                        <motion.div
                            key="categories"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="font-serif text-3xl font-bold text-center mb-3" style={{ color: 'var(--ink)' }}>
                                What interests you?
                            </h2>
                            <p className="text-sm text-center mb-10" style={{ color: 'var(--ink-muted)' }}>
                                Pick at least one topic to personalize your feed
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {CATEGORIES.map(cat => {
                                    const selected = selectedCategories.includes(cat.id)
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => toggleCategory(cat.id)}
                                            className="editorial-card p-5 text-center transition-all duration-200 relative"
                                            style={{
                                                borderColor: selected ? 'var(--accent)' : 'var(--border)',
                                                borderWidth: selected ? '2px' : '1px',
                                            }}
                                        >
                                            {selected && (
                                                <div
                                                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                                                    style={{ backgroundColor: 'var(--accent)' }}
                                                >
                                                    <Check className="w-3 h-3" style={{ color: 'var(--paper)' }} />
                                                </div>
                                            )}
                                            <div className="text-3xl mb-2">{cat.icon}</div>
                                            <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>
                                                {cat.name}
                                            </p>
                                        </button>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Step 2: Display Name & Confirm ──────── */}
                    {step === 2 && (
                        <motion.div
                            key="confirm"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="font-serif text-3xl font-bold text-center mb-3" style={{ color: 'var(--ink)' }}>
                                Almost there!
                            </h2>
                            <p className="text-sm text-center mb-10" style={{ color: 'var(--ink-muted)' }}>
                                Choose a display name for the leaderboard
                            </p>

                            <div className="editorial-card p-8 mb-6">
                                <label className="block text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-muted)' }}>
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={e => setDisplayName(e.target.value)}
                                    placeholder="Your name"
                                    className="w-full p-3 rounded-sm text-sm border outline-none transition-colors"
                                    style={{
                                        backgroundColor: 'var(--paper-sunken)',
                                        borderColor: 'var(--border)',
                                        color: 'var(--ink)',
                                    }}
                                    maxLength={50}
                                />

                                <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span style={{ color: 'var(--ink-muted)' }}>Mode</span>
                                        <span className="font-semibold" style={{ color: 'var(--ink)' }}>
                                            {role === 'kid' ? '🎈 Kid' : '🎯 Pro'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span style={{ color: 'var(--ink-muted)' }}>Topics</span>
                                        <span className="font-semibold" style={{ color: 'var(--ink)' }}>
                                            {selectedCategories.length} selected
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-center mb-4" style={{ color: 'var(--danger)' }}>
                                    {error}
                                </p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-10">
                    {step > 0 ? (
                        <button
                            onClick={() => setStep(s => s - 1)}
                            className="btn-outline text-xs"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {step < 2 ? (
                        <button
                            onClick={() => setStep(s => s + 1)}
                            disabled={!canProceed()}
                            className="btn-primary text-xs disabled:opacity-40"
                        >
                            Continue
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!canProceed() || submitting}
                            className="btn-primary text-xs disabled:opacity-40"
                        >
                            {submitting ? (
                                'Setting up...'
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Start Reading
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
