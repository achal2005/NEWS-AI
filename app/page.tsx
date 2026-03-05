'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'

// Pre-warm backend on landing (wakes Render before user navigates to login)
if (typeof window !== 'undefined') {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, { cache: 'no-store' }).catch(() => { })
}
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
        description: 'AI-powered summaries from 100+ sources. Weekly quizzes. A personalized feed — all delivered like a digital zine. Bold, visual, no-nonsense.',
        cta: { text: 'START READING →', href: '/register' },
    },
    {
        id: 'ai-summaries',
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

export default function LandingPage() {
    const [activeScene, setActiveScene] = useState(0)
    const scrollRef = useRef<HTMLDivElement>(null)
    const isTransitioning = useRef(false)

    useEffect(() => {
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

        // Touch support
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
    }, [])

    const scene = SCENES[activeScene]

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
                        <a href="#" onClick={(e) => { e.preventDefault(); setActiveScene(1) }} className="bg-white px-2 py-1 rotate-1 border-2 border-ink hover:bg-primary hover:text-white transition-colors">AI Modes</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); setActiveScene(2) }} className="bg-white px-2 py-1 -rotate-1 border-2 border-ink hover:bg-primary hover:text-white transition-colors">Quiz</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); setActiveScene(3) }} className="bg-white px-2 py-1 rotate-1 border-2 border-ink hover:bg-primary hover:text-white transition-colors">Feed</a>
                    </nav>
                    <Link href="/login" className="hidden sm:block bg-white px-3 py-1.5 border-2 border-ink font-bold text-xs uppercase hover:bg-ink hover:text-white transition-colors">
                        Log In
                    </Link>
                    <Link href="/register" className="bg-ink text-primary px-4 py-2 -rotate-2 shadow-[4px_4px_0px_#E02020] font-black text-xs uppercase hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                        SIGN UP FREE
                    </Link>
                </div>
            </header>

            {/* Vertical scroll indicator */}
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
                                <div className="inline-block bg-primary text-white px-3 py-1 mb-3 font-black text-xs uppercase -rotate-1 border-2 border-ink">
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
                            {/* Decorative floating card */}
                            <div className="hidden lg:block w-48 relative">
                                <div className="border-3 border-ink bg-white p-2 rotate-6 shadow-[8px_8px_0px_#E02020] torn-edge overflow-hidden">
                                    <div className="w-full aspect-[4/5] bg-primary flex flex-col items-center justify-center p-4">
                                        <span className="material-symbols-outlined text-white text-6xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
                                        <p className="text-white font-display font-black text-lg text-center uppercase leading-tight">READ.<br />LEARN.<br />COMPETE.</p>
                                    </div>
                                    <div className="absolute -bottom-1.5 -left-1.5 bg-white border-2 border-ink p-2 -rotate-3 z-10">
                                        <p className="font-black text-[9px]">EDITION_042 // LIVE</p>
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

                                            {/* Extras (mode buttons or categories) */}
                                            {sc.extras && (
                                                <div className="flex gap-4">
                                                    {sc.extras.map((ex) => (
                                                        <div key={ex.label} className={`flex-1 text-center py-3 text-sm font-black border-2 border-ink shadow-[4px_4px_0px_#000] ${ex.bg}`}>
                                                            <div>{ex.label}</div>
                                                            <div className="text-[9px] md:text-[10px] font-bold opacity-70 mt-0.5">{ex.desc}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {sc.categories && (
                                                <div className="flex flex-wrap gap-2">
                                                    {sc.categories.map((cat) => (
                                                        <span key={cat} className="bg-ink text-primary px-3 py-1.5 text-xs font-black border border-primary">{cat}</span>
                                                    ))}
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
            <footer className="p-4 md:p-5 border-t-4 border-ink bg-canvas z-50 relative flex justify-between items-center">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="bg-primary px-2 py-0.5 -rotate-2 border-2 border-ink font-display font-black text-xs uppercase text-white">
                        THE DAILY BRIEF v1.0
                    </div>
                    <p className="text-[9px] md:text-[10px] opacity-40 hidden sm:block">Built with Next.js, FastAPI & Gemini AI. Powered by open RSS feeds.</p>
                </div>
                <div className="bg-ink text-primary px-3 py-1 text-[9px] md:text-[10px] font-bold shadow-[4px_4px_0px_#E02020]">
                    EST. 2026 // AI_FEED // FREE
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
