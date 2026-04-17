'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'

// Pre-warm backend on landing (wakes Render before user navigates to login)
if (typeof window !== 'undefined') {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, { cache: 'no-store' }).catch(() => { })
}

/* ────────────────────────────────── SAMPLE CONTENT ────────────────────────────────── */
const SKIM_SAMPLE = `Global markets rallied on Tuesday as the Federal Reserve signaled a pause in rate hikes. The S&P 500 rose 1.8%, its biggest single-day gain in three months. Analysts say the shift reflects cooling inflation data and strengthening employment numbers across key sectors.`

const DEEP_DIVE_SAMPLE = `Global financial markets experienced a significant rally on Tuesday following the Federal Reserve's announcement of a potential pause in its rate-hiking cycle, marking a pivotal shift in monetary policy after 18 months of aggressive tightening.

The S&P 500 surged 1.8% — its strongest session since January — while the Nasdaq Composite climbed 2.3%, led by gains in the technology and consumer discretionary sectors. Bond yields fell sharply, with the 10-year Treasury dipping below 4.2% for the first time in six weeks.

Fed Chair Jerome Powell cited three key factors: a consistent decline in core inflation over the past quarter, robust yet sustainable employment growth, and stabilizing consumer spending. "The data suggests we are approaching a point where further tightening may not be necessary," Powell noted during the post-meeting press conference.

Market strategists at JPMorgan and Goldman Sachs have revised their year-end targets upward, with consensus now pointing to a potential rate cut as early as Q3. However, some analysts warn that geopolitical risks — including ongoing tensions in the South China Sea and energy supply disruptions — could complicate the outlook.`

const SCENES = [
    {
        id: 'hero',
        badge: 'System.Status: Live_Now',
        heading: (
            <>
                Your news, <br />but{' '}
                <span className="relative inline-block">
                    smarter.
                    <span className="absolute -right-2 -top-5 md:-right-4 md:-top-7 bg-ink text-primary text-[8px] md:text-[10px] p-1 md:p-1.5 rotate-12 font-bold tracking-normal not-italic border border-primary">
                        FREE_ACCESS
                    </span>
                </span>
            </>
        ),
        description: 'The Daily Brief is an AI-powered news reader that summarizes articles, quizzes you weekly, and personalizes your feed.',
        cta: { text: 'START READING →', href: '/register' },
    },
    {
        id: 'ai-modes',
        badge: 'Core Feature',
        cardTitle: 'AI Summaries',
        cardIcon: 'auto_awesome',
        cardBody: 'Every article is summarized by Gemini AI. Toggle between reading modes instantly.',
        extras: [
            { label: 'SKIM', desc: '30-second quick read', bg: 'bg-primary text-white' },
            { label: 'DEEP DIVE', desc: 'Full AI analysis', bg: 'bg-ink text-primary' },
        ],
    },
    {
        id: 'quiz',
        badge: 'Gamification',
        cardTitle: 'Pop Quiz',
        cardIcon: 'quiz',
        cardBody: 'Weekly quizzes auto-generated from your news feed. Earn XP, level up, unlock reader titles.',
        extras: [
            { label: 'WEEKLY', desc: 'Fresh questions every week', bg: 'bg-primary text-white' },
            { label: 'LEADERBOARD', desc: 'Compete globally', bg: 'bg-ink text-primary' },
        ],
    },
    {
        id: 'feed',
        badge: 'Personalization',
        cardTitle: 'Your Feed',
        cardIcon: 'tune',
        cardBody: 'Pick your interests during onboarding. The algorithm curates articles tailored to your manifesto.',
        categories: ['TECH', 'SCIENCE', 'BUSINESS', 'HEALTH', 'SPORTS', 'WORLD'],
    },
]

