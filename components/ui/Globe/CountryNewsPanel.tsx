'use client'

import { useState, useEffect } from 'react'
import type { CountryMarker } from './GlobeScene'

interface NewsArticle {
    title: string
    description: string | null
    url: string
    source: string
    publishedAt: string
    image: string | null
}

/* ═══════════════════════════════════════════════════════════════
   GOOGLE NEWS RSS — fetched via server-side API route
   (no CORS issues, no API key needed)
   ═══════════════════════════════════════════════════════════════ */

function stripHtml(html: string): string {
    if (typeof document !== 'undefined') {
        const div = document.createElement('div')
        div.innerHTML = html
        return div.textContent || div.innerText || ''
    }
    return html.replace(/<[^>]*>/g, '')
}

export default function CountryNewsPanel({
    country, isOpen, onClose,
}: {
    country: CountryMarker | null; isOpen: boolean; onClose: () => void
}) {
    const [news, setNews] = useState<NewsArticle[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [source, setSource] = useState<'live' | 'fallback'>('live')

    useEffect(() => {
        if (!country || !isOpen) return

        const fetchNews = async () => {
            setLoading(true)
            setError(null)
            setSource('live')

            try {
                // Fetch from our own server-side API proxy (no CORS issues)
                const res = await fetch(
                    `/api/globe-news?country=${country.code}&name=${encodeURIComponent(country.name)}`,
                    { signal: AbortSignal.timeout(15000) }
                )

                if (res.ok) {
                    const data = await res.json()
                    if (data.status === 'ok' && data.articles?.length > 0) {
                        setNews(data.articles.map((a: any) => ({
                            title: stripHtml(a.title || ''),
                            description: stripHtml(a.description || '').slice(0, 220),
                            url: a.link || '#',
                            source: a.source || 'Google News',
                            publishedAt: a.pubDate || new Date().toISOString(),
                            image: null,
                        })))
                        setLoading(false)
                        return
                    }
                }

                throw new Error('No articles returned')
            } catch (err) {
                setSource('fallback')
                setNews(generateFallbackNews(country))
            } finally {
                setLoading(false)
            }
        }

        fetchNews()
    }, [country, isOpen])

    const formatTime = (d: string) => {
        try {
            const h = Math.floor((Date.now() - new Date(d).getTime()) / 3600000)
            if (h < 0 || isNaN(h)) return 'Recent'
            return h < 1 ? 'Just now' : h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`
        } catch { return 'Recent' }
    }

    if (!country) return null

    return (
        <div className={`fixed top-0 right-0 h-full w-full sm:w-[440px] z-50 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            style={{ backgroundColor: '#F2F2F2', borderLeft: '3px solid #000000', boxShadow: '-8px 0px 0px #000000' }}>

            {/* Header */}
            <div className="p-4 md:p-5 border-b-[3px] border-[#000000] relative" style={{ backgroundColor: '#000000' }}>
                <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
                    style={{ backgroundImage: 'radial-gradient(#00AAEE 1px, transparent 0)', backgroundSize: '4px 4px' }} />
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                        <div className="border-[2px] border-[#00AAEE] px-2 py-0.5" style={{ backgroundColor: '#00AAEE' }}>
                            <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#000000]">
                                {source === 'live' ? 'LIVE NEWS // GOOGLE' : 'DEMO MODE'}
                            </span>
                        </div>
                        <button onClick={onClose}
                            className="w-8 h-8 border-[3px] border-[#000000] flex items-center justify-center transition-all hover:translate-x-[2px] hover:translate-y-[2px]"
                            style={{ backgroundColor: '#00AAEE', boxShadow: '3px 3px 0px rgba(204,255,0,0.3)' }}>
                            <span className="material-symbols-outlined text-lg text-[#000000]">close</span>
                        </button>
                    </div>
                    <h2 className="font-black text-2xl sm:text-3xl uppercase tracking-tight" style={{ color: '#F2F2F2' }}>
                        {country.name}
                    </h2>
                    <p className="font-mono text-[10px] mt-1 tracking-wider uppercase" style={{ color: '#00AAEE' }}>
                        {source === 'live' ? `Top stories from ${country.name}` : `Country Code: ${country.code.toUpperCase()} // Sample Data`}
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2.5">
                {source === 'fallback' && (
                    <div className="border-[2px] border-[#000000] p-2.5 mb-1" style={{ backgroundColor: '#00AAEE' }}>
                        <p className="font-mono text-[10px] text-[#000000] font-bold uppercase tracking-wider">
                            ⚡ DEMO MODE — Could not reach Google News. Showing sample data.
                        </p>
                    </div>
                )}

                {loading ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="border-[3px] border-[#000000] p-3 animate-pulse" style={{ backgroundColor: '#F2F2F2', boxShadow: '4px 4px 0px #000000' }}>
                        <div className="h-3 bg-[#000000]/10 w-1/4 mb-2" /><div className="h-4 bg-[#000000]/15 w-full mb-1.5" />
                        <div className="h-4 bg-[#000000]/15 w-3/4 mb-2" /><div className="h-3 bg-[#000000]/10 w-1/3" />
                    </div>
                )) : news.map((article, idx) => (
                    <a key={idx}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block border-[3px] border-[#000000] p-3 transition-all group relative cursor-pointer hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#000000]"
                        style={{ backgroundColor: '#F2F2F2', boxShadow: '4px 4px 0px #000000' }}>
                        <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
                            style={{ backgroundImage: 'radial-gradient(#000000 1px, transparent 0)', backgroundSize: '4px 4px' }} />
                        <div className="relative z-10">
                            {/* Meta */}
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="w-2 h-2" style={{ backgroundColor: '#00AAEE', border: '1px solid #000000' }} />
                                <span className="font-mono text-[9px] font-bold text-[#000000]/50 uppercase tracking-wider truncate max-w-[160px]">
                                    {article.source}
                                </span>
                                <span className="font-mono text-[9px] text-[#000000]/30">•</span>
                                <span className="font-mono text-[9px] text-[#000000]/40 shrink-0">{formatTime(article.publishedAt)}</span>
                            </div>

                            {/* Title */}
                            <h3 className="font-bold text-sm leading-snug mb-1.5 group-hover:text-[#EA8C21] transition-colors">
                                {article.title}
                            </h3>

                            {/* Description */}
                            {article.description && article.description.length > 10 && (
                                <p className="font-mono text-[11px] text-[#000000]/55 leading-relaxed line-clamp-2">
                                    {article.description}
                                </p>
                            )}

                            {/* Read link */}
                            <div className="mt-2 flex items-center justify-between">
                                <div className="flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-wider opacity-60 group-hover:opacity-100 transition-opacity"
                                    style={{ color: '#EA8C21' }}>
                                    <span>READ ARTICLE →</span>
                                </div>
                                <span className="material-symbols-outlined text-xs text-[#000000]/30 group-hover:text-[#EA8C21] transition-colors">open_in_new</span>
                            </div>
                        </div>
                    </a>
                ))}
            </div>

            {/* Footer */}
            <div className="p-2.5 border-t-[3px] border-[#000000]" style={{ backgroundColor: '#000000' }}>
                <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: '#F2F2F2' }}>
                        {news.length} ARTICLES // {source === 'live' ? 'GOOGLE_NEWS' : 'DEMO'}
                    </span>
                    <div className="px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider border-[2px] border-[#000000]"
                        style={{ backgroundColor: '#00AAEE', color: '#000000' }}>
                        {country.code.toUpperCase()}
                    </div>
                </div>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════════
   FALLBACK — only used if Google News RSS fails
   ═══════════════════════════════════════════════════════════════ */
function generateFallbackNews(country: CountryMarker): NewsArticle[] {
    const topics = [
        { title: `${country.name} Leads New Technology Initiative`, desc: `${country.name} has announced a major push in AI and technology development.` },
        { title: `Economic Growth Surges in ${country.name}`, desc: `New data shows ${country.name}'s GDP growing faster than expected.` },
        { title: `${country.name} Signs Historic Climate Agreement`, desc: `${country.name} committed to ambitious carbon reduction targets.` },
        { title: `Sports: ${country.name} Celebrates Victory`, desc: `National team brings home gold in international competition.` },
        { title: `Healthcare Reform in ${country.name}`, desc: `New reforms aim to improve access and reduce costs for millions.` },
    ]
    const now = new Date()
    return topics.map((t, i) => ({
        title: t.title, description: t.desc, url: `https://news.google.com/search?q=${encodeURIComponent(country.name + ' news')}`,
        source: `${country.name} Wire`, publishedAt: new Date(now.getTime() - i * 3600000).toISOString(), image: null,
    }))
}
