'use client'

import { useState, useEffect, useRef } from 'react'
import { Zap } from 'lucide-react'

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

        // Fetch latest headlines
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

    if (headlines.length === 0) {
        return (
            <div className="ticker-bar py-2.5 px-4">
                <div className="flex items-center gap-2 justify-center">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Live Wire</span>
                    <span className="text-xs opacity-60">— Loading headlines...</span>
                </div>
            </div>
        )
    }

    // Double the content for seamless loop
    const tickerItems = [...headlines, ...headlines]

    return (
        <div className="ticker-bar py-2.5 relative">
            {/* LIVE badge */}
            <div
                className="absolute left-0 top-0 bottom-0 z-10 flex items-center gap-1.5 px-4 font-semibold text-xs uppercase tracking-wider"
                style={{
                    background: 'linear-gradient(90deg, var(--ink) 80%, transparent)',
                    color: 'var(--paper)',
                }}
            >
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'var(--danger)' }} />
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: 'var(--danger)' }} />
                </span>
                <Zap className="w-3 h-3" />
                Live
            </div>

            {/* Scrolling content */}
            <div className="ticker-content pl-24">
                {tickerItems.map((headline, i) => (
                    <span key={`${headline.id}-${i}`} className="inline-flex items-center gap-3 mx-6 text-xs">
                        <span className="opacity-40 font-semibold uppercase tracking-wider">
                            {headline.category}
                        </span>
                        <span className="font-medium">{headline.title}</span>
                        <span className="opacity-20">◆</span>
                    </span>
                ))}
            </div>
        </div>
    )
}
