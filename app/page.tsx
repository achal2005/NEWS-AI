'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

// Pre-warm backend on landing (wakes Render before user navigates to login)
if (typeof window !== 'undefined') {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, { cache: 'no-store' }).catch(() => { })
}

/* ── Sample summaries for the interactive demo ── */
const SKIM_SAMPLE = `Global markets rallied on Tuesday as the Federal Reserve signaled a pause in rate hikes. The S&P 500 rose 1.8% — its biggest single-day gain in three months — as cooling inflation and strong employment data eased pressure on policymakers.`

const DEEP_SAMPLE = `Global markets rallied on Tuesday after the Federal Reserve signaled a pause in its rate-hiking cycle — a pivotal shift after eighteen months of tightening.

The S&P 500 rose 1.8% — its strongest session since January — while the Nasdaq climbed 2.3%, led by technology and consumer stocks. The 10-year Treasury yield slipped below 4.2% for the first time in six weeks.

Chair Jerome Powell cited falling core inflation, sustainable employment growth, and steadier consumer spending. Strategists at JPMorgan and Goldman Sachs have since revised their year-end targets upward.`

const CATEGORIES = ['Tech', 'Science', 'Business', 'Health', 'Sports', 'World', 'Culture', 'Climate']

const WIRE = [
    ['Markets', 'Fed signals a pause after eighteen months of hikes'],
    ['Science', 'A new telescope catches light from the first galaxies'],
    ['Tech', 'Chipmakers race to build the next AI accelerators'],
    ['World', 'Coastal cities test floating parks to hold back the tide'],
    ['Culture', 'The quiet comeback of the neighbourhood bookshop'],
]

const SECTIONS = [
    { tag: 'Section A', kicker: 'Summaries', title: 'Skim it, or dive in.' },
    { tag: 'Section B', kicker: 'The Back Page', title: 'A quiz on the week you read.' },
    { tag: 'Section C', kicker: 'Your Feed', title: 'A front page that’s yours.' },
]

/* Entrance wrapper — a subtle one-shot fade/rise on mount (no scroll-gating, so
   content is always present for no-JS/SEO and never stuck hidden). Honors
   prefers-reduced-motion via the keyframe utility. */
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    return (
        <div
            className={`${className} animate-fade-in-up`}
            style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
        >
            {children}
        </div>
    )
}

