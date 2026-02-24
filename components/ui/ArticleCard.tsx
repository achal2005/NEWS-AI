'use client'

import Link from 'next/link'

interface ArticleCardProps {
    id: string
    title: string
    category: string
    published_at: string
    veracity_score?: number
    summary?: string
    index?: number
    isAuthenticated?: boolean
}

export function ArticleCard({
    id,
    title,
    category,
    published_at,
    veracity_score,
    summary,
    index = 0,
    isAuthenticated = false,
}: ArticleCardProps) {
    const isFeature = index < 2

    let formattedDate = ''
    try {
        const d = new Date(published_at)
        if (!isNaN(d.getTime())) {
            formattedDate = d.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            })
        }
    } catch {
        // leave as empty string
    }

    return (
        <div className="h-full group">
            <Link href={`/article/${id}`} className="block h-full">
                <article className={`h-full flex flex-col ${isFeature ? 'mb-8' : ''}`}>
                    {isFeature && (
                        <div className="mb-4 overflow-hidden border-b-2 border-[var(--ink)] pb-1">
                            <div className="bg-[var(--paper-sunken)] h-48 w-full flex items-center justify-center relative group-hover:opacity-90 transition-opacity">
                                <span className="font-serif text-6xl opacity-10 text-[var(--ink)]">Newspaper Mode</span>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 flex flex-col">
                        {/* Top Meta */}
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest border-b border-[var(--accent)] text-[var(--accent)] pb-0.5">
                                {category}
                            </span>

                        </div>

                        {/* Title - Newspaper Headline Style */}
                        <h3
                            className={`font-serif font-bold leading-tight mb-3 group-hover:text-[var(--accent)] transition-colors ${isFeature ? 'text-3xl' : 'text-xl'
                                }`}
                            style={{ color: 'var(--ink)' }}
                        >
                            {title}
                        </h3>

                        {/* Summary */}
                        {summary && (
                            <p
                                className="font-serif text-sm leading-relaxed mb-4 line-clamp-3 text-justify"
                                style={{ color: 'var(--ink-light)' }}
                            >
                                {summary}
                            </p>
                        )}

                        <div className="mt-auto pt-3 border-t border-[var(--border)] flex items-center justify-between">
                            <span className="text-xs font-medium italic text-[var(--ink-muted)]">
                                {formattedDate}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] group-hover:underline">
                                Read Article
                            </span>
                        </div>
                    </div>
                </article>
            </Link>
        </div>
    )
}
