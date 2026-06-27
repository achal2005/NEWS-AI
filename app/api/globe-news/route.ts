import { NextResponse } from 'next/server'

/**
 * API route to proxy Google News RSS feed, avoiding CORS issues.
 * GET /api/globe-news?country=us
 * 
 * This is a test-only endpoint for the globe feature.
 * It does NOT interfere with any existing backend or API routes.
 */

const COUNTRY_LOCALE: Record<string, { gl: string; hl: string; ceid: string }> = {
    'us': { gl: 'US', hl: 'en-US', ceid: 'US:en' },
    'gb': { gl: 'GB', hl: 'en-GB', ceid: 'GB:en' },
    'ru': { gl: 'RU', hl: 'ru', ceid: 'RU:ru' },
    'cn': { gl: 'CN', hl: 'zh-CN', ceid: 'CN:zh-Hans' },
    'in': { gl: 'IN', hl: 'en-IN', ceid: 'IN:en' },
    'jp': { gl: 'JP', hl: 'ja', ceid: 'JP:ja' },
    'de': { gl: 'DE', hl: 'de', ceid: 'DE:de' },
    'fr': { gl: 'FR', hl: 'fr', ceid: 'FR:fr' },
    'br': { gl: 'BR', hl: 'pt-BR', ceid: 'BR:pt-419' },
    'au': { gl: 'AU', hl: 'en-AU', ceid: 'AU:en' },
    'ca': { gl: 'CA', hl: 'en-CA', ceid: 'CA:en' },
    'za': { gl: 'ZA', hl: 'en-ZA', ceid: 'ZA:en' },
    'kr': { gl: 'KR', hl: 'ko', ceid: 'KR:ko' },
    'mx': { gl: 'MX', hl: 'es-419', ceid: 'MX:es-419' },
    'it': { gl: 'IT', hl: 'it', ceid: 'IT:it' },
    'sa': { gl: 'SA', hl: 'ar', ceid: 'SA:ar' },
    'ng': { gl: 'NG', hl: 'en-NG', ceid: 'NG:en' },
    'ar': { gl: 'AR', hl: 'es-419', ceid: 'AR:es-419' },
    'eg': { gl: 'EG', hl: 'ar', ceid: 'EG:ar' },
    'id': { gl: 'ID', hl: 'id', ceid: 'ID:id' },
    'tr': { gl: 'TR', hl: 'tr', ceid: 'TR:tr' },
    'pk': { gl: 'PK', hl: 'en-PK', ceid: 'PK:en' },
    'ua': { gl: 'UA', hl: 'uk', ceid: 'UA:uk' },
    'il': { gl: 'IL', hl: 'he', ceid: 'IL:he' },
}

function parseRssXml(xml: string) {
    const items: any[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match
    while ((match = itemRegex.exec(xml)) !== null) {
        const content = match[1]

        // Extract tag content, handling both CDATA and plain text
        const getTag = (tag: string) => {
            // Try CDATA first
            const cdataMatch = content.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`))
            if (cdataMatch) return cdataMatch[1].trim()
            // Try plain text (but not self-closing or nested)
            const plainMatch = content.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`))
            if (plainMatch) return plainMatch[1].trim()
            // For link tag (often no closing tag in RSS)
            if (tag === 'link') {
                const linkMatch = content.match(/<link>([^<\s]+)/)
                if (linkMatch) return linkMatch[1].trim()
            }
            return ''
        }

        const title = getTag('title').replace(/<[^>]*>/g, '').trim()
        const link = getTag('link')
        const pubDate = getTag('pubDate')
        const source = getTag('source')

        // Google News description contains HTML with links to sub-articles — strip all of it
        let rawDesc = getTag('description')
        // Remove all HTML tags aggressively
        let desc = rawDesc
            .replace(/<!\[CDATA\[/g, '')
            .replace(/\]\]>/g, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, ' ')
            .trim()

        if (title && link) {
            items.push({ title, link, pubDate, source: source || 'Google News', description: desc.slice(0, 200) || '' })
        }
    }
    return items
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const countryCode = searchParams.get('country')?.toLowerCase() || 'us'
    const countryName = searchParams.get('name') || ''

    const locale = COUNTRY_LOCALE[countryCode] || COUNTRY_LOCALE['us']

    try {
        // Fetch Google News RSS directly (server-side, no CORS)
        const rssUrl = `https://news.google.com/rss?gl=${locale.gl}&hl=${locale.hl}&ceid=${locale.ceid}`
        const res = await fetch(rssUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)' },
            signal: AbortSignal.timeout(8000),
        })

        if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`)

        const xml = await res.text()
        const items = parseRssXml(xml).slice(0, 10)

        if (items.length === 0) throw new Error('No items parsed')

        return NextResponse.json({ status: 'ok', source: 'google_news', articles: items })
    } catch (err: any) {
        // Fallback: try search-based Google News RSS
        try {
            const searchTerm = countryName || countryCode
            const searchUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchTerm + ' news')}&hl=en`
            const res2 = await fetch(searchUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)' },
                signal: AbortSignal.timeout(8000),
            })

            if (!res2.ok) throw new Error(`Search RSS failed: ${res2.status}`)

            const xml2 = await res2.text()
            const items2 = parseRssXml(xml2).slice(0, 10)

            if (items2.length > 0) {
                return NextResponse.json({ status: 'ok', source: 'google_news_search', articles: items2 })
            }
        } catch {}

        return NextResponse.json(
            { status: 'error', message: err?.message || 'Failed to fetch news' },
            { status: 500 }
        )
    }
}
