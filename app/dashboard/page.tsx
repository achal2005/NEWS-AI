'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { NewsTicker } from '@/components/ui/NewsTicker'
import { NewspaperLoader } from '@/components/ui/NewspaperLoader'
import { ArticleCard } from '@/components/ui/ArticleCard'

interface Article {
    id: string
    title: string
    content: string
    category: string
    source_name: string
    source_url: string
    image_url: string | null
    published_at: string
}

// Repeating pattern for newspaper-style varied card sizes (desktop only)
const GRID_PATTERN: Array<{ cols: string; rows: string; size: 'featured' | 'normal' | 'tall' | 'wide' }> = [
    { cols: 'md:col-span-2', rows: 'md:row-span-2', size: 'featured' },
    { cols: '', rows: '', size: 'normal' },
    { cols: '', rows: 'md:row-span-2', size: 'tall' },
    { cols: 'md:col-span-2', rows: '', size: 'wide' },
    { cols: '', rows: '', size: 'normal' },
    { cols: '', rows: '', size: 'normal' },
    { cols: '', rows: 'md:row-span-2', size: 'tall' },
    { cols: '', rows: '', size: 'normal' },
]

function getGridClass(index: number) {
    const pattern = GRID_PATTERN[index % GRID_PATTERN.length]
    return {
        className: `col-span-1 ${pattern.cols} ${pattern.rows}`.trim(),
        size: pattern.size,
    }
}

