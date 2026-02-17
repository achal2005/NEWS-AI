'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Check, Newspaper } from 'lucide-react'
import { useAuth } from '@/lib/auth'

const CATEGORIES = [
    'Technology', 'Science', 'Health', 'Business',
    'Environment', 'Politics', 'Sports', 'Entertainment',
    'Education', 'World',
]

const STEPS = [
    { title: 'Welcome', subtitle: 'Let\'s personalize your experience' },
    { title: 'Your Identity', subtitle: 'Tell us about yourself' },
    { title: 'Your Interests', subtitle: 'Select topics that matter to you' },
    { title: 'Reading Style', subtitle: 'Choose your preferred summary mode' },
]

export default function RegisterPage() {
    const router = useRouter()
    const { user, refreshUser, token } = useAuth()
    const [step, setStep] = useState(0)
    const [displayName, setDisplayName] = useState('')
    const [age, setAge] = useState('')
    const [categories, setCategories] = useState<string[]>([])
    const [summaryMode, setSummaryMode] = useState<'kid' | 'pro'>('pro')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (user) {
            setDisplayName(user.display_name || '')
        }
    }, [user])

    const toggleCategory = (cat: string) => {
        setCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        )
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError(null)

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/complete-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    display_name: displayName,
                    age: parseInt(age),
                    preferred_categories: categories,
                    summary_mode: summaryMode,
                })
            })

            if (res.ok) {
                await refreshUser()
                router.push('/')
            } else {
                setError('Failed to save profile. Please try again.')
            }
        } catch {
            setError('Connection error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const canProceed = () => {
        if (step === 1) return displayName.trim().length >= 2 && age.trim().length > 0
        if (step === 2) return categories.length >= 1
        return true
    }

    const nextStep = () => {
        if (step < STEPS.length - 1) setStep(step + 1)
        else handleSubmit()
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-gutter py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div
                        className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-sm"
                        style={{ backgroundColor: 'var(--ink)' }}
                    >
                        <Newspaper className="w-6 h-6" style={{ color: 'var(--paper)' }} />
                    </div>
                </div>

                {/* Progress */}
                <div className="flex gap-1 mb-10">
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            className="flex-1 h-1 rounded-full transition-all duration-500"
                            style={{
                                backgroundColor: i <= step ? 'var(--ink)' : 'var(--border)',
                            }}
                        />
                    ))}
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <h2 className="font-serif text-2xl font-bold mb-1" style={{ color: 'var(--ink)' }}>
                            {STEPS[step].title}
                        </h2>
                        <p className="text-sm mb-8" style={{ color: 'var(--ink-muted)' }}>
                            {STEPS[step].subtitle}
                        </p>

                        {/* Step 0: Welcome */}
                        {step === 0 && (
                            <div className="editorial-card p-6 text-center">
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-light)' }}>
                                    You're about to access AI-curated news with personalized summaries tailored to your interests and reading level.
                                </p>
                                <div className="editorial-rule" />
                                <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-light)' }}>
                                    Complete this quick setup to unlock your personalized experience. It only takes a minute.
                                </p>
                            </div>
                        )}

                        {/* Step 1: Identity */}
                        {step === 1 && (
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--ink-muted)' }}>
                                        Display Name
                                    </label>
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Your name"
                                        className="w-full px-4 py-3 text-sm rounded-sm outline-none transition-colors"
                                        style={{
                                            backgroundColor: 'var(--paper-sunken)',
                                            color: 'var(--ink)',
                                            border: '1px solid var(--border)',
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--ink-muted)' }}>
                                        Age
                                    </label>
                                    <input
                                        type="number"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        placeholder="Your age"
                                        min={1}
                                        max={120}
                                        className="w-full px-4 py-3 text-sm rounded-sm outline-none transition-colors"
                                        style={{
                                            backgroundColor: 'var(--paper-sunken)',
                                            color: 'var(--ink)',
                                            border: '1px solid var(--border)',
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Interests */}
                        {step === 2 && (
                            <div className="flex flex-wrap gap-2">
                                {CATEGORIES.map((cat, i) => {
                                    const selected = categories.includes(cat)
                                    return (
                                        <motion.button
                                            key={cat}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.04 }}
                                            onClick={() => toggleCategory(cat)}
                                            className="px-4 py-2.5 text-sm font-medium rounded-sm transition-all duration-200"
                                            style={{
                                                backgroundColor: selected ? 'var(--ink)' : 'var(--paper-sunken)',
                                                color: selected ? 'var(--paper)' : 'var(--ink-light)',
                                                border: `1.5px solid ${selected ? 'var(--ink)' : 'var(--border)'}`,
                                            }}
                                        >
                                            {selected && <Check className="w-3 h-3 inline mr-1.5" />}
                                            {cat}
                                        </motion.button>
                                    )
                                })}
                            </div>
                        )}

                        {/* Step 3: Reading Mode */}
                        {step === 3 && (
                            <div className="space-y-3">
                                {[
                                    { mode: 'kid' as const, emoji: '🎈', title: 'Kid Mode', desc: 'Simple, fun language with colorful analogies' },
                                    { mode: 'pro' as const, emoji: '🎯', title: 'Pro Mode', desc: 'Detailed analysis with technical vocabulary' },
                                ].map((option) => (
                                    <button
                                        key={option.mode}
                                        onClick={() => setSummaryMode(option.mode)}
                                        className="w-full editorial-card p-5 text-left transition-all"
                                        style={{
                                            borderColor: summaryMode === option.mode ? 'var(--accent)' : 'var(--border)',
                                            backgroundColor: summaryMode === option.mode ? 'var(--paper-sunken)' : 'var(--paper-raised)',
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{option.emoji}</span>
                                            <div>
                                                <p className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>
                                                    {option.title}
                                                </p>
                                                <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                                                    {option.desc}
                                                </p>
                                            </div>
                                            {summaryMode === option.mode && (
                                                <Check className="w-5 h-5 ml-auto" style={{ color: 'var(--accent)' }} />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Error */}
                {error && (
                    <div className="mt-4 p-3 text-sm rounded-sm" style={{ backgroundColor: 'var(--danger)', color: 'var(--paper)' }}>
                        {error}
                    </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-10">
                    {step > 0 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="flex items-center gap-2 text-sm font-medium"
                            style={{ color: 'var(--ink-muted)' }}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                    ) : (
                        <div />
                    )}

                    <button
                        onClick={nextStep}
                        disabled={!canProceed() || loading}
                        className="btn-primary disabled:opacity-40"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--paper)', borderTopColor: 'transparent' }} />
                                Saving...
                            </span>
                        ) : step === STEPS.length - 1 ? (
                            <span className="flex items-center gap-2">
                                <Check className="w-4 h-4" />
                                Start Reading
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Continue
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
