'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { User, BookOpen, Clock, Award, Check, Save, LogOut, Settings2, SlidersHorizontal, UserCircle, Bell, ChevronRight } from 'lucide-react'
import { useAuth } from '@/lib/auth'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const CATEGORIES = [
    'Technology', 'Science', 'Health', 'Business',
    'Environment', 'Politics', 'Sports', 'Entertainment',
    'Education', 'World',
]

type TabId = 'account' | 'preferences'

export default function ProfilePage() {
    const router = useRouter()
    const { user, token, logout, refreshUser, isAuthenticated, isLoading } = useAuth()

    // UI State
    const [activeTab, setActiveTab] = useState<TabId>('account')
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)

    // Form State
    const [displayName, setDisplayName] = useState('')
    const [age, setAge] = useState('')
    const [categories, setCategories] = useState<string[]>([])
    const [summaryMode, setSummaryMode] = useState<'kid' | 'pro'>('pro')

    // Stats State
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
                setCategories(data.preferred_categories || [])
                setSummaryMode(data.summary_mode || 'pro')
            }
        } catch {
            // handle error smoothly
        }
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

    const toggleCategory = (cat: string) => {
        setCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        )
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
                    age: parseInt(age) || null,
                    preferred_categories: categories,
                    summary_mode: summaryMode,
                }),
            })

            if (res.ok) {
                await refreshUser()
                await fetchTasteProfile()
                setSuccess(true)
                setTimeout(() => setSuccess(false), 3000)
            }
        } catch {
            // handle error smoothly
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

    const articlesRead = (user as any).articles_read_count || 0
    const totalReadingMins = Math.round(((user as any).total_reading_time_seconds || 0) / 60)

    return (
        <div className="min-h-screen px-gutter py-12">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: 'var(--ink)' }}>
                        Settings
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                        Manage your account and app preferences.
                    </p>
                </motion.div>

                {/* Main Settings Grid */}
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="flex flex-col space-y-1">
                            <button
                                onClick={() => setActiveTab('account')}
                                className="flex items-center justify-between p-3 rounded-sm text-sm font-medium transition-colors"
                                style={{
                                    backgroundColor: activeTab === 'account' ? 'var(--paper-sunken)' : 'transparent',
                                    color: activeTab === 'account' ? 'var(--ink)' : 'var(--ink-muted)'
                                }}
                            >
                                <span className="flex items-center gap-3">
                                    <UserCircle className="w-4 h-4" /> Account
                                </span>
                                {activeTab === 'account' && <ChevronRight className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => setActiveTab('preferences')}
                                className="flex items-center justify-between p-3 rounded-sm text-sm font-medium transition-colors"
                                style={{
                                    backgroundColor: activeTab === 'preferences' ? 'var(--paper-sunken)' : 'transparent',
                                    color: activeTab === 'preferences' ? 'var(--ink)' : 'var(--ink-muted)'
                                }}
                            >
                                <span className="flex items-center gap-3">
                                    <SlidersHorizontal className="w-4 h-4" /> Preferences
                                </span>
                                {activeTab === 'preferences' && <ChevronRight className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Stats Summary Panel */}
                        <div className="hidden md:block mt-12 pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
                            <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--ink-muted)' }}>Stats</p>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span style={{ color: 'var(--ink-muted)' }}>Points</span>
                                    <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{totalPoints}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span style={{ color: 'var(--ink-muted)' }}>Articles Read</span>
                                    <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{articlesRead}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span style={{ color: 'var(--ink-muted)' }}>Reading Time</span>
                                    <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{totalReadingMins}m</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-grow">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 5 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -5 }}
                                transition={{ duration: 0.2 }}
                                className="bg-[var(--paper)] border border-[var(--border)] rounded-sm overflow-hidden"
                            >
                                {activeTab === 'account' && (
                                    <div className="p-6 md:p-8">
                                        <h2 className="font-serif text-xl font-bold mb-6" style={{ color: 'var(--ink)' }}>Account Information</h2>

                                        <div className="flex items-center gap-6 mb-8">
                                            <div
                                                className="w-16 h-16 flex-shrink-0 rounded-full flex items-center justify-center text-xl font-bold overflow-hidden"
                                                style={{ backgroundColor: 'var(--paper-sunken)', color: 'var(--ink-light)', border: '1px solid var(--border)' }}
                                            >
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-8 h-8 opacity-50" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--ink)' }}>Profile Picture</p>
                                                <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>Synced securely from your Google Account.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6 max-w-md">
                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--ink-muted)' }}>Email Address</label>
                                                <input
                                                    type="email"
                                                    value={user.email}
                                                    disabled
                                                    className="w-full px-4 py-2.5 text-sm rounded-sm outline-none opacity-60 cursor-not-allowed"
                                                    style={{ backgroundColor: 'var(--paper-sunken)', color: 'var(--ink)', border: '1px solid var(--border)' }}
                                                />
                                                <p className="text-[10px] mt-1.5" style={{ color: 'var(--ink-faint)' }}>To change your email, modify it via Google.</p>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--ink-muted)' }}>Display Name</label>
                                                <input
                                                    type="text"
                                                    value={displayName}
                                                    onChange={(e) => setDisplayName(e.target.value)}
                                                    className="w-full px-4 py-2.5 text-sm rounded-sm outline-none transition-colors"
                                                    style={{ backgroundColor: 'var(--paper)', color: 'var(--ink)', border: '1px solid var(--border)' }}
                                                    placeholder="Enter your name"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--ink-muted)' }}>Age</label>
                                                <input
                                                    type="number"
                                                    value={age}
                                                    onChange={(e) => setAge(e.target.value)}
                                                    className="w-full px-4 py-2.5 text-sm rounded-sm outline-none transition-colors"
                                                    style={{ backgroundColor: 'var(--paper)', color: 'var(--ink)', border: '1px solid var(--border)' }}
                                                    placeholder="Optional"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-10 pt-6 border-t border-[var(--border)]">
                                            <button
                                                onClick={() => { logout(); router.push('/') }}
                                                className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80"
                                                style={{ color: 'var(--danger)' }}
                                            >
                                                <LogOut className="w-4 h-4" /> Sign out of account
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'preferences' && (
                                    <div className="p-6 md:p-8">
                                        <h2 className="font-serif text-xl font-bold mb-6" style={{ color: 'var(--ink)' }}>Reading Preferences</h2>

                                        <div className="space-y-8">
                                            {/* Summary Mode */}
                                            <div>
                                                <div className="mb-4">
                                                    <label className="block text-sm font-bold mb-1" style={{ color: 'var(--ink)' }}>Default AI Summary</label>
                                                    <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>Choose how Gemini summarizes complex news articles.</p>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div
                                                        onClick={() => setSummaryMode('pro')}
                                                        className="p-4 rounded-sm border cursor-pointer transition-colors"
                                                        style={{
                                                            borderColor: summaryMode === 'pro' ? 'var(--ink)' : 'var(--border)',
                                                            backgroundColor: summaryMode === 'pro' ? 'var(--paper-sunken)' : 'transparent'
                                                        }}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg">🎯</span>
                                                                <span className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>Pro Mode</span>
                                                            </div>
                                                            <div className="w-4 h-4 rounded-full border flex items-center justify-center" style={{ borderColor: summaryMode === 'pro' ? 'var(--ink)' : 'var(--border)' }}>
                                                                {summaryMode === 'pro' && <div className="w-2 h-2 rounded-full bg-[var(--ink)]" />}
                                                            </div>
                                                        </div>
                                                        <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>Professional, concise executive summaries outlining key facts and statistics.</p>
                                                    </div>

                                                    <div
                                                        onClick={() => setSummaryMode('kid')}
                                                        className="p-4 rounded-sm border cursor-pointer transition-colors"
                                                        style={{
                                                            borderColor: summaryMode === 'kid' ? 'var(--ink)' : 'var(--border)',
                                                            backgroundColor: summaryMode === 'kid' ? 'var(--paper-sunken)' : 'transparent'
                                                        }}
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-lg">🎈</span>
                                                                <span className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>Kid Mode</span>
                                                            </div>
                                                            <div className="w-4 h-4 rounded-full border flex items-center justify-center" style={{ borderColor: summaryMode === 'kid' ? 'var(--ink)' : 'var(--border)' }}>
                                                                {summaryMode === 'kid' && <div className="w-2 h-2 rounded-full bg-[var(--ink)]" />}
                                                            </div>
                                                        </div>
                                                        <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-muted)' }}>Friendly analogies and simpler language perfect for younger audiences or beginners.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Categories */}
                                            <div>
                                                <div className="mb-4">
                                                    <label className="block text-sm font-bold mb-1" style={{ color: 'var(--ink)' }}>News Topics</label>
                                                    <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>Select topics you're interested in to train the recommendation engine.</p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {CATEGORIES.map(cat => {
                                                        const selected = categories.includes(cat)
                                                        return (
                                                            <button
                                                                key={cat}
                                                                onClick={() => toggleCategory(cat)}
                                                                className="px-3 py-2 text-xs font-medium rounded-sm transition-all"
                                                                style={{
                                                                    backgroundColor: selected ? 'var(--ink)' : 'transparent',
                                                                    color: selected ? 'var(--paper)' : 'var(--ink-muted)',
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
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Global Save Button */}
                        <div className="mt-6 flex items-center gap-4">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="pl-5 pr-6 py-2.5 rounded-sm text-sm font-semibold flex items-center gap-2 transition-all"
                                style={{ backgroundColor: 'var(--ink)', color: 'var(--paper)' }}
                            >
                                {saving ? (
                                    <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--paper)', borderTopColor: 'transparent' }} />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {saving ? 'Saving...' : 'Save Settings'}
                            </button>

                            <AnimatePresence>
                                {success && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="text-sm font-medium flex items-center gap-1.5"
                                        style={{ color: 'var(--success)' }}
                                    >
                                        <Check className="w-4 h-4" /> Saved automatically
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}
