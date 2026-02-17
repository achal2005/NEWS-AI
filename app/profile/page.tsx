'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { User, BookOpen, Clock, Award, Check, Save, LogOut } from 'lucide-react'
import { useAuth } from '@/lib/auth'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const CATEGORIES = [
    'Technology', 'Science', 'Health', 'Business',
    'Environment', 'Politics', 'Sports', 'Entertainment',
    'Education', 'World',
]

export default function ProfilePage() {
    const router = useRouter()
    const { user, token, logout, refreshUser, isAuthenticated, isLoading } = useAuth()
    const [editing, setEditing] = useState(false)
    const [displayName, setDisplayName] = useState('')
    const [age, setAge] = useState('')
    const [categories, setCategories] = useState<string[]>([])
    const [summaryMode, setSummaryMode] = useState<'kid' | 'pro'>('pro')
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)

    // Taste profile state fetched separately
    const [tasteProfile, setTasteProfile] = useState<any>(null)
    const [totalPoints, setTotalPoints] = useState(0)

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/login')
        }
    }, [isLoading, isAuthenticated, router])

    useEffect(() => {
        if (user) {
            setDisplayName(user.display_name || '')
            setAge(user.age?.toString() || '')
        }
    }, [user])

    // Fetch taste profile on mount
    useEffect(() => {
        if (token) {
            fetchTasteProfile()
            fetchPoints()
        }
    }, [token])

    const fetchTasteProfile = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/user/profile`, {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store',
            })
            if (res.ok) {
                const data = await res.json()
                setTasteProfile(data)
                setCategories(data.preferred_categories || [])
                setSummaryMode(data.summary_mode || 'pro')
            }
        } catch {
            // taste profile not found is OK
        }
    }

    const toggleCategory = (cat: string) => {
        setCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        )
    }

    const fetchPoints = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/user/points`, {
                headers: { 'Authorization': `Bearer ${token}` },
                cache: 'no-store'
            })
            if (res.ok) {
                const data = await res.json()
                setTotalPoints(data.total_points || 0)
            }
        } catch {
            // keep default 0
        }
    }

    const handleSave = async () => {
        setSaving(true)
        setSuccess(false)

        try {
            const res = await fetch(`${apiUrl}/api/auth/complete-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    display_name: displayName,
                    age: parseInt(age),
                    preferred_categories: categories,
                    summary_mode: summaryMode,
                }),
            })

            if (res.ok) {
                await refreshUser()
                await fetchTasteProfile()
                setEditing(false)
                setSuccess(true)
                setTimeout(() => setSuccess(false), 3000)
            }
        } catch {
            // handle silently
        } finally {
            setSaving(false)
        }
    }

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--ink-faint)', borderTopColor: 'var(--ink)' }} />
            </div>
        )
    }

    // Computed values from the actual backend fields
    const articlesRead = (user as any).articles_read_count || 0
    const totalReadingMins = Math.round(((user as any).total_reading_time_seconds || 0) / 60)

    return (
        <div className="min-h-screen px-gutter py-12">
            <div className="max-w-reading mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <h1 className="font-serif text-headline mb-1" style={{ color: 'var(--ink)' }}>
                        Settings
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                        Manage your profile and preferences
                    </p>
                </motion.div>

                <div className="editorial-rule-thick" />

                {/* Success Banner */}
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 p-3 mb-6 rounded-sm text-sm"
                        style={{ backgroundColor: 'var(--success)', color: 'var(--paper)' }}
                    >
                        <Check className="w-4 h-4" />
                        Profile updated successfully
                    </motion.div>
                )}

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="editorial-card p-6 md:p-8 mb-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold overflow-hidden"
                                style={{ backgroundColor: 'var(--paper-sunken)', color: 'var(--ink-light)', border: '2px solid var(--border)' }}
                            >
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-6 h-6" />
                                )}
                            </div>
                            <div>
                                <p className="font-serif font-bold text-lg" style={{ color: 'var(--ink)' }}>
                                    {user.display_name || 'Reader'}
                                </p>
                                <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        {!editing && (
                            <button
                                onClick={() => setEditing(true)}
                                className="btn-outline text-xs"
                            >
                                Edit
                            </button>
                        )}
                    </div>

                    {editing ? (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--ink-muted)' }}>
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full px-4 py-3 text-sm rounded-sm outline-none"
                                    style={{ backgroundColor: 'var(--paper-sunken)', color: 'var(--ink)', border: '1px solid var(--border)' }}
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
                                    className="w-full px-4 py-3 text-sm rounded-sm outline-none"
                                    style={{ backgroundColor: 'var(--paper-sunken)', color: 'var(--ink)', border: '1px solid var(--border)' }}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-muted)' }}>
                                    Preferred Categories
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map(cat => {
                                        const selected = categories.includes(cat)
                                        return (
                                            <button
                                                key={cat}
                                                onClick={() => toggleCategory(cat)}
                                                className="px-3 py-2 text-xs font-medium rounded-sm transition-all"
                                                style={{
                                                    backgroundColor: selected ? 'var(--ink)' : 'var(--paper-sunken)',
                                                    color: selected ? 'var(--paper)' : 'var(--ink-light)',
                                                    border: `1px solid ${selected ? 'var(--ink)' : 'var(--border)'}`,
                                                }}
                                            >
                                                {selected && <Check className="w-3 h-3 inline mr-1" />}
                                                {cat}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-muted)' }}>
                                    Summary Mode
                                </label>
                                <div className="flex gap-3">
                                    {['kid', 'pro'].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setSummaryMode(m as 'kid' | 'pro')}
                                            className="flex-1 py-3 text-sm font-medium rounded-sm transition-all"
                                            style={{
                                                backgroundColor: summaryMode === m ? 'var(--ink)' : 'var(--paper-sunken)',
                                                color: summaryMode === m ? 'var(--paper)' : 'var(--ink-light)',
                                                border: `1px solid ${summaryMode === m ? 'var(--ink)' : 'var(--border)'}`,
                                            }}
                                        >
                                            {m === 'kid' ? '🎈 Kid Mode' : '🎯 Pro Mode'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                                    {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save</>}
                                </button>
                                <button onClick={() => setEditing(false)} className="btn-outline flex-1">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-sm" style={{ backgroundColor: 'var(--paper-sunken)' }}>
                                <p className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--ink-muted)' }}>Age</p>
                                <p className="font-semibold" style={{ color: 'var(--ink)' }}>{user.age || '—'}</p>
                            </div>
                            <div className="p-4 rounded-sm" style={{ backgroundColor: 'var(--paper-sunken)' }}>
                                <p className="text-xs uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--ink-muted)' }}>Mode</p>
                                <p className="font-semibold" style={{ color: 'var(--ink)' }}>
                                    {(tasteProfile?.summary_mode || summaryMode) === 'kid' ? '🎈 Kid' : '🎯 Pro'}
                                </p>
                            </div>
                            <div className="col-span-2 p-4 rounded-sm" style={{ backgroundColor: 'var(--paper-sunken)' }}>
                                <p className="text-xs uppercase tracking-wider font-semibold mb-2" style={{ color: 'var(--ink-muted)' }}>Interests</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {(tasteProfile?.preferred_categories || []).map((cat: string) => (
                                        <span key={cat} className="category-tag text-[0.6rem]">{cat}</span>
                                    ))}
                                    {(!tasteProfile?.preferred_categories || tasteProfile.preferred_categories.length === 0) && (
                                        <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>No preferences set</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="editorial-card p-6 md:p-8 mb-6"
                >
                    <h3 className="font-serif font-bold mb-6" style={{ color: 'var(--ink)' }}>
                        Reading Stats
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <BookOpen className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--accent)' }} />
                            <p className="font-serif text-2xl font-bold" style={{ color: 'var(--ink)' }}>
                                {articlesRead}
                            </p>
                            <p className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>
                                Articles
                            </p>
                        </div>
                        <div className="text-center">
                            <Clock className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--accent)' }} />
                            <p className="font-serif text-2xl font-bold" style={{ color: 'var(--ink)' }}>
                                {totalReadingMins}
                            </p>
                            <p className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>
                                Minutes
                            </p>
                        </div>
                        <div className="text-center">
                            <Award className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--accent)' }} />
                            <p className="font-serif text-2xl font-bold" style={{ color: 'var(--ink)' }}>
                                {totalPoints}
                            </p>
                            <p className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>
                                Points
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Sign Out */}
                <button
                    onClick={() => { logout(); router.push('/') }}
                    className="flex items-center gap-2 text-sm font-medium transition-colors mt-4"
                    style={{ color: 'var(--danger)' }}
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </div>
    )
}
