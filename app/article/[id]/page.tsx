'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles, BookOpen, Share2, ExternalLink } from 'lucide-react'
import TruthMeter, { TruthMeterBadge } from '@/components/TruthMeter'
import { ModeSwitch } from '@/components/SummaryModeToggle'
import { TypewriterText } from '@/components/ui/TypewriterText'
// import { AskEditor } from '@/components/ui/AskEditor'

interface ArticleDetail {
    id: string
    title: string
    content: string
    category: string
    published_at: string
    source_url: string
    source_name?: string | null
    image_url?: string | null
    veracity_score?: number | null
    veracity_claims?: Array<{ text: string; rating: string }> | null
    jargon: Array<{ term: string; definition: string; difficulty: string }>
}

interface Summary {
    mode: string
    summary: string
    generated_at: string
}

export default function ArticlePage() {
    const params = useParams()
    const [article, setArticle] = useState<ArticleDetail | null>(null)
    const [summary, setSummary] = useState<Summary | null>(null)
    const [summaryMode, setSummaryMode] = useState<'kid' | 'pro'>('pro')
    const [loading, setLoading] = useState(true)
    const [loadingSummary, setLoadingSummary] = useState(false)
    const [summaryKey, setSummaryKey] = useState(0)

    // Reading time tracking
    const startTimeRef = useRef<number>(Date.now())
    const [readingSeconds, setReadingSeconds] = useState(0)

    useEffect(() => {
        fetchArticle()
        startTimeRef.current = Date.now()

        const interval = setInterval(() => {
            setReadingSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
        }, 10000)

        return () => {
            clearInterval(interval)
            const finalSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000)
            if (finalSeconds >= 10 && article?.id) {
                recordReadingTime(finalSeconds)
            }
        }
    }, [params.id])

    useEffect(() => {
        if (article) {
            fetchSummary()
        }
    }, [article, summaryMode])

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const recordReadingTime = async (seconds: number) => {
        try {
            await fetch(`${apiUrl}/api/user/reading-time`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ article_id: article?.id, seconds })
            })
        } catch (error) {
            console.log('Reading time tracking failed')
        }
    }

    const fetchArticle = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/news/${params.id}`)
            if (!res.ok) throw new Error('Failed to fetch article')
            const data = await res.json()
            setArticle(data)
        } catch (error) {
            console.error(error)
            setArticle(null) // Show 404 state instead of fake data
        } finally {
            setLoading(false)
        }
    }

    const fetchSummary = async () => {
        if (!article) return
        setLoadingSummary(true)

        try {
            const res = await fetch(
                `${apiUrl}/api/news/${article.id}/summary?mode=${summaryMode}`
            )
            const data = await res.json()
            setSummary(data)
            setSummaryKey(prev => prev + 1)
        } catch (error) {
            console.error('Failed to fetch summary:', error)
            setSummary(null)
        } finally {
            setLoadingSummary(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen p-gutter">
                <div className="max-w-reading mx-auto py-12 animate-pulse">
                    <div className="h-3 rounded w-20 mb-6" style={{ backgroundColor: 'var(--paper-sunken)' }} />
                    <div className="h-10 rounded w-4/5 mb-4" style={{ backgroundColor: 'var(--paper-sunken)' }} />
                    <div className="h-10 rounded w-3/5 mb-8" style={{ backgroundColor: 'var(--paper-sunken)' }} />
                    <div className="space-y-3">
                        <div className="h-4 rounded w-full" style={{ backgroundColor: 'var(--paper-sunken)' }} />
                        <div className="h-4 rounded w-full" style={{ backgroundColor: 'var(--paper-sunken)' }} />
                        <div className="h-4 rounded w-2/3" style={{ backgroundColor: 'var(--paper-sunken)' }} />
                    </div>
                </div>
            </div>
        )
    }

    if (!article) {
        return (
            <div className="min-h-screen p-gutter flex items-center justify-center">
                <div className="text-center">
                    <h1 className="font-serif text-2xl mb-4" style={{ color: 'var(--ink)' }}>Article not found</h1>
                    <Link href="/" className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                        Return to the front page →
                    </Link>
                </div>
            </div>
        )
    }

    const formattedDate = (() => {
        try {
            if (!article.published_at) return new Date().toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
            const d = new Date(article.published_at);
            if (isNaN(d.getTime())) return 'Recently Published';
            return d.toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
        } catch {
            return 'Recently Published';
        }
    })();

    return (
        <div className="min-h-screen">
            {/* Sticky nav */}
            <nav
                className="sticky top-0 z-40 px-gutter py-3"
                style={{
                    backgroundColor: 'var(--paper)',
                    borderBottom: '1px solid var(--border)',
                }}
            >
                <div className="max-w-reading mx-auto flex items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm font-medium transition-colors"
                        style={{ color: 'var(--ink-muted)' }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>
                    <div className="flex items-center gap-3">
                        <TruthMeterBadge score={article.veracity_score} />
                        <button
                            className="p-2 rounded-sm transition-colors"
                            style={{ color: 'var(--ink-muted)' }}
                            onClick={() => navigator.clipboard?.writeText(window.location.href)}
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </nav>

            <article className="px-gutter py-12">
                <div className="max-w-reading mx-auto">
                    {/* Header */}
                    <motion.header
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Category + Date */}
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <span className="category-tag">{article.category}</span>
                            <span className="text-xs font-medium" style={{ color: 'var(--ink-muted)' }}>
                                {formattedDate}
                            </span>
                            {readingSeconds > 0 && (
                                <span className="text-xs" style={{ color: 'var(--ink-faint)' }}>
                                    {Math.floor(readingSeconds / 60)}m {readingSeconds % 60}s read
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1
                            className="font-serif text-headline md:text-display !leading-[1.1] mb-6"
                            style={{ color: 'var(--ink)' }}
                        >
                            {article.title}
                        </h1>

                        {/* Hero image */}
                        {article.image_url && (
                            <div className="mb-8 overflow-hidden rounded-sm border border-[var(--border)]">
                                <img
                                    src={article.image_url}
                                    alt={article.title}
                                    className="w-full h-auto max-h-96 object-cover"
                                />
                            </div>
                        )}

                        {/* Source link */}
                        {article.source_url && (
                            <a
                                href={article.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="source-badge mb-8 inline-flex hover:border-[var(--accent)] transition-colors"
                            >
                                <ExternalLink className="w-3 h-3" />
                                {article.source_name || 'Original Source'}
                            </a>
                        )}
                    </motion.header>

                    <div className="editorial-rule-thick" />

                    {/* Veracity Check */}
                    <motion.section
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.5 }}
                        className="editorial-card p-6 mb-8"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-serif font-bold text-sm mb-1" style={{ color: 'var(--ink)' }}>
                                    Veracity Check
                                </h3>
                                <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                                    Powered by FactCheck API
                                </p>
                            </div>
                            <TruthMeter score={article.veracity_score} size="lg" />
                        </div>

                        {article.veracity_claims && article.veracity_claims.length > 0 && (
                            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                                <p className="text-xs mb-2" style={{ color: 'var(--ink-muted)' }}>Related Fact Checks:</p>
                                {article.veracity_claims.slice(0, 2).map((claim, idx) => (
                                    <div key={idx} className="text-sm mb-1" style={{ color: 'var(--ink-light)' }}>
                                        &ldquo;{claim.text}&rdquo; — <span style={{ color: 'var(--accent)' }}>{claim.rating}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.section>

                    {/* AI Summary with Typewriter */}
                    <motion.section
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.5 }}
                        className="editorial-card p-6 md:p-8 mb-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-9 h-9 flex items-center justify-center rounded-sm"
                                    style={{ backgroundColor: 'var(--accent)', color: 'var(--paper)' }}
                                >
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-serif font-bold text-sm" style={{ color: 'var(--ink)' }}>
                                        AI Summary
                                    </h3>
                                    <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                                        Gemini 2.0
                                    </p>
                                </div>
                            </div>
                            <ModeSwitch mode={summaryMode} onModeChange={setSummaryMode} />
                        </div>

                        {loadingSummary ? (
                            <div className="space-y-3 animate-pulse">
                                <div className="h-4 rounded w-full" style={{ backgroundColor: 'var(--paper-sunken)' }} />
                                <div className="h-4 rounded w-full" style={{ backgroundColor: 'var(--paper-sunken)' }} />
                                <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'var(--paper-sunken)' }} />
                            </div>
                        ) : summary ? (
                            <div className="leading-relaxed text-sm whitespace-pre-line" style={{ color: 'var(--ink-light)' }}>
                                <TypewriterText
                                    key={summaryKey}
                                    text={summary.summary}
                                    speed={10}
                                    delay={200}
                                />
                            </div>
                        ) : null}
                    </motion.section>

                    {/* Jargon Section */}
                    {article.jargon && article.jargon.length > 0 && (
                        <motion.section
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, duration: 0.5 }}
                            className="editorial-card p-6 md:p-8 mb-8"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <BookOpen className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                                <h3 className="font-serif font-bold" style={{ color: 'var(--ink)' }}>
                                    Key Terms
                                </h3>
                                <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                                    +5 pts each
                                </span>
                            </div>

                            <div className="space-y-3">
                                {article.jargon.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + index * 0.08 }}
                                        className="p-4 rounded-sm transition-colors cursor-pointer"
                                        style={{
                                            backgroundColor: 'var(--paper-sunken)',
                                            border: '1px solid var(--border)',
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="font-semibold text-sm" style={{ color: 'var(--accent)' }}>
                                                {item.term}
                                            </span>
                                            <span
                                                className="text-[0.65rem] px-2 py-0.5 rounded-sm uppercase tracking-wider font-semibold"
                                                style={{
                                                    backgroundColor: item.difficulty === 'basic' ? 'var(--success)' :
                                                        item.difficulty === 'intermediate' ? 'var(--warning)' : 'var(--danger)',
                                                    color: 'var(--paper)',
                                                }}
                                            >
                                                {item.difficulty}
                                            </span>
                                        </div>
                                        <p className="text-sm" style={{ color: 'var(--ink-light)' }}>
                                            {item.definition}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.section>
                    )}

                    {/* Full Article */}
                    <motion.section
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45, duration: 0.5 }}
                        className="editorial-card p-6 md:p-8 mb-8"
                    >
                        <h3 className="font-serif font-bold text-lg mb-6" style={{ color: 'var(--ink)' }}>
                            Full Article
                        </h3>
                        <div className="text-sm leading-[1.9] whitespace-pre-line" style={{ color: 'var(--ink-light)' }}>
                            {article.content || "No content available for this article. Please check back later."}
                        </div>
                        {article.source_url && (
                            <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
                                <a
                                    href={article.source_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-semibold inline-flex items-center gap-2 transition-colors"
                                    style={{ color: 'var(--accent)' }}
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    View original source
                                </a>
                            </div>
                        )}
                    </motion.section>

                    {/* Ask the Editor - Removed as per user request */}
                    {/* <motion.section
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.55, duration: 0.5 }}
                    >
                        <AskEditor
                            articleId={article.id}
                            articleTitle={article.title}
                            articleContent={article.content}
                        />
                    </motion.section> */}
                </div>
            </article>
        </div>
    )
}
