'use client'

import Link from 'next/link'

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
    // Deterministic dark card: every 5th card (starting from index 4)
    const isDark = index % 5 === 4

    const showImage = (size === 'featured' || size === 'tall' || size === 'wide') && article.image_url

    return (
        <Link
            href={`/article/${article.id}`}
            className={`brutal-card border-3 border-ink flex flex-col justify-between h-full group transition-all animate-fade-in-up opacity-0 relative overflow-hidden ${isDark ? 'bg-ink text-white' : 'bg-white text-ink shadow-hard hover:-translate-y-1 hover:shadow-hard-hover'
                }`}
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
        >
            {/* Image (only for featured/tall/wide cards) */}
            {showImage && (
                <div className={`${size === 'featured' ? 'h-[240px]' : size === 'wide' ? 'h-[180px]' : 'h-[160px]'} w-full border-b-3 border-ink overflow-hidden bg-gray-200 relative shrink-0`}>
                    <div className="absolute inset-0 bg-primary opacity-20 mix-blend-multiply z-10 pointer-events-none" />
                    <img
                        src={article.image_url!}
                        alt={article.title}
                        className="w-full h-full object-cover riso-image group-hover:scale-105 transition-transform duration-500"
                    />
                </div>
            )}

            <div className="flex-1 p-5 relative z-10">
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`text-xs font-bold px-2 py-0.5 border-2 ${isDark ? 'bg-primary text-ink border-primary' : 'bg-ink text-white border-ink'}`}>
                        {article.category?.toUpperCase() || 'NEWS'}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 border-2 ${isDark ? 'border-zinc-700 bg-zinc-800' : 'border-ink bg-white'}`}>
                        {article.source_name || 'SOURCE'}
                    </span>
                    {size === 'featured' && (
                        <span className="text-xs font-bold bg-primary border-2 border-ink px-2 py-0.5 shadow-hard-sm text-ink">
                            TOP STORY
                        </span>
                    )}
                </div>
                <h3 className={`font-display font-bold leading-tight mb-3 group-hover:underline decoration-3 decoration-primary underline-offset-4 ${size === 'featured' ? 'text-3xl md:text-4xl' : size === 'wide' || size === 'tall' ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'
                    }`}>
                    {article.title}
                </h3>
                {/* Show excerpt for featured/wide cards */}
                {(size === 'featured' || size === 'wide') && article.content && (
                    <p className={`font-mono text-sm leading-relaxed line-clamp-2 ${isDark ? 'text-zinc-300' : 'text-gray-600'}`}>
                        {article.content.substring(0, 150)}...
                    </p>
                )}
            </div>

            <div className={`px-5 pb-4 mt-auto flex justify-between items-end relative z-10`}>
                <span className={`font-mono text-[10px] font-bold tracking-widest uppercase ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
                    {article.published_at ? new Date(article.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'RECENT'}
                </span>

                {/* Arrow identifier */}
                <div className={`size-8 flex items-center justify-center border-2 rounded-full transition-transform group-hover:bg-primary group-hover:text-ink group-hover:border-primary group-hover:rotate-45 ${isDark ? 'border-zinc-700' : 'border-ink'}`}>
                    <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                </div>
            </div>

            {/* Universal Hover Overlay for "READ NOW" */}
            <div className="absolute inset-0 bg-ink/5 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 flex items-center justify-center pointer-events-none">
                <span className={`text-ink border-3 border-ink shadow-hard font-black px-6 py-3 flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ${isDark ? 'bg-canvas' : 'bg-primary'}`}>
                    READ NOW
                    <span className="material-symbols-outlined text-xl">electric_bolt</span>
                </span>
            </div>
        </Link>
    )
}
