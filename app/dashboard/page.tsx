'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, LogIn } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { ArticleCard } from '@/components/ui/ArticleCard'
import { NewspaperLoader } from '@/components/ui/NewspaperLoader'

interface Article {
    id: string
    title: string
    category: string
    published_at: string
    veracity_score?: number
    summaries: Array<{ mode: string; summary: string }>
}

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth()
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(true)
    const [summaryMode, setSummaryMode] = useState<'kid' | 'pro'>('pro')
    const [error, setError] = useState<string | null>(null)
    const [dateString, setDateString] = useState('')

    useEffect(() => {
        setDateString(new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        }))
    }, [])

    useEffect(() => {
        fetchArticles()
    }, [isAuthenticated])

    const fetchArticles = async () => {
        setLoading(true)
        setError(null)

        try {
            const headers: Record<string, string> = {}
            const token = localStorage.getItem('token')
            if (token) {
                headers['Authorization'] = `Bearer ${token}`
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const timestamp = new Date().getTime();
            const res = await fetch(`${apiUrl}/api/news?page_size=20&t=${timestamp}`, {
                headers,
                cache: 'no-store'
            })

            if (!res.ok) {
                throw new Error('Failed to fetch articles')
            }

            const data = await res.json()
            const validArticles = (data.items || []).filter(
                (a: any) => a && a.id && a.title
            )
            setArticles(validArticles)
        } catch (err) {
            console.error(err)
            setError('Unable to load articles.')
            setArticles([])
        } finally {
            setLoading(false)
        }
    }

    const getSummary = (article: Article) => {
        const s = article.summaries?.find((s) => s.mode === summaryMode)
        return s?.summary
    }

    if (!dateString) return null;

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="px-gutter py-12 md:py-20 text-center max-w-reading mx-auto border-b-4 border-double border-[var(--ink)] mb-12">
                <div>
                    {/* Dateline */}
                    <div className="flex items-center justify-between border-t border-b border-[var(--ink)] py-2 mb-8">
                        <p className="text-xs font-bold uppercase tracking-widest">
                            Vol. CCIX, No. 42
                        </p>
                        <p className="text-xs font-serif italic text-[var(--ink)]">
                            {dateString}
                        </p>
                        <p className="text-xs font-bold uppercase tracking-widest">
                            $2.00
                        </p>
                    </div>

                    <h1
                        className="font-serif text-6xl md:text-8xl font-black mb-6 tracking-tight leading-none"
                        style={{ color: 'var(--ink)' }}
                    >
                        THE DAILY BRIEF
                    </h1>

                    <p
                        className="text-xl font-serif italic max-w-2xl mx-auto mb-10"
                        style={{ color: 'var(--ink-light)' }}
                    >
                        &quot;All the News That&apos;s Fit to Print, Summarized by AI&quot;
                    </p>

                    {/* Mode Toggle */}
                    <div className="inline-flex border border-[var(--ink)] mb-8">
                        <button
                            onClick={() => setSummaryMode('kid')}
                            className="px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-200"
                            style={{
                                backgroundColor: summaryMode === 'kid' ? 'var(--ink)' : 'transparent',
                                color: summaryMode === 'kid' ? 'var(--paper)' : 'var(--ink)',
                            }}
                        >
                            🎈 Kid Mode
                        </button>
                        <button
                            onClick={() => setSummaryMode('pro')}
                            className="px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all duration-200"
                            style={{
                                backgroundColor: summaryMode === 'pro' ? 'var(--ink)' : 'transparent',
                                color: summaryMode === 'pro' ? 'var(--paper)' : 'var(--ink)',
                            }}
                        >
                            🎯 Pro Mode
                        </button>
                    </div>

                    {/* Login CTA for unauthenticated */}
                    {!authLoading && !isAuthenticated && (
                        <div className="mb-8">
                            <Link href="/login" className="btn-primary inline-flex">
                                <LogIn className="w-4 h-4" />
                                Sign In to Personalize
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Articles Section */}
            <section className="px-gutter pb-12 max-w-[1400px] mx-auto">
                <div className="flex items-center justify-between mb-8 pb-2 border-b border-[var(--ink)]">
                    <h2 className="font-serif text-3xl font-bold uppercase tracking-wide">
                        Top Stories
                    </h2>
                    <button
                        onClick={fetchArticles}
                        className="text-xs font-bold uppercase underline hover:text-[var(--accent)]"
                    >
                        Refresh Edition
                    </button>
                </div>

                {loading ? (
                    <NewspaperLoader />
                ) : error ? (
                    <div className="text-center py-20 border border-dashed border-[var(--ink-muted)] p-8">
                        <p className="font-serif text-2xl mb-3" style={{ color: 'var(--ink)' }}>
                            No Dispatches Yet
                        </p>
                        <p className="text-sm mb-8" style={{ color: 'var(--ink-muted)' }}>
                            {error}
                        </p>
                        <button onClick={fetchArticles} className="btn-primary">
                            Try Again
                        </button>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-[var(--ink-muted)] p-8">
                        <p className="font-serif text-2xl mb-3" style={{ color: 'var(--ink)' }}>
                            The Presses Are Warming Up
                        </p>
                        <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
                            Check back soon for fresh intelligence.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-12">
                        {/* Lead Story */}
                        {articles.length > 0 && (
                            <div className="md:col-span-8 border-r border-[#e5e5e5] pr-6">
                                <ArticleCard
                                    {...articles[0]}
                                    summary={getSummary(articles[0])}
                                    index={0}
                                    isAuthenticated={isAuthenticated}
                                />
                            </div>
                        )}

                        {/* Second Feature */}
                        {articles.length > 1 && (
                            <div className="md:col-span-4">
                                <ArticleCard
                                    {...articles[1]}
                                    summary={getSummary(articles[1])}
                                    index={1}
                                    isAuthenticated={isAuthenticated}
                                />
                            </div>
                        )}

                        {/* Divider */}
                        <div className="md:col-span-12 h-px bg-[var(--ink)] my-2 opacity-20" />

                        {/* Remaining Articles */}
                        {articles.slice(2).map((article, index) => (
                            <div key={article.id} className="md:col-span-4 border-r border-[#e5e5e5] last:border-0 pr-4">
                                <ArticleCard
                                    {...article}
                                    summary={getSummary(article)}
                                    index={index + 2}
                                    isAuthenticated={isAuthenticated}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Stats Footer */}
            {articles.length > 0 && (
                <section className="px-gutter py-16 max-w-editorial mx-auto border-t-2 border-[var(--ink)] mt-12">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <p className="font-serif text-4xl font-black mb-1" style={{ color: 'var(--ink)' }}>
                                {articles.length}
                            </p>
                            <p className="text-xs uppercase tracking-widest font-bold" style={{ color: 'var(--ink-muted)' }}>
                                Articles Printed
                            </p>
                        </div>
                        <div>
                            <p className="font-serif text-4xl font-black mb-1" style={{ color: 'var(--ink)' }}>
                                3
                            </p>
                            <p className="text-xs uppercase tracking-widest font-bold" style={{ color: 'var(--ink-muted)' }}>
                                Verified Sources
                            </p>
                        </div>
                        <div>
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <Sparkles className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                            </div>
                            <p className="text-xs uppercase tracking-widest font-bold" style={{ color: 'var(--ink-muted)' }}>
                                Gemini Powered
                            </p>
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}