/* ────────────────────────────────── COMPONENT ────────────────────────────────── */
export default function LandingPage() {
    const [activeScene, setActiveScene] = useState(0)
    const [isMobile, setIsMobile] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [activeTab, setActiveTab] = useState<'skim' | 'deep'>('skim')
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(['TECH', 'SCIENCE']))
    const scrollRef = useRef<HTMLDivElement>(null)
    const isTransitioning = useRef(false)

    // Detect mobile
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768)
        check()
        window.addEventListener('resize', check)
        return () => window.removeEventListener('resize', check)
    }, [])

    // Desktop scroll-scene system
    useEffect(() => {
        if (isMobile) return
        const container = scrollRef.current
        if (!container) return

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault()
            if (isTransitioning.current) return

            const direction = e.deltaY > 0 ? 1 : -1
            setActiveScene((prev) => {
                const next = Math.max(0, Math.min(SCENES.length - 1, prev + direction))
                if (next !== prev) {
                    isTransitioning.current = true
                    setTimeout(() => { isTransitioning.current = false }, 800)
                }
                return next
            })
        }

        // Touch support for desktop touch screens
        let touchStartY = 0
        const handleTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY }
        const handleTouchEnd = (e: TouchEvent) => {
            if (isTransitioning.current) return
            const diff = touchStartY - e.changedTouches[0].clientY
            if (Math.abs(diff) < 40) return
            const direction = diff > 0 ? 1 : -1
            setActiveScene((prev) => {
                const next = Math.max(0, Math.min(SCENES.length - 1, prev + direction))
                if (next !== prev) {
                    isTransitioning.current = true
                    setTimeout(() => { isTransitioning.current = false }, 800)
                }
                return next
            })
        }

        container.addEventListener('wheel', handleWheel, { passive: false })
        container.addEventListener('touchstart', handleTouchStart, { passive: true })
        container.addEventListener('touchend', handleTouchEnd, { passive: true })
        return () => {
            container.removeEventListener('wheel', handleWheel)
            container.removeEventListener('touchstart', handleTouchStart)
            container.removeEventListener('touchend', handleTouchEnd)
        }
    }, [isMobile])

    const toggleCategory = (cat: string) => {
        setSelectedCategories((prev) => {
            const next = new Set(prev)
            if (next.has(cat)) next.delete(cat)
            else next.add(cat)
            return next
        })
    }

    const scene = SCENES[activeScene]

    /* ────────────── MOBILE LAYOUT ────────────── */
    if (isMobile) {
        return (
            <div className="min-h-screen bg-canvas text-ink relative font-mono selection:bg-highlight selection:text-ink">
                {/* Halftone bg */}
                <div className="fixed inset-0 pointer-events-none opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(#121212 1px, transparent 0)', backgroundSize: '4px 4px' }} />

                {/* NAV */}
                <header className="sticky top-0 z-50 bg-canvas border-b-3 border-ink">
                    <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2 -rotate-1 bg-primary border-3 border-ink p-1.5 shadow-[4px_4px_0px_#121212]">
                            <span className="material-symbols-outlined font-black text-lg text-white">newspaper</span>
                            <h1 className="text-base font-display font-black uppercase tracking-tighter text-white">THE DAILY BRIEF</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/register" className="bg-ink text-primary px-3 py-1.5 shadow-[3px_3px_0px_#E02020] font-black text-[10px] uppercase">
                                SIGN UP
                            </Link>
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="w-9 h-9 bg-white border-2 border-ink flex items-center justify-center shadow-hard-sm"
                                aria-label="Menu"
                            >
                                <span className="material-symbols-outlined text-lg">{mobileMenuOpen ? 'close' : 'menu'}</span>
                            </button>
                        </div>
                    </div>
                    {/* Mobile dropdown menu */}
                    {mobileMenuOpen && (
                        <div className="border-t-2 border-ink bg-white p-3 flex flex-col gap-2">
                            <a href="#ai-modes" onClick={() => setMobileMenuOpen(false)} className="block bg-canvas px-3 py-2 border-2 border-ink font-bold text-xs uppercase">AI Modes</a>
                            <a href="#quiz" onClick={() => setMobileMenuOpen(false)} className="block bg-canvas px-3 py-2 border-2 border-ink font-bold text-xs uppercase">Quiz</a>
                            <a href="#feed" onClick={() => setMobileMenuOpen(false)} className="block bg-canvas px-3 py-2 border-2 border-ink font-bold text-xs uppercase">Feed</a>
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block bg-canvas px-3 py-2 border-2 border-ink font-bold text-xs uppercase text-center">Log In</Link>
                        </div>
                    )}
                </header>

                {/* HERO */}
                <section className="px-4 py-8">
                    <div className="inline-block bg-primary text-white px-2 py-0.5 mb-3 font-black text-[10px] uppercase -rotate-1 border-2 border-ink">
                        System.Status: Live_Now
                    </div>
                    <h2 className="text-3xl font-display font-black uppercase leading-[0.85] tracking-tighter text-ink mb-4" style={{ textShadow: '2px 2px 0px #E02020' }}>
                        Your news, <br />but smarter.
                    </h2>
                    <p className="text-sm font-bold leading-snug bg-white/60 p-3 -rotate-1 border-l-4 border-primary mb-6">
                        The Daily Brief is an AI-powered news reader that summarizes articles, quizzes you weekly, and personalizes your feed.
                    </p>

                    {/* Mock App Preview */}
                    <div className="border-3 border-ink bg-white p-3 shadow-[6px_6px_0px_#121212] mb-6 rotate-1">
                        <div className="border-b-2 border-ink pb-2 mb-2">
                            <span className="text-[9px] font-bold text-ink/40 uppercase tracking-wider">APP PREVIEW</span>
                        </div>
                        <div className="space-y-2">
                            <div className="bg-canvas border-2 border-ink p-2">
                                <p className="font-display font-bold text-sm leading-tight">Fed Signals Rate Pause After 18 Months of Hikes</p>
                                <p className="font-mono text-[10px] text-ink/50 mt-1">Reuters • 4 min read</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1 text-center py-1.5 bg-primary text-white font-black text-[10px] border-2 border-ink">SKIM</div>
                                <div className="flex-1 text-center py-1.5 bg-ink text-primary font-black text-[10px] border-2 border-ink">DEEP DIVE</div>
                            </div>
                            <div className="flex items-center gap-2 bg-canvas border-2 border-ink p-2">
                                <span className="font-mono text-[9px] font-bold text-ink/60">XP</span>
                                <div className="flex-1 h-2 bg-ink/10 border border-ink/20">
                                    <div className="h-full bg-primary" style={{ width: '65%' }} />
                                </div>
                                <span className="font-mono text-[9px] font-bold text-primary">LVL 4</span>
                            </div>
                        </div>
                    </div>

                    <Link href="/register" className="block text-center bg-primary border-3 border-ink text-white font-black text-sm px-6 py-3 uppercase shadow-[4px_4px_0px_#121212] hover:bg-ink hover:text-primary transition-all">
                        START READING →
                    </Link>
                </section>

                {/* FEATURE CARDS — stacked */}
                {SCENES.slice(1).map((sc, idx) => {
                    const sceneIdx = idx + 1
                    return (
                        <section key={sc.id} id={sc.id} className="px-4 py-6 border-t-3 border-ink">
                            <div className="bg-white border-3 border-ink p-5 shadow-[6px_6px_0px_#E02020] relative">
                                <div className="halftone-bg absolute inset-0 pointer-events-none" />
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="inline-block bg-primary text-white px-2 py-0.5 font-black text-[9px] uppercase border-2 border-ink">
                                            {sc.badge}
                                        </div>
                                        <span className="text-primary font-black text-[9px]">SCENE {String(sceneIdx).padStart(2, '0')}/03</span>
                                    </div>
                                    <div className="flex items-center gap-2 border-b-3 border-ink pb-2 mb-3">
                                        <span className="material-symbols-outlined text-2xl text-primary">{sc.cardIcon}</span>
                                        <h3 className="font-display font-black uppercase text-xl">{sc.cardTitle}</h3>
                                    </div>
                                    <p className="text-sm font-bold leading-relaxed mb-4">{sc.cardBody}</p>

                                    {/* Interactive extras for AI Summaries */}
                                    {sc.id === 'ai-modes' && sc.extras && (
                                        <div>
                                            <div className="flex gap-3 mb-3">
                                                {sc.extras.map((ex) => (
                                                    <button
                                                        key={ex.label}
                                                        onClick={() => setActiveTab(ex.label === 'SKIM' ? 'skim' : 'deep')}
                                                        className={`flex-1 text-center py-2.5 text-sm font-black border-2 border-ink shadow-[3px_3px_0px_#000] transition-all ${
                                                            (ex.label === 'SKIM' && activeTab === 'skim') || (ex.label === 'DEEP DIVE' && activeTab === 'deep')
                                                                ? 'bg-primary text-white -translate-y-0.5'
                                                                : 'bg-white text-ink opacity-60 hover:opacity-100'
                                                        }`}
                                                    >
                                                        <div>{ex.label}</div>
                                                        <div className="text-[9px] font-bold opacity-70 mt-0.5">{ex.desc}</div>
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="bg-canvas border-2 border-ink/20 p-3">
                                                <p className="font-mono text-xs leading-relaxed text-ink/70">
                                                    {activeTab === 'skim' ? SKIM_SAMPLE : DEEP_DIVE_SAMPLE}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Static extras for Quiz */}
                                    {sc.id === 'quiz' && sc.extras && (
                                        <div className="flex gap-3">
                                            {sc.extras.map((ex) => (
                                                <div key={ex.label} className={`flex-1 text-center py-2.5 text-sm font-black border-2 border-ink shadow-[3px_3px_0px_#000] ${ex.bg}`}>
                                                    <div>{ex.label}</div>
                                                    <div className="text-[9px] font-bold opacity-70 mt-0.5">{ex.desc}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Toggleable categories for Feed */}
                                    {sc.categories && (
                                        <div>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {sc.categories.map((cat) => (
                                                    <button
                                                        key={cat}
                                                        onClick={() => toggleCategory(cat)}
                                                        className={`px-3 py-1.5 text-xs font-black border transition-all ${
                                                            selectedCategories.has(cat)
                                                                ? 'bg-primary text-white border-ink shadow-[2px_2px_0px_#121212] -translate-y-0.5'
                                                                : 'bg-ink text-primary border-primary opacity-50 hover:opacity-100'
                                                        }`}
                                                    >
                                                        {cat}
                                                    </button>
                                                ))}
                                            </div>
                                            <p className="font-mono text-[10px] text-ink/40 italic">You&apos;ll choose these during onboarding.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    )
                })}

                {/* FOOTER */}
                <footer className="p-4 border-t-4 border-ink bg-canvas">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className="bg-primary px-2 py-0.5 -rotate-1 border-2 border-ink font-display font-black text-xs uppercase text-white">
                                THE DAILY BRIEF v1.0
                            </div>
                            <div className="bg-ink text-primary px-2 py-0.5 text-[9px] font-bold">
                                EST. 2026
                            </div>
                        </div>
                        <div className="flex items-center gap-4 font-mono text-[10px] text-ink/40">
                            <span>© 2026 The Daily Brief</span>
                            <Link href="/privacy" className="underline hover:text-ink transition-colors">Privacy</Link>
                            <Link href="/terms" className="underline hover:text-ink transition-colors">Terms</Link>
                        </div>
                    </div>
                </footer>

                {/* Zine styles */}
                <style jsx>{`
                    .halftone-bg {
                        background-image: radial-gradient(#121212 1px, transparent 0);
                        background-size: 4px 4px;
                        opacity: 0.03;
                    }
                `}</style>
            </div>
        )
    }

    /* ────────────── DESKTOP LAYOUT ────────────── */
    return (
        <div ref={scrollRef} className="h-screen w-screen overflow-hidden bg-canvas text-ink relative font-mono selection:bg-highlight selection:text-ink flex flex-col">
            {/* Halftone background */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(#121212 1px, transparent 0)', backgroundSize: '4px 4px' }} />
            {/* Grid lines */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(224,32,32,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(224,32,32,0.4) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            {/* ═══════════ NAV ═══════════ */}
            <header className="flex items-center justify-between p-4 md:p-6 z-50 relative">
                <div className="flex items-center gap-2 -rotate-2 bg-primary border-4 border-ink p-2 shadow-[6px_6px_0px_#121212]">
                    <span className="material-symbols-outlined font-black text-xl md:text-2xl text-white">newspaper</span>
                    <h1 className="text-xl md:text-2xl font-display font-black uppercase tracking-tighter text-white">THE DAILY BRIEF</h1>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                    <nav className="hidden md:flex gap-3 font-bold uppercase text-[10px]">
                        <a href="#ai-modes" onClick={(e) => { e.preventDefault(); setActiveScene(1) }} className="bg-white px-2 py-1 rotate-1 border-2 border-ink hover:bg-primary hover:text-white transition-colors">AI Modes</a>
                        <a href="#quiz" onClick={(e) => { e.preventDefault(); setActiveScene(2) }} className="bg-white px-2 py-1 -rotate-1 border-2 border-ink hover:bg-primary hover:text-white transition-colors">Quiz</a>
                        <a href="#feed" onClick={(e) => { e.preventDefault(); setActiveScene(3) }} className="bg-white px-2 py-1 rotate-1 border-2 border-ink hover:bg-primary hover:text-white transition-colors">Feed</a>
                    </nav>
                    <Link href="/login" className="hidden sm:block bg-white px-3 py-1.5 border-2 border-ink font-bold text-xs uppercase hover:bg-ink hover:text-white transition-colors">
                        Log In
                    </Link>
                    <Link href="/register" className="bg-ink text-primary px-4 py-2 -rotate-2 shadow-[4px_4px_0px_#E02020] font-black text-xs uppercase hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                        SIGN UP FREE
                    </Link>
                </div>
            </header>

            {/* Vertical scroll indicator — desktop only */}
            <div className="fixed right-3 md:right-5 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3 z-40">
                <div className="[writing-mode:vertical-lr] font-bold text-[9px] tracking-[0.2em] opacity-30 uppercase" style={{ animation: 'pulse 2s ease-in-out infinite' }}>
                    SCROLL TO DISCOVER
                </div>
                <div className="flex flex-col gap-1.5">
                    {SCENES.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveScene(i)}
                            className={`w-2.5 h-2.5 border-2 border-ink transition-all duration-300 ${activeScene === i ? 'bg-primary scale-125' : 'bg-white hover:bg-primary/50'}`}
                        />
                    ))}
                </div>
                <div className="w-0.5 h-12 bg-ink/15" />
            </div>

            {/* ═══════════ MAIN STAGE ═══════════ */}
            <main className="flex-1 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center p-6 md:p-12">

                    {/* ─── SCENE 0: HERO ─── */}
                    <div className={`absolute inset-0 flex items-center justify-center p-6 md:p-8 transition-all duration-700 ${activeScene === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-16 pointer-events-none'}`}>
                        <div className="max-w-5xl w-full flex flex-col lg:flex-row items-start gap-6 lg:gap-12">
                            <div className="flex-1">
                                <div className="inline-block bg-primary text-white px-3 py-1 mb-3 font-black text-xs uppercase -rotate-1 border-2 border-ink hide-xs">
                                    {scene.id === 'hero' ? scene.badge : SCENES[0].badge}
                                </div>
                                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black uppercase leading-[0.85] tracking-tighter text-ink mb-4 md:mb-6" style={{ textShadow: '3px 3px 0px #E02020' }}>
                                    {SCENES[0].heading}
                                </h2>
                                <p className="text-sm md:text-lg font-bold max-w-lg leading-snug bg-white/60 p-4 -rotate-1 border-l-4 border-primary">
                                    {SCENES[0].description}
                                </p>
                                <Link href="/register" className="mt-6 md:mt-8 inline-block bg-primary border-4 border-ink text-white font-black text-base md:text-lg px-8 md:px-10 py-3.5 md:py-4 uppercase shadow-[6px_6px_0px_#121212] hover:bg-ink hover:text-primary hover:-translate-y-1 transition-all">
                                    START READING →
                                </Link>
                            </div>
                            {/* Mock App Preview Card */}
                            <div className="hidden lg:block w-56 relative">
                                <div className="border-3 border-ink bg-white p-3 rotate-3 shadow-[8px_8px_0px_#E02020] overflow-hidden">
                                    <div className="border-b-2 border-ink pb-1.5 mb-2">
                                        <span className="text-[8px] font-bold text-ink/40 uppercase tracking-wider">APP PREVIEW</span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="bg-canvas border-2 border-ink p-2">
                                            <p className="font-display font-bold text-xs leading-tight">Fed Signals Rate Pause After 18 Months</p>
                                            <p className="font-mono text-[8px] text-ink/50 mt-0.5">Reuters • 4 min</p>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <div className="flex-1 text-center py-1 bg-primary text-white font-black text-[8px] border border-ink">SKIM</div>
                                            <div className="flex-1 text-center py-1 bg-ink text-primary font-black text-[8px] border border-ink">DEEP DIVE</div>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-canvas border border-ink p-1.5">
                                            <span className="font-mono text-[7px] font-bold text-ink/60">XP</span>
                                            <div className="flex-1 h-1.5 bg-ink/10 border border-ink/20">
                                                <div className="h-full bg-primary" style={{ width: '65%' }} />
                                            </div>
                                            <span className="font-mono text-[7px] font-bold text-primary">LVL 4</span>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-1.5 -left-1.5 bg-white border-2 border-ink p-1.5 -rotate-3 z-10">
                                        <p className="font-black text-[8px]">EDITION_042 // LIVE</p>
                                    </div>
                                </div>
                                <div className="absolute -top-5 -right-5 w-14 h-14 bg-ink rounded-full flex items-center justify-center -rotate-12 border-2 border-primary">
                                    <span className="text-primary font-black text-[8px] text-center leading-tight">UPDATED<br />DAILY</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── SCENES 1-3: FEATURE CARDS ─── */}
                    {SCENES.slice(1).map((sc, idx) => {
                        const sceneIdx = idx + 1
                        const isActive = activeScene === sceneIdx
                        const rotations = ['rotate-1', '-rotate-1', 'rotate-1']
                        const shadowColors = ['#E02020', '#121212', '#E02020']

                        return (
                            <div
                                key={sc.id}
                                id={sc.id}
                                className={`absolute inset-0 flex items-center justify-center p-4 md:p-8 transition-all duration-700 ${isActive ? 'opacity-100 translate-y-0 scale-100' : activeScene > sceneIdx ? 'opacity-0 -translate-y-20 scale-95 pointer-events-none' : 'opacity-0 translate-y-20 scale-95 pointer-events-none'}`}
                            >
                                <div className="max-w-3xl w-full flex flex-col md:flex-row items-center gap-6 md:gap-8">
                                    {/* Main feature card */}
                                    <div className={`flex-1 bg-white border-3 border-ink p-6 md:p-8 ${rotations[idx]} torn-edge relative`} style={{ boxShadow: `8px 8px 0px ${shadowColors[idx]}` }}>
                                        <div className="halftone-bg absolute inset-0 pointer-events-none" />
                                        <div className="relative z-10">
                                            <div className="inline-block bg-primary text-white px-3 py-1 mb-3 font-black text-[10px] uppercase border-2 border-ink">
                                                {sc.badge}
                                            </div>
                                            <div className="flex items-center gap-3 border-b-3 border-ink pb-3 mb-4">
                                                <span className="material-symbols-outlined text-3xl text-primary">{sc.cardIcon}</span>
                                                <h3 className="font-display font-black uppercase text-2xl md:text-3xl">{sc.cardTitle}</h3>
                                            </div>
                                            <p className="text-sm md:text-base font-bold leading-relaxed mb-5">{sc.cardBody}</p>

                                            {/* Interactive SKIM/DEEP DIVE for AI Summaries */}
                                            {sc.id === 'ai-modes' && sc.extras && (
                                                <div>
                                                    <div className="flex gap-4 mb-4">
                                                        {sc.extras.map((ex) => (
                                                            <button
                                                                key={ex.label}
                                                                onClick={() => setActiveTab(ex.label === 'SKIM' ? 'skim' : 'deep')}
                                                                className={`flex-1 text-center py-3 text-sm font-black border-2 border-ink shadow-[4px_4px_0px_#000] transition-all cursor-pointer ${
                                                                    (ex.label === 'SKIM' && activeTab === 'skim') || (ex.label === 'DEEP DIVE' && activeTab === 'deep')
                                                                        ? 'bg-primary text-white -translate-y-1 shadow-[6px_6px_0px_#000]'
                                                                        : 'bg-white text-ink opacity-50 hover:opacity-80'
                                                                }`}
                                                            >
                                                                <div>{ex.label}</div>
                                                                <div className="text-[9px] md:text-[10px] font-bold opacity-70 mt-0.5">{ex.desc}</div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <div className="bg-canvas border-2 border-ink/15 p-4 max-h-32 overflow-y-auto transition-all">
                                                        <p className="font-mono text-xs leading-relaxed text-ink/70">
                                                            {activeTab === 'skim' ? SKIM_SAMPLE : DEEP_DIVE_SAMPLE}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Static extras for Quiz */}
                                            {sc.id === 'quiz' && sc.extras && (
                                                <div className="flex gap-4">
                                                    {sc.extras.map((ex) => (
                                                        <div key={ex.label} className={`flex-1 text-center py-3 text-sm font-black border-2 border-ink shadow-[4px_4px_0px_#000] ${ex.bg}`}>
                                                            <div>{ex.label}</div>
                                                            <div className="text-[9px] md:text-[10px] font-bold opacity-70 mt-0.5">{ex.desc}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Toggleable categories for Feed */}
                                            {sc.categories && (
                                                <div>
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {sc.categories.map((cat) => (
                                                            <button
                                                                key={cat}
                                                                onClick={() => toggleCategory(cat)}
                                                                className={`px-3 py-1.5 text-xs font-black border cursor-pointer transition-all ${
                                                                    selectedCategories.has(cat)
                                                                        ? 'bg-primary text-white border-ink shadow-[3px_3px_0px_#121212] -translate-y-0.5'
                                                                        : 'bg-ink text-primary border-primary opacity-50 hover:opacity-100'
                                                                }`}
                                                            >
                                                                {cat}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <p className="font-mono text-[10px] text-ink/40 italic">You&apos;ll choose these during onboarding.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Side info */}
                                    <div className="w-full md:w-52 flex flex-row md:flex-col gap-3">
                                        <div className="flex-1 bg-ink text-white border-2 border-ink p-4 shadow-[4px_4px_0px_#E02020]">
                                            <span className="text-primary font-black text-[10px] block mb-1">SCENE {String(sceneIdx).padStart(2, '0')}/03</span>
                                            <p className="text-xs font-bold opacity-70">Scroll to discover more features.</p>
                                        </div>
                                        <Link href="/register" className="flex-1 bg-primary border-2 border-ink p-4 shadow-[4px_4px_0px_#121212] font-black text-sm uppercase text-center flex items-center justify-center hover:-translate-y-1 transition-all">
                                            SIGN UP →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </main>

            {/* ═══════════ FOOTER ═══════════ */}
            <footer className="p-4 md:p-5 border-t-4 border-ink bg-canvas z-50 relative flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="bg-primary px-2 py-0.5 -rotate-2 border-2 border-ink font-display font-black text-xs uppercase text-white">
                        THE DAILY BRIEF v1.0
                    </div>
                    <p className="text-[9px] md:text-[10px] opacity-40 hidden sm:block">Built with Next.js, FastAPI &amp; Gemini AI. Powered by open RSS feeds.</p>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="flex items-center gap-3 font-mono text-[9px] md:text-[10px] text-ink/40">
                        <span>© 2026 The Daily Brief</span>
                        <Link href="/privacy" className="underline hover:text-ink transition-colors">Privacy</Link>
                        <Link href="/terms" className="underline hover:text-ink transition-colors">Terms</Link>
                    </div>
                    <div className="bg-ink text-primary px-3 py-1 text-[9px] md:text-[10px] font-bold shadow-[4px_4px_0px_#E02020] hide-xs">
                        EST. 2026 // AI_FEED // FREE
                    </div>
                </div>
            </footer>

            {/* Zine styles */}
            <style jsx>{`
                .torn-edge {
                    clip-path: polygon(0% 2%, 5% 0%, 10% 3%, 15% 1%, 20% 4%, 25% 1%, 30% 5%, 35% 2%, 40% 6%, 45% 2%, 50% 5%, 55% 1%, 60% 4%, 65% 1%, 70% 3%, 75% 0%, 80% 4%, 85% 2%, 90% 5%, 95% 1%, 100% 3%, 100% 97%, 95% 100%, 90% 96%, 85% 99%, 80% 95%, 75% 98%, 70% 94%, 65% 98%, 60% 95%, 55% 99%, 50% 96%, 45% 100%, 40% 95%, 35% 98%, 30% 94%, 25% 99%, 20% 96%, 15% 100%, 10% 96%, 5% 99%, 0% 97%);
                }
                .halftone-bg {
                    background-image: radial-gradient(#121212 1px, transparent 0);
                    background-size: 4px 4px;
                    opacity: 0.03;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.15; }
                }
            `}</style>
        </div>
    )
}
