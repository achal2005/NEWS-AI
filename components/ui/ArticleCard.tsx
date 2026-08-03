'use client'

import Link from 'next/link'
import Image from 'next/image'

interface ArticleCardProps {
    article: {
        id: string
        title: string
        category: string
        published_at: string
        source_name: string
        image_url?: string | null
        content?: string
    }
    index?: number
    size?: 'normal' | 'featured' | 'tall' | 'wide'
}

export function ArticleCard({ article, index = 0, size = 'normal' }: ArticleCardProps) {
    // Deterministic ink-block card: every 5th card (starting at index 4)
    const isDark = index % 5 === 4
    const isFeatured = size === 'featured'
    const showImage = (size === 'featured' || size === 'tall' || size === 'wide') && article.image_url

    const dateLabel = article.published_at
        ? new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'Recent'

    return (
        <Link
            href={`/article/${article.id}`}
            className={`brutal-card border-2 border-ink flex flex-col h-full group relative overflow-hidden animate-fade-in-up opacity-0 transition-all shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-hover ${isDark ? 'bg-ink text-canvas' : 'bg-surface text-ink'
                }`}
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
        >
            {/* Image */}
            {showImage && (
                <div className={`${isFeatured ? 'h-[240px]' : size === 'wide' ? 'h-[180px]' : 'h-[160px]'} w-full border-b-2 border-ink overflow-hidden bg-paper-accent relative shrink-0`}>
                    <div className="absolute inset-0 bg-primary opacity-[0.18] mix-blend-multiply z-10 pointer-events-none" />
                    <Image
                        src={article.image_url!}
                        alt={article.title}
                        fill
                        sizes={isFeatured ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 25vw'}
                        className="object-cover riso-image group-hover:scale-[1.04] transition-transform duration-500"
                        loading="lazy"
                        placeholder="empty"
                    />
                    {isFeatured && (
                        <span className="absolute top-3 left-3 z-20 font-mono text-[10px] font-bold tracking-widest uppercase bg-secondary text-ink border-2 border-ink px-2 py-0.5">
                            Top Story
                        </span>
                    )}
                </div>
            )}

            {/* Meta row */}
            <div className="flex items-center gap-2 px-4 sm:px-5 pt-4">
                <span className={`font-mono text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 border-2 ${isDark ? 'bg-secondary text-ink border-secondary' : 'bg-primary text-canvas border-ink'}`}>
                    {article.category?.toUpperCase() || 'NEWS'}
                </span>
                <span className={`font-mono text-[10px] tracking-wide truncate ${isDark ? 'text-canvas/50' : 'text-ink/50'}`}>
                    {article.source_name || 'Source'}
                </span>
            </div>

            {/* Headline */}
            <div className="flex-1 px-4 sm:px-5 pt-2">
                <h3 className={`font-display font-black leading-[1.02] tracking-tight ${isFeatured ? 'text-2xl sm:text-3xl md:text-4xl' : size === 'wide' || size === 'tall' ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
                    }`}>
                    <span className="bg-[length:100%_2px] bg-no-repeat bg-bottom bg-gradient-to-r from-secondary to-secondary [background-size:0%_2px] group-hover:[background-size:100%_2px] transition-[background-size] duration-300">
                        {article.title}
                    </span>
                </h3>
                {(isFeatured || size === 'wide') && article.content && (
                    <p className={`mt-2 font-sans text-sm leading-relaxed line-clamp-2 ${isDark ? 'text-canvas/60' : 'text-ink/55'}`}>
                        {article.content.substring(0, 150)}…
                    </p>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-5 py-3 mt-3 flex items-center justify-between border-t-2 border-dashed border-current/20">
                <span className={`font-mono text-[10px] font-bold tracking-widest uppercase ${isDark ? 'text-canvas/50' : 'text-ink/45'}`}>
                    {dateLabel}
                </span>
                <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold tracking-widest uppercase transition-colors ${isDark ? 'text-canvas/70 group-hover:text-secondary' : 'text-ink/60 group-hover:text-primary'}`}>
                    Read
                    <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-0.5">arrow_forward</span>
                </span>
            </div>
        </Link>
    )
}