export default function LandingPage() {
    const [tab, setTab] = useState<'skim' | 'deep'>('skim')
    const [picked, setPicked] = useState<Set<string>>(new Set(['Tech', 'Science', 'Culture']))
    const [menuOpen, setMenuOpen] = useState(false)
    // Client-only date avoids SSR/CSR hydration mismatch across midnight
    const [today, setToday] = useState('')
    useEffect(() => {
        setToday(new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }))
    }, [])

    const toggle = (c: string) =>
        setPicked((prev) => {
            const next = new Set(prev)
            next.has(c) ? next.delete(c) : next.add(c)
            return next
        })

    return (
        <div className="min-h-screen bg-canvas text-ink selection:bg-highlight selection:text-ink overflow-x-hidden">
            {/* ═══════════ MASTHEAD BAR ═══════════ */}
            <header className="border-b-2 border-ink bg-canvas/85 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-editorial mx-auto px-4 sm:px-8 flex items-center justify-between h-14 sm:h-16">
                    <Link href="/" className="font-display font-black text-xl sm:text-3xl tracking-tight leading-none shrink-0">
                        Nut<span className="text-primary">shell</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8 font-mono text-[11px] tracking-widest uppercase">
                        <a href="#summaries" className="hover:text-primary transition-colors">Summaries</a>
                        <a href="#quiz" className="hover:text-primary transition-colors">Quiz</a>
                        <a href="#feed" className="hover:text-primary transition-colors">Your Feed</a>
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <Link href="/login" className="hidden sm:inline font-mono text-[11px] tracking-widest uppercase hover:text-primary transition-colors">
                            Sign in
                        </Link>
                        <Link
                            href="/register"
                            className="bg-ink text-canvas px-3 sm:px-4 py-2 border-2 border-ink font-mono text-[10px] sm:text-[11px] font-bold tracking-widest uppercase shadow-hard-sm hover:bg-primary hover:-translate-y-0.5 transition-all whitespace-nowrap"
                        >
                            Subscribe<span className="hidden sm:inline"> — free</span>
                        </Link>
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="md:hidden w-9 h-9 border-2 border-ink flex items-center justify-center shrink-0"
                            aria-label="Toggle menu"
                            aria-expanded={menuOpen}
                        >
                            <span className="material-symbols-outlined text-lg">{menuOpen ? 'close' : 'menu'}</span>
                        </button>
                    </div>
                </div>
                {menuOpen && (
                    <div className="md:hidden border-t-2 border-ink bg-canvas px-4 py-3 flex flex-col gap-1 font-mono text-xs uppercase tracking-widest">
                        <a href="#summaries" onClick={() => setMenuOpen(false)} className="py-2.5 border-b border-hairline">Summaries</a>
                        <a href="#quiz" onClick={() => setMenuOpen(false)} className="py-2.5 border-b border-hairline">Quiz</a>
                        <a href="#feed" onClick={() => setMenuOpen(false)} className="py-2.5 border-b border-hairline">Your Feed</a>
                        <Link href="/login" onClick={() => setMenuOpen(false)} className="py-2.5">Sign in</Link>
                    </div>
                )}
            </header>

            {/* Dateline strip */}
            <div className="border-b-2 border-ink bg-ink text-canvas">
                <div className="max-w-editorial mx-auto px-4 sm:px-8 h-8 sm:h-9 flex items-center justify-between font-mono text-[9px] sm:text-[11px] tracking-[0.18em] uppercase">
                    <span>The AI Daily</span>
                    <span className="text-canvas/60 truncate px-2" suppressHydrationWarning>{today || ' '}</span>
                    <span className="text-secondary whitespace-nowrap">Free Edition</span>
                </div>
            </div>

            {/* ═══════════ HERO — the front page ═══════════ */}
            <section className="max-w-editorial mx-auto px-4 sm:px-8 pt-8 sm:pt-14 pb-10 sm:pb-16">
                <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-14 items-center">
                    {/* Lede */}
                    <Reveal>
                        <p className="font-mono text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-ink/50 mb-4 sm:mb-5">
                            An AI news reader · Est. 2026
                        </p>
                        <h1 className="font-display font-black leading-[0.92] tracking-tight text-[clamp(2.75rem,11vw,5.75rem)]">
                            Today,<br />
                            in a{' '}
                            <span className="overprint text-primary" data-text="nutshell.">nutshell.</span>
                        </h1>
                        <p className="mt-5 sm:mt-6 max-w-md font-sans text-base sm:text-lg leading-relaxed text-ink/70">
                            NutShell reads the news for you — clear AI summaries you can skim or dive into,
                            a quiz on your week, and a front page tuned to what you actually care about.
                        </p>
                        <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
                            <Link
                                href="/register"
                                className="text-center bg-primary text-canvas px-7 py-4 border-2 border-ink font-display font-bold text-lg shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-hover transition-all"
                            >
                                Start reading →
                            </Link>
                            <Link
                                href="/login"
                                className="text-center font-mono text-xs tracking-widest uppercase underline decoration-2 decoration-secondary underline-offset-4 hover:text-primary transition-colors py-2"
                            >
                                I already have an account
                            </Link>
                        </div>
                        <p className="mt-5 font-mono text-[10px] sm:text-[11px] tracking-wider text-ink/40">
                            Free forever · No card required · 100+ sources
                        </p>
                    </Reveal>

                    {/* Front-page mock */}
                    <Reveal delay={120} className="max-w-md w-full mx-auto lg:max-w-none">
                        <div className="relative">
                            <div className="absolute inset-0 translate-x-2 translate-y-2 border-2 border-ink bg-secondary/20" aria-hidden />
                            <div className="relative bg-surface border-2 border-ink shadow-hard">
                                <div className="flex items-center justify-between px-4 py-2 border-b-2 border-ink bg-ink text-canvas">
                                    <span className="font-mono text-[10px] tracking-[0.2em] uppercase">Front Page</span>
                                    <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase">
                                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />Live
                                    </span>
                                </div>
                                <div className="p-4 sm:p-5">
                                    <span className="inline-block font-mono text-[10px] font-bold tracking-widest uppercase bg-primary text-canvas px-2 py-0.5">
                                        Business
                                    </span>
                                    <h3 className="font-display font-black text-xl sm:text-2xl leading-tight tracking-tight mt-3">
                                        Fed signals a rate pause after 18 months of hikes
                                    </h3>
                                    <p className="font-mono text-[11px] text-ink/45 mt-1">Reuters · 4 min read</p>

                                    <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-[11px] font-bold uppercase tracking-widest">
                                        <div className="text-center py-2 border-2 border-ink bg-primary text-canvas">Skim</div>
                                        <div className="text-center py-2 border-2 border-ink bg-surface text-ink/50">Deep dive</div>
                                    </div>
                                    <p className="mt-3 font-sans text-sm leading-relaxed text-ink/70 line-clamp-3">
                                        {SKIM_SAMPLE}
                                    </p>

                                    <div className="mt-4 pt-4 border-t-2 border-dashed border-hairline flex items-center gap-3">
                                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink/50 whitespace-nowrap">Level 4</span>
                                        <div className="flex-1 h-2 border-2 border-ink bg-canvas">
                                            <div className="h-full bg-secondary" style={{ width: '65%' }} />
                                        </div>
                                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-secondary whitespace-nowrap">+120 XP</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ═══════════ LIVE NEWSWIRE ═══════════ */}
            <div className="border-y-2 border-ink bg-surface overflow-hidden">
                <div className="flex items-stretch">
                    <div className="shrink-0 hidden sm:flex items-center px-4 border-r-2 border-ink bg-primary text-canvas font-mono text-[10px] font-bold tracking-[0.2em] uppercase">
                        Newswire
                    </div>
                    <div className="flex-1 overflow-hidden py-2.5">
                        <div className="animate-marquee flex gap-10 items-center min-w-max font-mono text-xs sm:text-sm whitespace-nowrap">
                            {[...WIRE, ...WIRE].map(([cat, headline], i) => (
                                <span key={i} className="inline-flex items-center gap-2">
                                    <span className="text-secondary font-bold">✦</span>
                                    <span className="uppercase text-ink/40 text-[10px] sm:text-xs tracking-wider">{cat}</span>
                                    <span className="text-ink/80">{headline}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Section rule */}
            <div className="max-w-editorial mx-auto px-4 sm:px-8 pt-12 sm:pt-16">
                <div className="flex items-center gap-4">
                    <hr className="reg-rule flex-1" />
                    <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-ink/40 whitespace-nowrap">Inside this edition</span>
                    <hr className="reg-rule flex-1" />
                </div>
            </div>

            {/* ═══════════ SUMMARIES ═══════════ */}
            <section id="summaries" className="max-w-editorial mx-auto px-4 sm:px-8 py-12 sm:py-20">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
                    <Reveal>
                        <SectionKicker tag={SECTIONS[0].tag} label={SECTIONS[0].kicker} />
                        <h2 className="font-display font-black leading-[0.95] tracking-tight text-[clamp(2rem,6vw,3rem)] mt-4">
                            {SECTIONS[0].title}
                        </h2>
                        <p className="mt-4 font-sans text-base sm:text-lg leading-relaxed text-ink/70 max-w-md">
                            Every article comes with an AI summary in two depths. Get the gist in thirty
                            seconds, or unfold the full analysis when a story earns your time.
                        </p>
                    </Reveal>

                    {/* Interactive demo */}
                    <Reveal delay={100} className="bg-surface border-2 border-ink shadow-hard">
                        <div className="grid grid-cols-2 font-mono text-xs font-bold uppercase tracking-widest border-b-2 border-ink">
                            {(['skim', 'deep'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    aria-pressed={tab === t}
                                    className={`py-3 transition-colors ${tab === t ? 'bg-ink text-canvas' : 'bg-surface text-ink/50 hover:text-ink'} ${t === 'skim' ? 'border-r-2 border-ink' : ''}`}
                                >
                                    {t === 'skim' ? 'Skim · 30s' : 'Deep dive'}
                                </button>
                            ))}
                        </div>
                        <div className="p-4 sm:p-5 min-h-[210px] sm:min-h-[220px]">
                            <p className="font-sans text-[15px] leading-relaxed text-ink/80 whitespace-pre-line">
                                {tab === 'skim' ? SKIM_SAMPLE : DEEP_SAMPLE}
                            </p>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ═══════════ QUIZ ═══════════ */}
            <section id="quiz" className="border-y-2 border-ink bg-ink text-canvas">
                <div className="max-w-editorial mx-auto px-4 sm:px-8 py-12 sm:py-20 grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
                    {/* Scoreboard mock */}
                    <Reveal className="order-2 md:order-1 bg-canvas text-ink border-2 border-canvas shadow-[5px_5px_0_0_#D9614C]">
                        <div className="px-4 sm:px-5 py-3 border-b-2 border-ink flex items-center justify-between">
                            <span className="font-mono text-[10px] sm:text-[11px] tracking-[0.2em] uppercase">This Week&apos;s Roster</span>
                            <span className="material-symbols-outlined text-lg text-secondary">trophy</span>
                        </div>
                        <ol className="divide-y-2 divide-hairline">
                            {[
                                { r: 1, name: 'A. Verma', xp: 2140 },
                                { r: 2, name: 'M. Okonkwo', xp: 1980 },
                                { r: 3, name: 'You', xp: 1720 },
                            ].map((row) => (
                                <li key={row.r} className={`flex items-center gap-3 px-4 sm:px-5 py-3 ${row.name === 'You' ? 'bg-secondary/10' : ''}`}>
                                    <span className="font-display font-black text-lg sm:text-xl w-5 sm:w-6">{row.r}</span>
                                    <span className="font-sans font-bold flex-1 truncate">{row.name}</span>
                                    <span className="font-mono text-xs sm:text-sm text-ink/60 whitespace-nowrap">{row.xp.toLocaleString()} XP</span>
                                </li>
                            ))}
                        </ol>
                    </Reveal>

                    <Reveal delay={100} className="order-1 md:order-2">
                        <SectionKicker tag={SECTIONS[1].tag} label={SECTIONS[1].kicker} dark />
                        <h2 className="font-display font-black leading-[0.95] tracking-tight text-[clamp(2rem,6vw,3rem)] mt-4">
                            {SECTIONS[1].title}
                        </h2>
                        <p className="mt-4 font-sans text-base sm:text-lg leading-relaxed text-canvas/70 max-w-md">
                            Every week NutShell writes a fresh quiz from your own feed. Answer questions,
                            earn XP, level up your reader title, and climb the global roster.
                        </p>
                        <Link
                            href="/register"
                            className="inline-block mt-7 sm:mt-8 bg-secondary text-ink px-6 py-3.5 border-2 border-canvas font-display font-bold text-lg hover:-translate-y-0.5 transition-transform"
                        >
                            Play this week →
                        </Link>
                    </Reveal>
                </div>
            </section>

            {/* ═══════════ FEED ═══════════ */}
            <section id="feed" className="max-w-editorial mx-auto px-4 sm:px-8 py-12 sm:py-20">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
                    <Reveal>
                        <SectionKicker tag={SECTIONS[2].tag} label={SECTIONS[2].kicker} />
                        <h2 className="font-display font-black leading-[0.95] tracking-tight text-[clamp(2rem,6vw,3rem)] mt-4">
                            {SECTIONS[2].title}
                        </h2>
                        <p className="mt-4 font-sans text-base sm:text-lg leading-relaxed text-ink/70 max-w-md">
                            Pick the beats you follow and NutShell curates from over a hundred sources.
                            Tap a few below to see how your edition takes shape.
                        </p>
                    </Reveal>

                    <Reveal delay={100} className="bg-surface border-2 border-ink shadow-hard p-5 sm:p-6">
                        <p className="font-mono text-[11px] tracking-widest uppercase text-ink/45 mb-4">
                            {picked.size} beats selected
                        </p>
                        <div className="flex flex-wrap gap-2 sm:gap-2.5">
                            {CATEGORIES.map((c) => {
                                const on = picked.has(c)
                                return (
                                    <button
                                        key={c}
                                        onClick={() => toggle(c)}
                                        aria-pressed={on}
                                        className={`px-3 sm:px-3.5 py-2 border-2 border-ink font-mono text-[11px] sm:text-xs font-bold uppercase tracking-widest transition-all ${on
                                            ? 'bg-primary text-canvas shadow-hard-sm -translate-y-0.5'
                                            : 'bg-surface text-ink/50 hover:text-ink'
                                            }`}
                                    >
                                        {c}
                                    </button>
                                )
                            })}
                        </div>
                        <p className="mt-5 font-sans text-sm text-ink/50">
                            You&apos;ll set these during a 30-second onboarding — and can change them anytime.
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* ═══════════ CREDIBILITY BAND ═══════════ */}
            <section className="border-y-2 border-ink bg-surface">
                <div className="max-w-editorial mx-auto px-4 sm:px-8 py-8 grid grid-cols-3 divide-x-2 divide-hairline text-center">
                    {[
                        ['100+', 'News sources'],
                        ['2', 'Reading depths'],
                        ['Weekly', 'Fresh quiz'],
                    ].map(([big, small]) => (
                        <div key={small} className="px-2">
                            <div className="font-display font-black text-[clamp(1.75rem,6vw,3rem)] leading-none text-primary">{big}</div>
                            <div className="font-mono text-[9px] sm:text-[11px] tracking-widest uppercase text-ink/50 mt-2">{small}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══════════ CLOSING CTA ═══════════ */}
            <section className="border-b-2 border-ink">
                <div className="max-w-editorial mx-auto px-4 sm:px-8 py-16 sm:py-24 text-center">
                    <h2 className="font-display font-black leading-[0.9] tracking-tight text-[clamp(2.75rem,10vw,5rem)]">
                        Read less.<br /><span className="overprint text-primary" data-text="Know more.">Know more.</span>
                    </h2>
                    <Link
                        href="/register"
                        className="inline-block mt-9 sm:mt-10 bg-ink text-canvas px-8 sm:px-10 py-4 sm:py-5 border-2 border-ink font-display font-bold text-lg sm:text-xl shadow-hard hover:bg-primary hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-hover transition-all">
                        Get today&apos;s edition — free →
                    </Link>
                </div>
            </section>

            {/* ═══════════ FOOTER ═══════════ */}
            <footer className="bg-ink text-canvas">
                <div className="max-w-editorial mx-auto px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] tracking-wider">
                    <span className="font-display font-black text-lg tracking-tight">Nutshell</span>
                    <p className="text-canvas/50 uppercase tracking-widest text-[9px] sm:text-[10px] text-center order-last sm:order-none">
                        Built with Next.js, FastAPI &amp; Gemini · Open RSS feeds
                    </p>
                    <div className="flex items-center gap-5 text-canvas/70 uppercase tracking-widest text-[10px]">
                        <span>© 2026</span>
                        <Link href="/privacy" className="hover:text-secondary transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-secondary transition-colors">Terms</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}

/* ── Numbered section kicker — newspaper 'Section A/B/C' convention ── */
function SectionKicker({ tag, label, dark = false }: { tag: string; label: string; dark?: boolean }) {
    return (
        <div className="flex items-center gap-3">
            <span className={`font-mono text-[10px] font-bold tracking-[0.2em] uppercase px-2 py-1 border-2 ${dark ? 'border-canvas text-canvas' : 'border-ink text-ink'}`}>
                {tag}
            </span>
            <span className={`font-mono text-[11px] tracking-[0.3em] uppercase ${dark ? 'text-secondary' : 'text-primary'}`}>
                {label}
            </span>
        </div>
    )
}
