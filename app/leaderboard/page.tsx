'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react'
import { useAuth } from '@/lib/auth'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface LeaderboardEntry {
    rank: number
    user_id: string
    display_name: string
    weekly_points: number
    quiz_accuracy: number | null
    reading_time_minutes: number | null
    articles_read: number | null
}

export default function LeaderboardPage() {
    const { user, token, isAuthenticated } = useAuth()
    const [entries, setEntries] = useState<LeaderboardEntry[]>([])
    const [userRank, setUserRank] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLeaderboard()
    }, [isAuthenticated])

    const fetchLeaderboard = async () => {
        try {
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch(`${apiUrl}/api/leaderboard`, {
                headers,
                cache: 'no-store',
            })
            if (res.ok) {
                const data = await res.json()
                setEntries(data.entries || [])
                setUserRank(data.user_rank ?? null)
            } else {
                setEntries([])
            }
        } catch {
            setEntries([])
        } finally {
            setLoading(false)
        }
    }

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="w-5 h-5" style={{ color: '#D4AF37' }} />
        if (rank === 2) return <Medal className="w-5 h-5" style={{ color: '#AAA9AD' }} />
        if (rank === 3) return <Medal className="w-5 h-5" style={{ color: '#CD7F32' }} />
        return <span className="text-sm font-bold" style={{ color: 'var(--ink-muted)' }}>{rank}</span>
    }

    const myEntry = entries.find(e => user && String(e.user_id) === String(user.id))

    return (
        <div className="min-h-screen px-gutter py-12">
            <div className="max-w-reading mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Trophy className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                        <h1 className="font-serif text-headline" style={{ color: 'var(--ink)' }}>
                            Leaderboard
                        </h1>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                        Weekly rankings — top readers earn bragging rights
                    </p>
                </motion.div>

                <div className="editorial-rule-thick" />

                {/* My Rank Card */}
                {myEntry && (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="editorial-card p-5 mb-8"
                        style={{ borderColor: 'var(--accent)' }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                                    style={{ backgroundColor: 'var(--accent)', color: 'var(--paper)' }}
                                >
                                    #{myEntry.rank}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>
                                        Your Rank
                                    </p>
                                    <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                                        {myEntry.weekly_points} pts this week · {myEntry.articles_read ?? 0} articles
                                    </p>
                                </div>
                            </div>
                            <TrendingUp className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                        </div>
                    </motion.div>
                )}

                {/* Leaderboard List */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="editorial-card p-5 animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full" style={{ backgroundColor: 'var(--paper-sunken)' }} />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 rounded w-1/3" style={{ backgroundColor: 'var(--paper-sunken)' }} />
                                        <div className="h-3 rounded w-1/4" style={{ backgroundColor: 'var(--paper-sunken)' }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : entries.length === 0 ? (
                    <div className="editorial-card p-12 text-center">
                        <p className="font-serif text-xl mb-2" style={{ color: 'var(--ink)' }}>
                            No Rankings Yet
                        </p>
                        <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                            Start reading articles and taking quizzes to appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {entries.map((entry, i) => {
                            const isMe = user && String(entry.user_id) === String(user.id)
                            return (
                                <motion.div
                                    key={entry.user_id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`editorial-card p-4 flex items-center gap-4 transition-all ${isMe ? '!border-[var(--accent)]' : ''}`}
                                >
                                    {/* Rank */}
                                    <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                                        {getRankIcon(entry.rank)}
                                    </div>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className="font-semibold text-sm truncate"
                                            style={{ color: isMe ? 'var(--accent)' : 'var(--ink)' }}
                                        >
                                            {entry.display_name}
                                            {isMe && <span className="text-xs ml-1.5 opacity-60">(you)</span>}
                                        </p>
                                        <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                                            {entry.articles_read ?? 0} articles
                                            {entry.quiz_accuracy != null && ` · ${entry.quiz_accuracy}% quiz accuracy`}
                                        </p>
                                    </div>

                                    {/* Points */}
                                    <div className="text-right">
                                        <p className="font-bold text-sm font-serif" style={{ color: 'var(--ink)' }}>
                                            {entry.weekly_points.toLocaleString()}
                                        </p>
                                        <p className="text-[0.65rem] uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>
                                            pts
                                        </p>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