export default function DashboardPage() {
    const { user, token } = useAuth()
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [totalArticles, setTotalArticles] = useState(0)
    const [loadingMore, setLoadingMore] = useState(false)

    const fetchArticles = useCallback(async (retries = 4, pageNum = 1, append = false) => {
        if (pageNum === 1) setLoading(true)
        else setLoadingMore(true)
        setError(null)
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 60000) // 60s timeout for Render cold starts
                const headers: Record<string, string> = {}
                if (token) headers['Authorization'] = `Bearer ${token}`
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news?page=${pageNum}&page_size=20`, {
                    cache: 'no-store',
                    signal: controller.signal,
                    headers,
                })
                clearTimeout(timeoutId)
                if (res.ok) {
                    const data = await res.json()
                    if (append) {
                        setArticles(prev => [...prev, ...(data.items || [])])
                    } else {
                        setArticles(data.items || [])
                    }
                    setTotalArticles(data.total || 0)
                    setLoading(false)
                    setLoadingMore(false)
                    return
                }
            } catch (err) {
                console.error(`Fetch attempt ${attempt + 1} failed:`, err)
                if (attempt < retries) {
                    // Exponential backoff: 3s, 6s, 12s, 24s — enough for Render cold starts
                    await new Promise(r => setTimeout(r, 3000 * Math.pow(2, attempt)))
                }
            }
        }
        setError('Could not reach the server. It may be waking up — try again in a moment.')
        setLoading(false)
        setLoadingMore(false)
    }, [token])

    useEffect(() => {
        fetchArticles()
    }, [fetchArticles])

    const refreshArticles = async () => {
        setRefreshing(true)
        try {
            // Call the combined refresh endpoint (NewsAPI + RSS feeds)
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/refresh`, { cache: 'no-store' })
            if (res.ok) {
                const data = await res.json()
                console.log('News refresh result:', data)
            }
        } catch (err) {
            console.error('News refresh failed:', err)
        }
        // Now re-fetch articles from the database
        setPage(1)
        await fetchArticles(0, 1, false)
        setRefreshing(false)
    }

    const loadMore = async () => {
        const nextPage = page + 1
        setPage(nextPage)
        await fetchArticles(0, nextPage, true)
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }).toUpperCase()
    }

    if (loading) {
        return (
            <>
                <NewsTicker />
                <NewspaperLoader />
            </>
        )
    }

    if (error) {
        return (
            <>
                <NewsTicker />
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-center animate-fade-in-up px-4">
                    <span className="material-symbols-outlined text-6xl text-alert mb-4">cloud_off</span>
                    <h2 className="font-display font-bold text-2xl mb-2">Connection Issue</h2>
                    <p className="font-mono text-sm text-ink/60 mb-6 max-w-md">{error}</p>
                    <button
                        onClick={() => fetchArticles()}
                        className="px-6 py-3 bg-primary border-3 border-ink shadow-hard font-bold hover:shadow-hard-hover hover:-translate-y-1 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">refresh</span>
                        RETRY
                    </button>
                </div>
            </>
        )
    }

    return (
        <>
            {/* Marquee Ticker */}
            <NewsTicker />

            {/* Header / Controls */}
            <header className="px-8 py-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <span className="bg-ink text-canvas px-2 py-1 text-xs font-bold font-mono">
                            {formatDate(new Date().toISOString())}
                        </span>
                        <div className="h-px bg-ink w-12" />
                    </div>
                    <h1 className="font-display font-black text-5xl md:text-6xl tracking-tight leading-[0.9]">
                        THE DAILY<br />
                        <span style={{ WebkitTextStroke: '2px #121212', color: 'transparent' }}>BRIEF</span>
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={refreshArticles}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-white border-3 border-ink shadow-hard font-bold text-sm hover:bg-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <span className={`material-symbols-outlined text-lg ${refreshing ? 'animate-spin' : ''}`}>refresh</span>
                        {refreshing ? 'REFRESHING...' : 'REFRESH'}
                    </button>
                </div>
            </header>

            {/* Newspaper Grid Layout */}
            <div className="flex-1 p-8 pt-2">
                {articles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
                        <span className="material-symbols-outlined text-6xl text-ink/20 mb-4">newspaper</span>
                        <h2 className="font-display font-bold text-2xl mb-2">No Articles Yet</h2>
                        <p className="font-mono text-sm text-ink/60 mb-6">Hit REFRESH to fetch the latest news</p>
                        <button onClick={refreshArticles} className="px-6 py-3 bg-primary border-3 border-ink shadow-hard font-bold hover:shadow-hard-hover hover:-translate-y-1 transition-all">
                            FETCH NEWS
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-[minmax(180px,auto)] grid-flow-dense pb-12 max-w-[1400px] mx-auto">
                            {articles.map((article, i) => {
                                const { className, size } = getGridClass(i)
                                return (
                                    <div key={article.id} className={className}>
                                        <ArticleCard article={article} index={i} size={size} />
                                    </div>
                                )
                            })}
                        </div>

                        {/* Load More + Quiz CTA */}
                        <div className="flex flex-col items-center gap-6 py-12 max-w-[1400px] mx-auto">
                            {articles.length < totalArticles && (
                                <button
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="flex items-center gap-2 px-8 py-3 bg-white border-3 border-ink shadow-hard font-bold text-sm uppercase hover:bg-primary hover:-translate-y-1 hover:shadow-hard-hover transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <span className={`material-symbols-outlined text-lg ${loadingMore ? 'animate-spin' : ''}`}>
                                        {loadingMore ? 'progress_activity' : 'expand_more'}
                                    </span>
                                    {loadingMore ? 'LOADING...' : `LOAD MORE (${articles.length} / ${totalArticles})`}
                                </button>
                            )}

                            {/* Quiz CTA */}
                            <Link
                                href="/quiz"
                                className="w-full max-w-md border-3 border-ink bg-ink text-primary p-6 shadow-hard hover:-translate-y-1 hover:shadow-hard-hover transition-all flex items-center justify-between group"
                            >
                                <div>
                                    <span className="text-xs font-mono font-bold opacity-70 block mb-1">GAMIFICATION</span>
                                    <h3 className="font-display font-black text-xl uppercase group-hover:underline decoration-primary decoration-3">
                                        Take the Pop Quiz →
                                    </h3>
                                    <p className="font-mono text-xs text-primary/70 mt-1">
                                        Test your knowledge and earn XP
                                    </p>
                                </div>
                                <span className="material-symbols-outlined text-4xl text-primary group-hover:scale-110 transition-transform">quiz</span>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </>
    )
}
