'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import SummaryModeToggle from '@/components/SummaryModeToggle'

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

interface JargonTerm {
    term: string
    definition: string
    difficulty: string
}

export default function ArticlePage() {
    const params = useParams()
    const { isAuthenticated } = useAuth()
    const articleId = params.id as string
    const lastFetchedModeRef = useRef<string | null>(null)

    const [article, setArticle] = useState<Article | null>(null)
    const [summary, setSummary] = useState<string | null>(null)
    const [summaryError, setSummaryError] = useState<string | null>(null)
    const [jargon, setJargon] = useState<JargonTerm[]>([])
    const [summaryMode, setSummaryMode] = useState('pro')
    const [loadingSummary, setLoadingSummary] = useState(false)
    const [regenerating, setRegenerating] = useState(false)
    const [loading, setLoading] = useState(true)
    const [readingProgress, setReadingProgress] = useState(0)
    const [showJargon, setShowJargon] = useState(false)

    // ── Reading Timer (30-second gamification) ────────────────────
    const readingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const readingSecondsRef = useRef(0)
    const pointsAwardedRef = useRef(false)

    useEffect(() => {
        // Reset on article change so points aren't double-awarded
        pointsAwardedRef.current = false
        readingSecondsRef.current = 0

        // Start a 1-second interval to count reading time
        readingTimerRef.current = setInterval(() => {
            readingSecondsRef.current += 1
        }, 1000)

        return () => {
            // On unmount: send accumulated reading time to backend
            if (readingTimerRef.current) clearInterval(readingTimerRef.current)
            const elapsed = readingSecondsRef.current
            if (isAuthenticated && elapsed >= 5 && !pointsAwardedRef.current) {
                pointsAwardedRef.current = true
                // Fire-and-forget POST with keepalive for reliability on page leave
                const payload = JSON.stringify({ article_id: articleId, seconds: elapsed })
                const url = `${process.env.NEXT_PUBLIC_API_URL}/api/user/reading-time`
                fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: payload,
                    keepalive: true,
                }).catch(() => { })
            }
        }
    }, [isAuthenticated, articleId])

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY
            const docHeight = document.body.scrollHeight - window.innerHeight
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
            setReadingProgress(Math.min(progress, 100))
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const fetchArticle = useCallback(async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news/${articleId}`, { cache: 'no-store' })
            if (res.ok) {
                setArticle(await res.json())
            }
        } catch (err) {
            console.error('Failed to fetch article:', err)
        } finally {
            setLoading(false)
        }
    }, [articleId])

    useEffect(() => { fetchArticle() }, [fetchArticle])

    const fetchSummary = useCallback(async (mode: string) => {
        // Prevent duplicate fetch for the same mode
        if (lastFetchedModeRef.current === mode) return
        lastFetchedModeRef.current = mode
        setLoadingSummary(true)
        setSummaryError(null)
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/news/${articleId}/summary?mode=${mode}`,
                {
                    credentials: 'include',
                    cache: 'no-store'
                }
            )
            if (res.ok) {
                const data = await res.json()
                setSummary(data.summary)
                if (data.jargon) setJargon(data.jargon)
            } else if (res.status === 429) {
                setSummaryError('AI quota reached. Please try again in a few minutes.')
            } else {
                setSummaryError('Failed to generate summary. Try again.')
            }
        } catch (err) {
            console.error('Failed to fetch summary:', err)
            setSummaryError('Could not reach the server. Please check your connection and retry.')
        } finally {
            setLoadingSummary(false)
        }
    }, [articleId])

    useEffect(() => {
        if (isAuthenticated) fetchSummary(summaryMode)
    }, [summaryMode, isAuthenticated, fetchSummary])

    const handleModeChange = (mode: string) => {
        lastFetchedModeRef.current = null // reset guard so mode switch fetches fresh
        setSummaryMode(mode)
    }

    const regenerateSummary = async () => {
        if (!isAuthenticated) return
        setRegenerating(true)
        setSummaryError(null)
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/news/${articleId}/regenerate-summary?mode=${summaryMode}`,
                {
                    method: 'POST',
                    credentials: 'include',
                    cache: 'no-store',
                }
            )
            if (res.ok) {
                const data = await res.json()
                setSummary(data.summary)
                lastFetchedModeRef.current = summaryMode
            } else if (res.status === 429) {
                setSummaryError('AI quota reached. Please try again in a few minutes.')
            } else {
                setSummaryError('Failed to regenerate summary. Try again.')
            }
        } catch (err) {
            console.error('Failed to regenerate summary:', err)
            setSummaryError('Could not reach the server.')
        } finally {
            setRegenerating(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-ink/20 animate-pulse">auto_stories</span>
                    <p className="font-mono text-sm text-ink/60 mt-4">Loading article...</p>
                </div>
            </div>
        )
    }

    if (!article) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-ink/20">error</span>
                    <p className="font-mono text-sm text-ink/60 mt-4">Article not found</p>
                    <Link href="/dashboard" className="mt-4 inline-block px-4 py-2 bg-primary border-3 border-ink shadow-hard font-bold">
                        BACK TO DROP
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* Sticky Header with Progress */}
            <header className="sticky top-0 z-30 w-full bg-canvas border-b-3 border-ink">
                <div className="flex items-center justify-between px-4 py-3 md:px-8 max-w-5xl mx-auto">
                    <Link href="/dashboard" className="flex items-center gap-2 font-mono font-bold text-sm hover:text-alert transition-colors group">
                        <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">arrow_back</span>
                        BACK TO DROP
                    </Link>
                    <div className="hidden md:block font-mono text-xs tracking-widest uppercase opacity-50">
                        Reading Mode: {summaryMode === 'pro' ? 'Deep Dive' : 'Skim'}
                    </div>
                    <div className="flex items-center gap-4">
                        <a href={article.source_url} target="_blank" rel="noopener noreferrer"
                            className="size-10 flex items-center justify-center border-3 border-ink bg-white shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
                            title="View Source">
                            <span className="material-symbols-outlined">open_in_new</span>
                        </a>
                    </div>
                </div>
                {/* Reading Progress Bar */}
                <div className="relative w-full h-3 border-t-3 border-ink bg-canvas">
                    <div
                        className="absolute top-0 left-0 h-full bg-primary transition-all duration-150"
                        style={{ width: `${readingProgress}%` }}
                    />
                </div>
            </header>

            {/* Article Content */}
            <article className="px-6 py-12 md:py-20 mx-auto max-w-[720px] relative animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
                {/* Hero Header */}
                <header className="mb-12 animate-fade-in-up opacity-0" style={{ animationDelay: '50ms', animationFillMode: 'forwards' }}>
                    <h1 className="font-display font-bold text-4xl md:text-6xl leading-[0.9] tracking-tight mb-8 text-ink">
                        {article.title}
                    </h1>

                    {/* Metadata Box */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-primary border-3 border-ink shadow-hard font-mono text-sm font-bold">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">newspaper</span>
                            <span>SOURCE: {article.source_name?.toUpperCase() || 'NEWS'}</span>
                        </div>
                        <div className="hidden md:block w-px h-4 bg-ink" />
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">label</span>
                            <span>{article.category?.toUpperCase() || 'GENERAL'}</span>
                        </div>
                        <div className="hidden md:block w-px h-4 bg-ink" />
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">calendar_today</span>
                            <span>{article.published_at ? new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : 'RECENT'}</span>
                        </div>
                    </div>
                </header>

                {/* AI Summary Section */}
                <div className="mb-10 border-3 border-ink bg-white shadow-hard p-6">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <div className="flex items-center gap-2">
                            <span className="bg-ink text-primary px-2 py-1 text-xs font-mono font-bold">AI BRIEF</span>
                            <span className="font-mono text-xs text-ink/60">
                                {summaryMode === 'pro' ? 'DEEP ANALYSIS' : 'QUICK SKIM'}
                            </span>
                        </div>
                        <SummaryModeToggle mode={summaryMode} onModeChange={handleModeChange} />
                        {isAuthenticated && (
                            <button
                                onClick={regenerateSummary}
                                disabled={regenerating || loadingSummary}
                                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-primary border-2 border-ink shadow-hard-sm font-bold text-xs uppercase hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Regenerate summary with current depth settings"
                            >
                                <span className={`material-symbols-outlined text-sm ${regenerating ? 'animate-spin' : ''}`}>refresh</span>
                                {regenerating ? 'REGENERATING...' : 'REGENERATE'}
                            </button>
                        )}
                    </div>

                    {loadingSummary ? (
                        <div className="space-y-3">
                            <div className="h-4 bg-paper-grey w-full relative overflow-hidden"><div className="absolute inset-0 skeleton-shimmer" /></div>
                            <div className="h-4 bg-paper-grey w-5/6 relative overflow-hidden"><div className="absolute inset-0 skeleton-shimmer" /></div>
                            <div className="h-4 bg-paper-grey w-4/6 relative overflow-hidden"><div className="absolute inset-0 skeleton-shimmer" /></div>
                            <div className="h-4 bg-paper-grey w-3/4 relative overflow-hidden"><div className="absolute inset-0 skeleton-shimmer" /></div>
                            <div className="h-4 bg-paper-grey w-2/3 relative overflow-hidden"><div className="absolute inset-0 skeleton-shimmer" /></div>
                        </div>
                    ) : summaryError ? (
                        <div className="flex flex-col items-center gap-3 py-4 animate-fade-in-up opacity-0" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
                            <span className="material-symbols-outlined text-3xl text-alert">warning</span>
                            <p className="font-mono text-sm text-ink/60 text-center">{summaryError}</p>
                            <button
                                onClick={() => { lastFetchedModeRef.current = null; if (isAuthenticated) fetchSummary(summaryMode) }}
                                className="px-4 py-2 bg-primary border-3 border-ink shadow-hard font-bold text-sm hover:shadow-hard-hover hover:-translate-y-1 transition-all"
                            >
                                RETRY
                            </button>
                        </div>
                    ) : summary ? (
                        <div className="font-mono text-sm leading-relaxed border-l-4 border-primary pl-4 whitespace-pre-wrap animate-fade-in-up opacity-0" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
                            {summary}
                        </div>
                    ) : (
                        <p className="font-mono text-sm text-ink/50 italic">
                            AI summary pending. Sign in to generate an on-demand brief.
                        </p>
                    )}
                </div>

                {/* Jargon Toggle */}
                {jargon.length > 0 && (
                    <div className="mb-10">
                        <button
                            onClick={() => setShowJargon(!showJargon)}
                            className="flex items-center gap-2 px-4 py-2 border-3 border-ink bg-highlight/20 shadow-hard-sm hover:bg-highlight/40 transition-colors font-bold text-sm"
                        >
                            <span className="material-symbols-outlined text-lg">dictionary</span>
                            JARGON DECODER ({jargon.length})
                            <span className="material-symbols-outlined text-lg">{showJargon ? 'expand_less' : 'expand_more'}</span>
                        </button>

                        {showJargon && (
                            <div className="mt-4 border-3 border-ink bg-white shadow-hard divide-y-2 divide-ink/10">
                                {jargon.map((term, i) => (
                                    <div key={i} className="p-4 hover:bg-primary/10 transition-colors">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-lg">{term.term}</span>
                                            <span className="text-[10px] font-mono bg-ink/10 px-1 py-0.5 uppercase">{term.difficulty}</span>
                                        </div>
                                        <p className="font-mono text-sm text-ink/70">{term.definition}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Featured Image */}
                {article.image_url && (
                    <figure className="relative w-[110%] -ml-[5%] mb-12 group">
                        <div className="relative border-3 border-ink bg-alert shadow-hard overflow-hidden">
                            <img
                                src={article.image_url}
                                alt={article.title}
                                className="w-full h-auto object-cover aspect-video riso-image opacity-90"
                            />
                            <div className="absolute inset-0 bg-primary mix-blend-color opacity-20" />
                        </div>
                        <figcaption className="mt-3 font-mono text-xs uppercase tracking-wider text-right text-gray-500">
                            // Image: {article.source_name || 'Source'}
                        </figcaption>
                    </figure>
                )}

                {/* Main Body Text */}
                <div className="font-serif text-xl leading-relaxed space-y-6 text-[#2a2a2a]">
                    {(() => {
                        const raw = article.content || ''
                        // Strip HTML tags and decode basic entities
                        const stripped = raw
                            .replace(/<br\s*\/?>/gi, '\n')
                            .replace(/<\/p>/gi, '\n\n')
                            .replace(/<\/?(p|div|section|article|blockquote|h[1-6])[^>]*>/gi, '\n\n')
                            .replace(/<a[^>]*>(.*?)<\/a>/gi, '$1')
                            .replace(/<[^>]+>/g, '')
                            .replace(/&amp;/g, '&')
                            .replace(/&lt;/g, '<')
                            .replace(/&gt;/g, '>')
                            .replace(/&quot;/g, '"')
                            .replace(/&#039;|&apos;/g, "'")
                            .replace(/&nbsp;/g, ' ')
                        // Split into paragraphs, filter empty
                        const paragraphs = stripped
                            .split(/\n{2,}/)
                            .map(p => p.trim())
                            .filter(p => p.length > 0)
                        // Add drop cap to first paragraph
                        return paragraphs.map((text, i) => (
                            <p key={i} className={i === 0 ? 'first-letter:text-5xl first-letter:font-display first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:mt-1 first-letter:leading-none' : ''}>
                                {text}
                            </p>
                        ))
                    })()}
                </div>

                {/* Footer */}
                <div className="mt-20 pt-10 border-t-3 border-dashed border-gray-300">
                    <Link href="/dashboard" className="group cursor-pointer border-3 border-ink bg-white p-6 shadow-hard hover:shadow-hard-hover hover:-translate-y-1 transition-all flex items-center justify-between">
                        <div>
                            <p className="font-mono text-sm uppercase text-gray-500 mb-2">Continue Reading</p>
                            <h3 className="font-display font-bold text-2xl group-hover:text-alert transition-colors">
                                Back to NUTSHELL
                            </h3>
                        </div>
                        <span className="material-symbols-outlined text-3xl">arrow_forward</span>
                    </Link>
                </div>
            </article>
        </div>
    )
}
