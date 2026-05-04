'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'

interface TasteProfile {
    preferred_categories: string[]
    summary_mode: string
    depth_preference: number
    topic_weights: Record<string, number>
}

const CATEGORIES = [
    'technology', 'science', 'business', 'health',
    'sports', 'entertainment', 'politics', 'general',
]

export default function ProfilePage() {
    const { user, isAuthenticated, token } = useAuth()
    const [profile, setProfile] = useState<TasteProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [displayName, setDisplayName] = useState('')
    const [bio, setBio] = useState('')
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [summaryMode, setSummaryMode] = useState('pro')
    const [depthPreference, setDepthPreference] = useState(5)

    // Debounce timer for auto-saving depth
    useEffect(() => {
        if (!profile || loading) return

        // Only trigger auto-save if the depth actually changed from the initial loaded profile
        if (depthPreference !== (profile.depth_preference || 5)) {
            const timer = setTimeout(() => {
                saveProfile(depthPreference)
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [depthPreference])

    useEffect(() => {
        if (!isAuthenticated) { setLoading(false); return }

        const fetchProfile = async () => {
            try {
                const headers: Record<string, string> = {}
                if (token) headers['Authorization'] = `Bearer ${token}`
                
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, {
                    headers,
                    cache: 'no-store',
                })
                if (res.ok) {
                    const data = await res.json()
                    setProfile(data)
                    // Only keep categories that have UI toggles — strip ghost categories
                    const validCategories = (data.preferred_categories || []).filter(
                        (c: string) => CATEGORIES.includes(c)
                    )
                    setSelectedCategories(validCategories)
                    setSummaryMode(data.summary_mode || 'pro')
                    setDepthPreference(data.depth_preference || 5)
                }
            } catch (err) {
                console.error('Failed to fetch profile:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
        if (user) {
            setDisplayName(user.display_name || '')
        }
    }, [isAuthenticated, user])

    const saveProfile = async (currentDepth?: number) => {
        if (!isAuthenticated) return
        setSaving(true)

        const depthToSave = currentDepth !== undefined ? currentDepth : depthPreference

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    display_name: displayName,
                    preferred_categories: selectedCategories,
                    summary_mode: summaryMode,
                    depth_preference: depthToSave,
                }),
            })

            // Update local profile state to match what was saved
            if (profile) {
                setProfile({ ...profile, depth_preference: depthToSave })
            }
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch (err) {
            console.error('Failed to save profile:', err)
        } finally {
            setSaving(false)
        }
    }

    const toggleCategory = (cat: string) => {
        setSelectedCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        )
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center py-20">
                <span className="material-symbols-outlined text-6xl text-ink/20 animate-pulse">settings</span>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col">
            {/* Header */}
            <header className="px-8 py-6 border-b-[4px] border-ink flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-2 font-sans">Settings</h1>
                    <p className="font-mono text-sm bg-ink text-white inline-block px-2 py-1">
                        OPERATOR_SETTINGS // {user?.email || 'GUEST'}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => saveProfile()}
                        disabled={saving}
                        className="px-6 py-2 bg-primary border-3 border-ink font-bold shadow-hard hover:shadow-hard-hover transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">save</span>
                        {saving ? 'SAVING...' : saved ? 'SAVED ✓' : 'SAVE CHANGES'}
                    </button>
                </div>
            </header>

            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in-up">

                    {/* Left Column: Identity Card */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                        <div className="bg-white border-3 border-ink p-6 shadow-hard relative">
                            {/* Punched Hole */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-ink rounded-full" />

                            <div className="mt-8 flex flex-col items-center text-center">
                                {/* Avatar */}
                                <div className="w-40 h-40 border-3 border-ink bg-cool flex items-center justify-center text-white text-6xl font-black mb-4">
                                    {user?.display_name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>

                                <h2 className="font-bold text-2xl uppercase mt-2 font-sans">
                                    {user?.display_name || 'READER'}
                                </h2>
                                <p className="font-mono text-sm text-gray-500 mb-6">
                                    {user?.email || 'Not signed in'}
                                </p>

                                <div className="w-full text-left space-y-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="font-mono text-xs font-bold uppercase bg-ink text-white w-fit px-1">CALL SIGN</label>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="w-full border-2 border-ink p-3 font-mono text-lg focus:ring-0 focus:border-primary focus:bg-primary/10 transition-colors shadow-hard-sm bg-canvas"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="font-mono text-xs font-bold uppercase bg-ink text-white w-fit px-1">MANIFESTO</label>
                                        <textarea
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            rows={4}
                                            className="w-full border-2 border-ink p-3 font-mono text-sm focus:ring-0 focus:border-primary focus:bg-primary/10 transition-colors shadow-hard-sm bg-canvas resize-none"
                                            placeholder="Your reading philosophy..."
                                        />
                                    </div>
                                </div>

                                {/* Decorative barcode */}
                                <div className="mt-8 w-full h-8 bg-ink/10 flex items-center justify-center">
                                    <span className="font-mono text-[10px] tracking-widest text-ink/40">
                                        AUTH_TOKEN_VALID
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Control Panel */}
                    <div className="lg:col-span-7 flex flex-col gap-8">
                        {/* Visual Modes */}
                        <section className="animate-fade-in-up opacity-0" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-ink text-white px-2 py-0.5 font-mono text-sm font-bold uppercase">01 // READING_MODE</span>
                                <div className="h-0.5 bg-ink flex-1" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setSummaryMode('pro')}
                                    className={`border-3 border-ink p-4 bg-white text-left transition-all ${summaryMode === 'pro' ? 'bg-primary/20 shadow-hard' : 'hover:shadow-hard'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-lg font-sans">DEEP_MODE</span>
                                        <div className={`size-6 border-2 border-ink rounded-full flex items-center justify-center ${summaryMode === 'pro' ? 'bg-ink' : ''
                                            }`}>
                                            {summaryMode === 'pro' && <div className="size-2 bg-white rounded-full" />}
                                        </div>
                                    </div>
                                    <p className="text-sm font-mono text-gray-600">Full analysis. Expert vocabulary. Complete detail.</p>
                                </button>
                                <button
                                    onClick={() => setSummaryMode('kid')}
                                    className={`border-3 border-ink p-4 bg-white text-left transition-all ${summaryMode === 'kid' ? 'bg-primary/20 shadow-hard' : 'hover:shadow-hard'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-lg font-sans">SKIM_MODE</span>
                                        <div className={`size-6 border-2 border-ink rounded-full flex items-center justify-center ${summaryMode === 'kid' ? 'bg-ink' : ''
                                            }`}>
                                            {summaryMode === 'kid' && <div className="size-2 bg-white rounded-full" />}
                                        </div>
                                    </div>
                                    <p className="text-sm font-mono text-gray-600">Simplified language. Quick bites. Easy to digest.</p>
                                </button>
                            </div>
                        </section>

                        {/* Topic Preferences */}
                        <section className="animate-fade-in-up opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-ink text-white px-2 py-0.5 font-mono text-sm font-bold uppercase">02 // FEED_CHANNELS</span>
                                <div className="h-0.5 bg-ink flex-1" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => toggleCategory(cat)}
                                        className={`p-3 border-3 border-ink font-bold text-sm uppercase transition-all ${selectedCategories.includes(cat)
                                            ? 'bg-primary shadow-hard'
                                            : 'bg-white hover:bg-paper-accent shadow-hard-sm hover:shadow-hard'
                                            }`}
                                    >
                                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Depth Calibrator */}
                        <section className="animate-fade-in-up opacity-0" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-ink text-white px-2 py-0.5 font-mono text-sm font-bold uppercase">03 // DEPTH_CALIBRATOR</span>
                                <div className="h-0.5 bg-ink flex-1" />
                            </div>
                            <div className="bg-white border-3 border-ink p-8 shadow-hard relative">
                                <div className="flex justify-between items-center mb-10">
                                    <div>
                                        <h3 className="font-black uppercase text-xl font-sans leading-none mb-1">Complexity Matrix</h3>
                                        <p className="font-mono text-xs text-ink/60">Tuning Gemini 3.1 Pro linguistic density</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[10px] uppercase font-bold text-ink/40">LEVEL</span>
                                        <span className="font-mono text-2xl font-black bg-primary px-3 py-1 border-3 border-ink shadow-hard-sm">
                                            {depthPreference}
                                        </span>
                                    </div>
                                </div>

                                {/* Custom Brutalist Slider */}
                                <div className="relative pt-6 pb-2">
                                    {/* Track Background */}
                                    <div className="absolute top-1/2 left-0 right-0 h-4 bg-canvas border-2 border-ink -translate-y-1/2 rounded-full overflow-hidden">
                                        {/* Active Track Fill */}
                                        <div
                                            className="h-full bg-primary transition-all duration-300 ease-out"
                                            style={{ width: `${((depthPreference - 1) / 9) * 100}%` }}
                                        />
                                    </div>

                                    {/* Tick Marks */}
                                    <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between px-1 pointer-events-none z-10">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                            <div key={num} className="w-0.5 h-6 bg-ink flex flex-col items-center justify-end relative">
                                                <span className={`absolute -bottom-6 font-mono text-[10px] font-bold ${depthPreference === num ? 'text-ink' : 'text-ink/40'}`}>
                                                    {num}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Invisible Native Input for Accessibility / Logic */}
                                    <input
                                        type="range"
                                        min={1}
                                        max={10}
                                        value={depthPreference}
                                        onChange={(e) => setDepthPreference(Number(e.target.value))}
                                        className="absolute top-1/2 left-0 right-0 -translate-y-1/2 w-full h-8 opacity-0 cursor-pointer z-20"
                                    />

                                    {/* Custom Thumb (Visual Only) */}
                                    <div
                                        className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-ink border-2 border-white shadow-[0_0_0_2px_#121212] rounded-full pointer-events-none z-10 transition-all duration-200 ease-out flex items-center justify-center text-primary font-black font-mono text-xs"
                                        style={{ left: `calc(${((depthPreference - 1) / 9) * 100}% - 16px)` }}
                                    >
                                        ||
                                    </div>
                                </div>

                                <div className="flex justify-between font-mono text-[10px] uppercase font-bold text-ink/50 mt-10">
                                    <div className="max-w-[120px]">
                                        <span className="block text-ink mb-1">LVL 01</span>
                                        Elementary reading. Simple concepts. Zero jargon.
                                    </div>
                                    <div className="max-w-[120px] text-right">
                                        <span className="block text-ink mb-1">LVL 10</span>
                                        PhD domain expert. High conceptual density.
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}
