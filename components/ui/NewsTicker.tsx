'use client'

import { useState, useEffect } from 'react'

interface TickerHeadline {
    id: string
    title: string
    category: string
}

interface NewsTickerProps {
    headlines?: TickerHeadline[]
}

export function NewsTicker({ headlines: propHeadlines }: NewsTickerProps) {
    const [headlines, setHeadlines] = useState<TickerHeadline[]>(propHeadlines || [])

    useEffect(() => {
        if (propHeadlines && propHeadlines.length > 0) {
            setHeadlines(propHeadlines)
            return
        }

        const fetchHeadlines = async () => {
            try {
                const res = await fetch(`/api/news?page_size=10`, {
                    cache: 'no-store'
                })
                if (res.ok) {
                    const data = await res.json()
                    const items = (data.items || []).map((item: any) => ({
                        id: item.id,
                        title: item.title,
                        category: item.category,
                    }))
                    if (items.length > 0) setHeadlines(items)
                }
            } catch {
                // Use fallback headlines
            }
        }

        fetchHeadlines()
    }, [propHeadlines])

    const fallbackItems = [
        'AI news engine active',
        'All feeds operational',
        'Deep mode reveals more detail',
    ]

    const tickerItems = headlines.length > 0
        ? [...headlines, ...headlines]
        : []

    return (
        <div className="h-10 border-b-2 border-ink bg-ink text-canvas flex items-stretch overflow-hidden whitespace-nowrap relative z-10">
            {/* Fixed masthead flag */}
            <div className="shrink-0 flex items-center gap-2 px-4 bg-secondary text-ink border-r-2 border-ink">
                <span className="w-1.5 h-1.5 rounded-full bg-ink animate-pulse" />
                <span className="font-mono text-[11px] font-bold tracking-[0.2em] uppercase">Stop Press</span>
            </div>
            <div className="flex-1 flex items-center overflow-hidden">
                <div className="animate-marquee font-mono text-sm flex gap-10 items-center min-w-max pl-6">
                    {tickerItems.length > 0 ? (
                        tickerItems.map((headline, i) => (
                            <span key={`${headline.id}-${i}`} className="inline-flex items-center gap-2">
                                <span className="text-secondary font-bold">✦</span>
                                <span className="uppercase text-canvas/50 text-xs tracking-wider">{headline.category}</span>
                                <span className="text-canvas/90">{headline.title}</span>
                            </span>
                        ))
                    ) : (
                        [...fallbackItems, ...fallbackItems].map((item, i) => (
                            <span key={i} className="inline-flex items-center gap-2">
                                <span className="text-secondary font-bold">✦</span>
                                <span className="text-canvas/80">{item}</span>
                            </span>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
