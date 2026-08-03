'use client'

import React from 'react'
import { useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useInfiniteQuery } from '@tanstack/react-query'
import { NewsTicker } from '@/components/ui/NewsTicker'
import { NewspaperLoader } from '@/components/ui/NewspaperLoader'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { ArticleCardSkeleton } from '@/components/ui/ArticleCardSkeleton'

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
    { cols: '', rows: '', size: 'normal' },
    { cols: 'md:col-span-2', rows: '', size: 'wide' },
    { cols: '', rows: '', size: 'normal' },
    { cols: '', rows: '', size: 'normal' },
    { cols: '', rows: 'md:row-span-2', size: 'tall' },
    { cols: '', rows: '', size: 'normal' },
]

function getGridClass(index: number) {
    const pattern = GRID_PATTERN[index % GRID_PATTERN.length]
    return {
        className: `${pattern.cols} ${pattern.rows}`.trim(),
        size: pattern.size,
    }
}

const PAGE_SIZE = 20

export default function DashboardPage() {
    const { isAuthenticated } = useAuth()
    const loadMoreRef = useRef<HTMLDivElement>(null)

    // ── Infinite Query for article feed ──
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
        refetch,
    } = useInfiniteQuery({
        queryKey: ['articles', isAuthenticated],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/news?page=${pageParam}&page_size=${PAGE_SIZE}`,
                { cache: 'no-store', credentials: 'include' }
            )
            if (!res.ok) throw new Error(`API error: ${res.status}`)
            return res.json()
        },
        getNextPageParam: (lastPage, allPages) => {
            const totalFetched = allPages.reduce((sum, p) => sum + (p.items?.length || 0), 0)
            if (totalFetched < (lastPage.total || 0)) {
                return allPages.length + 1
            }
            return undefined
        },
        initialPageParam: 1,
        retry: 3,
        retryDelay: (attempt) => Math.min(2000 * 2 ** attempt, 30000),
        staleTime: 5 * 60 * 1000,
    })

    // ── IntersectionObserver for infinite scroll ──
    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries
            if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage()
            }
        },
        [fetchNextPage, hasNextPage, isFetchingNextPage]
    )

    useEffect(() => {
        const el = loadMoreRef.current
        if (!el) return
        const observer = new IntersectionObserver(handleObserver, {
            rootMargin: '400px', // Pre-fetch 400px before user reaches bottom
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [handleObserver])

    // ── Flatten all pages into a single array ──
    const articles: Article[] = data?.pages.flatMap((p) => p.items || []) || []
    const totalArticles = data?.pages[0]?.total || 0

    // ── Refresh handler ──
    const [refreshing, setRefreshing] = React.useState(false)
    const refreshArticles = async () => {
        setRefreshing(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/refresh`, {
                cache: 'no-store',
                credentials: 'include',
            })
            if (res.ok) {
                refetch()
            }
        } catch (err) {
            console.error('Refresh failed:', err)
        } finally {
            setRefreshing(false)
        }
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        })
    }

    // ── Skeleton grid for loading state ──
    const SkeletonGrid = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-[minmax(180px,auto)] grid-flow-dense pb-12 max-w-[1400px] mx-auto">
            {Array.from({ length: 8 }).map((_, i) => {
                const { className, size } = getGridClass(i)
                return (
                    <div key={`skel-${i}`} className={className}>
                        <ArticleCardSkeleton size={size} />
                    </div>
                )
            })}
        </div>
    )

    return (
        <div>
            <NewsTicker />

            <div className="p-6">
                {/* Edition masthead */}
                <div className="max-w-[1400px] mx-auto mb-6">
                    <div className="flex items-end justify-between gap-4 flex-wrap">
                        <div>
                            <p className="font-mono text-[11px] text-ink/50 tracking-[0.25em] uppercase mb-1">
                                Today&apos;s Edition · {formatDate(new Date().toISOString())}
                            </p>
                            <h1 className="overprint font-display text-5xl md:text-6xl font-black tracking-tight leading-[0.9]" data-text="The Feed">
                                The Feed
                            </h1>
                        </div>

                        <button
                            onClick={refreshArticles}
                            disabled={refreshing}
                            className="bg-surface text-ink border-3 border-ink px-4 py-2.5 font-mono font-bold text-xs tracking-wider shadow-hard hover:shadow-hard-hover hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            <span className={`material-symbols-outlined text-lg ${refreshing ? 'animate-spin' : ''}`}>
                                refresh
                            </span>
                            {refreshing ? 'PRINTING…' : 'NEW EDITION'}
                        </button>
                    </div>
                    <hr className="reg-rule mt-4" />
                    <p className="font-mono text-[11px] text-ink/40 tracking-widest uppercase mt-2">
                        {totalArticles} stories set in type · summarized by AI
                    </p>
                </div>

                {/* Article Grid */}
                {isLoading ? (
                    <SkeletonGrid />
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <span className="material-symbols-outlined text-6xl text-gray-400">cloud_off</span>
                        <p className="font-mono text-sm text-gray-500 text-center max-w-md">
                            {(error as Error)?.message || 'Could not reach the server. It may be waking up — try again in a moment.'}
                        </p>
                        <button
                            onClick={() => refetch()}
                            className="brutal-button bg-primary text-ink border-3 border-ink px-6 py-2 font-mono font-bold text-xs tracking-wider shadow-hard hover:shadow-hard-hover"
                        >
                            RETRY
                        </button>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <span className="material-symbols-outlined text-6xl text-gray-400">inbox</span>
                        <p className="font-mono text-sm text-gray-500 text-center max-w-md">
                            No articles yet for your selected topics. Try refreshing or updating your interests in Settings.
                        </p>
                        <button
                            onClick={refreshArticles}
                            disabled={refreshing}
                            className="brutal-button bg-primary text-ink border-3 border-ink px-6 py-2 font-mono font-bold text-xs tracking-wider shadow-hard hover:shadow-hard-hover"
                        >
                            REFRESH
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

                            {/* Skeleton cards for next-page loading */}
                            {isFetchingNextPage &&
                                Array.from({ length: 4 }).map((_, i) => {
                                    const idx = articles.length + i
                                    const { className, size } = getGridClass(idx)
                                    return (
                                        <div key={`loading-${i}`} className={className}>
                                            <ArticleCardSkeleton size={size} />
                                        </div>
                                    )
                                })
                            }
                        </div>

                        {/* Infinite scroll sentinel */}
                        <div ref={loadMoreRef} className="h-4" />

                        {/* End of feed indicator */}
                        {!hasNextPage && articles.length > 0 && (
                            <div className="text-center py-8 font-mono text-xs text-gray-400 tracking-widest uppercase">
                                — END OF FEED // {articles.length} ARTICLES LOADED —
                            </div>
                        )}

                        {/* Quiz CTA */}
                        {articles.length > 0 && (
                            <div className="max-w-[1400px] mx-auto mt-2 mb-8">
                                <Link href="/quiz"
                                    className="block bg-ink text-canvas border-3 border-ink p-6 shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all group relative overflow-hidden"
                                >
                                    <span className="text-secondary font-mono text-[11px] tracking-[0.25em] uppercase">The Back Page</span>
                                    <div className="flex items-center justify-between mt-1 gap-4">
                                        <h3 className="font-display text-2xl md:text-3xl font-black leading-tight group-hover:text-secondary transition-colors">
                                            This week&apos;s quiz is on the press →
                                        </h3>
                                        <span className="material-symbols-outlined text-4xl text-secondary shrink-0">quiz</span>
                                    </div>
                                    <p className="font-sans text-sm text-canvas/60 mt-2">Answer, earn XP, and climb the roster.</p>
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
