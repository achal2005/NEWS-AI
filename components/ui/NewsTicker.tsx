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
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news?page_size=10`, {
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
        '/// SYSTEM: AI NEWS ENGINE ACTIVE',
        '/// STATUS: ALL FEEDS OPERATIONAL',
        '/// TIP: DEEP MODE REVEALS MORE DETAILS',
    ]

    const tickerItems = headlines.length > 0
        ? [...headlines, ...headlines]
        : []

    return (
        <div className="h-10 border-b-3 border-ink bg-ink text-primary flex items-center overflow-hidden whitespace-nowrap relative z-10">
            <div className="animate-marquee font-mono text-sm font-bold flex gap-12 items-center min-w-max">
                {tickerItems.length > 0 ? (
                    tickerItems.map((headline, i) => (
                        <span key={`${headline.id}-${i}`} className="inline-flex items-center gap-2">
                            <span className="text-primary/50">///</span>
                            <span className="uppercase text-primary/70 text-xs">{headline.category}:</span>
                            <span>{headline.title}</span>
                        </span>
                    ))
                ) : (
                    <>
                        {[...fallbackItems, ...fallbackItems].map((item, i) => (
                            <span key={i}>{item}</span>
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}
