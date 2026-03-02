'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

const CATEGORIES = [
    { id: 'technology', label: 'TECH', icon: 'computer' },
    { id: 'science', label: 'SCIENCE', icon: 'biotech' },
    { id: 'business', label: 'BUSINESS', icon: 'trending_up' },
    { id: 'health', label: 'HEALTH', icon: 'favorite' },
    { id: 'sports', label: 'SPORTS', icon: 'sports_soccer' },
    { id: 'entertainment', label: 'CULTURE', icon: 'palette' },
    { id: 'politics', label: 'POLITICS', icon: 'gavel' },
    { id: 'general', label: 'GENERAL', icon: 'public' },
]

const ROLES = [
    { id: 'casual', label: 'CASUAL READER', desc: 'Quick headlines, easy bites' },
    { id: 'professional', label: 'PRO ANALYST', desc: 'Deep dives, expert language' },
    { id: 'student', label: 'STUDENT', desc: 'Learning-focused, key terms highlighted' },
]

export default function OnboardingPage() {
    const { token } = useAuth()
    const router = useRouter()
    const [step, setStep] = useState(0)
    const [selectedRole, setSelectedRole] = useState('')
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [saving, setSaving] = useState(false)

    const totalSteps = 2
    const progress = ((step + 1) / totalSteps) * 100

    const toggleCategory = (id: string) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        )
    }

    const handleFinish = async () => {
        if (!token) { router.push('/dashboard'); return }
        setSaving(true)
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    preferred_categories: selectedCategories,
                    summary_mode: selectedRole === 'casual' ? 'kid' : 'pro',
                    reading_level: selectedRole === 'professional' ? 8 : 5,
                }),
            })
        } catch (err) {
            console.error('Onboarding save failed:', err)
        } finally {
            setSaving(false)
            router.push('/dashboard')
        }
    }

    return (
        <div className="min-h-screen bg-canvas flex flex-col items-center justify-center relative px-4">
            {/* Grid bg */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#121212 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            <div className="relative z-10 w-full max-w-2xl">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="font-mono text-xs font-bold text-ink/60">
                            SETUP // STEP {step + 1} OF {totalSteps}
                        </span>
                        <span className="font-mono text-xs font-bold">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 border-3 border-ink bg-white">
                        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                {/* Shadow layer */}
                <div className="absolute inset-0 top-16 translate-x-3 translate-y-3 bg-ink border-3 border-ink" />

                {/* Main Card */}
                <div className="relative bg-white border-3 border-ink shadow-hard overflow-hidden">
                    {step === 0 && (
                        <div className="p-8">
                            <h2 className="font-display font-black text-3xl mb-2">Select Your Role</h2>
                            <p className="font-mono text-sm text-ink/60 mb-8">How do you consume news?</p>

                            <div className="space-y-4">
                                {ROLES.map((role) => (
                                    <button
                                        key={role.id}
                                        onClick={() => setSelectedRole(role.id)}
                                        className={`w-full text-left p-5 border-3 border-ink transition-all ${selectedRole === role.id
                                                ? 'bg-primary shadow-hard -translate-y-1'
                                                : 'bg-canvas hover:bg-paper-accent shadow-hard-sm hover:shadow-hard'
                                            }`}
                                    >
                                        <span className="font-bold text-xl font-sans block">{role.label}</span>
                                        <span className="font-mono text-sm text-ink/70">{role.desc}</span>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setStep(1)}
                                disabled={!selectedRole}
                                className="w-full mt-8 py-4 bg-ink text-primary border-3 border-ink font-bold text-lg shadow-hard hover:bg-primary hover:text-ink transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                NEXT →
                            </button>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="p-8">
                            <h2 className="font-display font-black text-3xl mb-2">Pick Your Channels</h2>
                            <p className="font-mono text-sm text-ink/60 mb-8">Select at least 2 topics for your feed.</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => toggleCategory(cat.id)}
                                        className={`flex flex-col items-center gap-2 p-4 border-3 border-ink transition-all ${selectedCategories.includes(cat.id)
                                                ? 'bg-primary shadow-hard -translate-y-1'
                                                : 'bg-canvas shadow-hard-sm hover:shadow-hard hover:bg-paper-accent'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-3xl">{cat.icon}</span>
                                        <span className="font-bold text-xs">{cat.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={() => setStep(0)}
                                    className="flex-1 py-4 bg-white border-3 border-ink font-bold shadow-hard hover:bg-paper-accent transition-all"
                                >
                                    ← BACK
                                </button>
                                <button
                                    onClick={handleFinish}
                                    disabled={selectedCategories.length < 2 || saving}
                                    className="flex-1 py-4 bg-ink text-primary border-3 border-ink font-bold text-lg shadow-hard hover:bg-primary hover:text-ink transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {saving ? 'SAVING...' : 'LAUNCH →'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
