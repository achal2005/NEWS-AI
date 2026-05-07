'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'

interface LeaderboardEntry {
    user_id: string
    display_name: string
    weekly_points: number
    rank: number
    articles_read: number
    quiz_accuracy: number | null
    reading_time_minutes: number
}

export default function LeaderboardPage() {
    const { user } = useAuth()
    const [entries, setEntries] = useState<LeaderboardEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null)

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leaderboard`, {
                    credentials: 'include',
                    cache: 'no-store',
                })
                if (res.ok) {
                    const data = await res.json()
                    setEntries(data.entries || [])
                    if (data.user_entry) setUserRank(data.user_entry)
                }
            } catch (err) {
                console.error('Failed to fetch leaderboard:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchLeaderboard()
    }, [user])

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center py-20">
                <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-ink/20 animate-pulse">trophy</span>
                    <p className="font-mono text-sm text-ink/60 mt-4">Loading roster...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col">
            {/* Header Bar */}
            <header className="h-20 border-b-3 border-ink flex items-center justify-between px-8 bg-white/50 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-black uppercase tracking-tight font-sans">Weekly Top Readers</h2>
                    <span className="bg-ink text-primary px-2 py-1 text-xs font-mono font-bold">
                        {(() => {
                            const now = new Date();
                            const weekNum = Math.ceil(now.getDate() / 7);
                            return `WEEK ${weekNum} // ${now.toLocaleString('default', { month: 'short' }).toUpperCase()} ${now.getFullYear()}`;
                        })()}
                    </span>
                </div>
                {userRank && (
                    <div className="flex items-center gap-2 border-2 border-ink rounded-full px-3 py-1 bg-white shadow-hard-sm">
                        <span className="material-symbols-outlined text-sm">local_fire_department</span>
                        <span className="font-mono text-sm font-bold">RANK: #{userRank.rank}</span>
                    </div>
                )}
            </header>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-6xl mx-auto h-full flex flex-col lg:flex-row gap-8">

                    {/* Left Column: The List (Clipboard Style) */}
                    <div className="flex-1 flex flex-col">
                        {/* Clipboard Top Clip */}
                        <div className="mx-auto w-32 h-4 bg-ink rounded-t-lg relative z-10 -mb-2" />

                        <div className="bg-white border-3 border-ink shadow-hard relative flex flex-col">
                            {/* Table Header */}
                            <div className="flex items-center border-b-3 border-ink bg-paper-accent px-6 py-4">
                                <div className="w-16 font-mono font-bold text-xs text-ink/60">RANK</div>
                                <div className="flex-1 font-mono font-bold text-xs text-ink/60">READER</div>
                                <div className="w-24 text-right font-mono font-bold text-xs text-ink/60">SCORE</div>
                                <div className="w-24 text-right font-mono font-bold text-xs text-ink/60 hidden sm:block">ARTICLES</div>
                            </div>

                            {/* List Items */}
                            <div className="flex flex-col">
                                {entries.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <span className="material-symbols-outlined text-4xl text-ink/20">groups</span>
                                        <p className="font-mono text-sm text-ink/60 mt-2">No readers on the roster yet.</p>
                                    </div>
                                ) : (
                                    entries.map((entry) => {
                                        const isCurrentUser = user && entry.user_id === user.id
                                        const isTop = entry.rank === 1

                                        return (
                                            <div
                                                key={entry.user_id}
                                                className={`flex items-center px-6 py-4 border-b border-ink/10 transition-colors relative ${isCurrentUser
                                                    ? 'py-5 border-y-3 border-ink bg-primary shadow-inner-hard'
                                                    : isTop
                                                        ? 'py-5 border-b-3 border-ink bg-white'
                                                        : entry.rank % 2 === 0
                                                            ? 'bg-paper-accent/50 hover:bg-white'
                                                            : 'bg-white hover:bg-paper-accent'
                                                    }`}
                                            >
                                                {isTop && <div className="absolute left-0 top-0 bottom-0 w-2 bg-alert" />}

                                                <div className="w-16 flex items-center">
                                                    {isTop ? (
                                                        <div className="w-8 h-8 bg-alert text-white rounded-full flex items-center justify-center border-2 border-ink shadow-hard-sm rotate-[-6deg]">
                                                            <span className="font-black text-sm">1</span>
                                                        </div>
                                                    ) : (
                                                        <span className="font-mono font-bold text-lg text-ink/50">
                                                            {String(entry.rank).padStart(2, '0')}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex-1 flex items-center gap-3">
                                                    <div className={`w-10 h-10 ${isTop ? 'border-2' : 'border'} border-ink rounded-full flex items-center justify-center bg-cool text-white font-bold`}>
                                                        {entry.display_name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`font-bold ${isTop ? 'text-lg' : ''} leading-none`}>
                                                            {isCurrentUser ? 'YOU' : entry.display_name}
                                                        </span>
                                                        {isTop && (
                                                            <span className="text-xs font-mono bg-alert/10 text-alert px-1 rounded w-fit mt-1">
                                                                CHAMPION
                                                            </span>
                                                        )}
                                                        {isCurrentUser && !isTop && (
                                                            <span className="text-xs font-mono font-bold opacity-70">
                                                                Top {Math.round((entry.rank / entries.length) * 100)}% Global
                                                            </span>
                                                        )}
                                                    </div>
                                                    {isTop && (
                                                        <span className="material-symbols-outlined text-alert ml-2 animate-bounce">crown</span>
                                                    )}
                                                </div>

                                                <div className={`w-24 text-right font-mono font-bold ${isTop || isCurrentUser ? 'text-xl' : ''}`}>
                                                    {entry.weekly_points?.toLocaleString() || '0'}
                                                </div>
                                                <div className="w-24 text-right font-mono text-sm hidden sm:block">
                                                    {entry.articles_read || 0}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Stats Module */}
                    {userRank && (
                        <div className="w-full lg:w-80 flex flex-col gap-6">
                            <div className="bg-ink p-1 shadow-hard">
                                <div className="bg-paper-accent border-2 border-ink h-full p-4 flex flex-col gap-4">
                                    <div className="flex justify-between items-center border-b-2 border-ink/10 pb-2">
                                        <h3 className="font-black text-lg font-sans">YOUR STATS</h3>
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                        </div>
                                    </div>

                                    {/* Stat Cards */}
                                    <div className="grid grid-cols-1 gap-4">
                                        {/* Points */}
                                        <div className="bg-white border-2 border-ink p-3 shadow-hard-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-mono text-xs font-bold text-ink/60">TOTAL POINTS</span>
                                                <span className="material-symbols-outlined text-alert text-lg">stars</span>
                                            </div>
                                            <div className="bg-ink/5 p-2 border border-ink/10">
                                                <span className="lcd-text text-3xl font-black text-ink block text-center tracking-widest">
                                                    {userRank.weekly_points?.toLocaleString() || '0'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Articles Read */}
                                        <div className="bg-white border-2 border-ink p-3 shadow-hard-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-mono text-xs font-bold text-ink/60">ARTICLES READ</span>
                                                <span className="material-symbols-outlined text-primary-dark text-lg">menu_book</span>
                                            </div>
                                            <div className="bg-ink/5 p-2 border border-ink/10">
                                                <span className="lcd-text text-3xl font-black text-ink block text-center">
                                                    {userRank.articles_read || 0}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Quiz Accuracy */}
                                        <div className="bg-white border-2 border-ink p-3 shadow-hard-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-mono text-xs font-bold text-ink/60">QUIZ WIN %</span>
                                                <span className="material-symbols-outlined text-cool text-lg">verified</span>
                                            </div>
                                            <div className="bg-ink/90 p-2 border border-ink relative overflow-hidden">
                                                <div className="absolute inset-0 bg-primary opacity-20 animate-pulse" />
                                                <span className="lcd-text text-3xl font-black text-primary block text-center tracking-widest relative z-10">
                                                    {userRank.quiz_accuracy != null ? `${Math.round(userRank.quiz_accuracy)}%` : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
