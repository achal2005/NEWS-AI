'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Newspaper, Sparkles, Brain, Trophy, ArrowRight, Zap } from 'lucide-react'
import { useAuth } from '@/lib/auth'

const FEATURES = [
    {
        icon: Newspaper,
        title: 'Aggregate',
        description: 'We pull the latest headlines from top news sources around the globe, every 6 hours.',
        color: 'var(--accent)',
    },
    {
        icon: Brain,
        title: 'AI Summarize',
        description: 'Gemini AI crafts executive briefs for pros and fun recaps for kids — your choice.',
        color: 'var(--success)',
    },
    {
        icon: Trophy,
        title: 'Quiz & Learn',
        description: 'Test your knowledge with AI-generated quizzes and climb the weekly leaderboard.',
        color: 'var(--warning)',
    },
]

/* ─── Scroll-linked section wrapper ─────────────────────────── */
function ScrollSection({
    children,
    className = '',
}: {
    children: React.ReactNode
    className?: string
    fadeOut?: boolean
}) {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    })

    // Content fades in as section enters viewport
    // If fadeOut is true (default), also fades out as it leaves the top
    const fadeOut = arguments[0].fadeOut !== false
    const opacity = useTransform(
        scrollYProgress,
        fadeOut ? [0, 0.2, 0.8, 1] : [0, 0.2, 1],
        fadeOut ? [0, 1, 1, 0] : [0, 1, 1]
    )
    const y = useTransform(
        scrollYProgress,
        fadeOut ? [0, 0.2, 0.8, 1] : [0, 0.2, 1],
        fadeOut ? [60, 0, 0, -40] : [60, 0, 0]
    )

    return (
        <div ref={ref} className={className}>
            <motion.div style={{ opacity, y }}>
                {children}
            </motion.div>
        </div>
    )
}

export default function LandingPage() {
    const { isAuthenticated, isLoading } = useAuth()
    const heroRef = useRef<HTMLDivElement>(null)

    // Hero section: scroll-linked parallax — fades & rises as user scrolls down
    const { scrollYProgress: heroProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    })
    const heroOpacity = useTransform(heroProgress, [0, 0.7], [1, 0])
    const heroY = useTransform(heroProgress, [0, 0.7], [0, -120])
    const heroScale = useTransform(heroProgress, [0, 0.7], [1, 0.95])

    // Features section ref for stagger
    const featuresRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress: featuresProgress } = useScroll({
        target: featuresRef,
        offset: ['start end', 'end start'],
    })

    // Modes section ref for sliding cards
    const modesRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress: modesProgress } = useScroll({
        target: modesRef,
        offset: ['start end', 'end start'],
    })
    const kidX = useTransform(modesProgress, [0, 0.3, 0.7, 1], [-80, 0, 0, -40])
    const proX = useTransform(modesProgress, [0, 0.3, 0.7, 1], [80, 0, 0, 40])
    const modesOpacity = useTransform(modesProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

    return (
        <div className="relative" style={{ backgroundColor: 'var(--paper)' }}>

            {/* ── Hero Section ────────────────────────────────── */}
            <div ref={heroRef} className="min-h-screen relative">
                <motion.section
                    style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
                    className="min-h-screen flex flex-col items-center justify-center text-center px-6 sticky top-0"
                >
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.3em] mb-6" style={{ color: 'var(--ink-muted)' }}>
                            AI-Powered News Intelligence
                        </p>

                        <h1
                            className="font-serif text-6xl sm:text-7xl md:text-9xl font-black tracking-tight leading-[0.9] mb-6"
                            style={{ color: 'var(--ink)' }}
                        >
                            THE DAILY
                            <br />
                            <span style={{ color: 'var(--accent)' }}>BRIEF</span>
                        </h1>

                        <p
                            className="text-lg sm:text-xl font-serif italic max-w-2xl mx-auto mb-10"
                            style={{ color: 'var(--ink-light)' }}
                        >
                            &quot;All the News That&apos;s Fit to Print, Summarized by AI&quot;
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            {!isLoading && !isAuthenticated ? (
                                <Link href="/login" className="btn-primary text-base px-8 py-4 group">
                                    <Zap className="w-5 h-5" />
                                    Sign In with Google
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            ) : !isLoading && isAuthenticated ? (
                                <Link href="/dashboard" className="btn-primary text-base px-8 py-4 group">
                                    Go to Dashboard
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            ) : null}
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <motion.div
                        className="absolute bottom-10"
                        animate={{ y: [0, 12, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <div className="w-6 h-10 border-2 rounded-full flex justify-center pt-2" style={{ borderColor: 'var(--ink-muted)' }}>
                            <motion.div
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: 'var(--ink-muted)' }}
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </div>
                    </motion.div>
                </motion.section>
            </div>

            {/* ── How It Works ────────────────────────────────── */}
            <ScrollSection className="py-32 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--accent)' }}>
                            How It Works
                        </p>
                        <h2 className="font-serif text-4xl md:text-5xl font-bold" style={{ color: 'var(--ink)' }}>
                            News, Reimagined
                        </h2>
                    </div>

                    <div ref={featuresRef} className="grid md:grid-cols-3 gap-8">
                        {FEATURES.map((feature, i) => {
                            return (
                                <FeatureCard
                                    key={feature.title}
                                    feature={feature}
                                    index={i}
                                    scrollProgress={featuresProgress}
                                />
                            )
                        })}
                    </div>
                </div>
            </ScrollSection>

            {/* ── Kid vs Pro Showcase ─────────────────────────── */}
            <div ref={modesRef} className="py-32 px-6">
                <motion.div style={{ opacity: modesOpacity }} className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--accent)' }}>
                            Two Reading Modes
                        </p>
                        <h2 className="font-serif text-4xl md:text-5xl font-bold" style={{ color: 'var(--ink)' }}>
                            Kid Mode vs Pro Mode
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {/* Kid Mode Card — slides in from left */}
                        <motion.div
                            style={{ x: kidX }}
                            className="editorial-card p-8 relative overflow-hidden"
                        >
                            <div className="text-5xl mb-4">🎈</div>
                            <h3 className="font-serif text-2xl font-bold mb-3" style={{ color: 'var(--ink)' }}>
                                Kid Mode
                            </h3>
                            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--ink-light)' }}>
                                Fun, emoji-filled summaries with simple words a 5th grader would love.
                                Includes &quot;Did You Know?&quot; facts and thinking questions.
                            </p>
                            <div className="p-4 rounded-sm text-sm italic" style={{ backgroundColor: 'var(--paper-sunken)', color: 'var(--ink-light)' }}>
                                🚀 Scientists found a way to make batteries that last way longer!
                                Think of it like a phone that only needs charging once a week...
                            </div>
                        </motion.div>

                        {/* Pro Mode Card — slides in from right */}
                        <motion.div
                            style={{ x: proX }}
                            className="editorial-card p-8 relative overflow-hidden"
                        >
                            <div className="text-5xl mb-4">🎯</div>
                            <h3 className="font-serif text-2xl font-bold mb-3" style={{ color: 'var(--ink)' }}>
                                Pro Mode
                            </h3>
                            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--ink-light)' }}>
                                Bloomberg-style executive briefs with market impact analysis,
                                data points, and forward-looking catalysts.
                            </p>
                            <div className="p-4 rounded-sm text-sm" style={{ backgroundColor: 'var(--paper-sunken)', color: 'var(--ink-light)' }}>
                                <p className="mb-1"><strong>HEADLINE:</strong> SolidEnergy&apos;s lithium-metal prototype triples energy density...</p>
                                <p><strong>MARKET IMPACT:</strong> EV battery sector catalyzed; legacy lithium-ion...</p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            {/* ── Final CTA ───────────────────────────────────── */}
            <ScrollSection className="py-32 px-6 text-center" fadeOut={false}>
                <Sparkles className="w-10 h-10 mx-auto mb-6" style={{ color: 'var(--accent)' }} />
                <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--ink)' }}>
                    Ready to Stay Informed?
                </h2>
                <p className="text-lg font-serif italic max-w-xl mx-auto mb-10" style={{ color: 'var(--ink-light)' }}>
                    Join thousands of readers getting smarter with AI-curated news
                </p>
                {!isLoading && !isAuthenticated ? (
                    <Link href="/login" className="btn-primary text-base px-10 py-4 inline-flex items-center gap-3">
                        <Zap className="w-5 h-5" />
                        Get Started — It&apos;s Free
                    </Link>
                ) : !isLoading && isAuthenticated ? (
                    <Link href="/dashboard" className="btn-primary text-base px-10 py-4 inline-flex items-center gap-3">
                        Go to Dashboard
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                ) : null}
            </ScrollSection>

            {/* ── Footer ──────────────────────────────────────── */}
            <footer className="py-8 px-6 text-center">
                <p className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                    © {new Date().getFullYear()} The Daily Brief · Powered by Gemini AI
                </p>
            </footer>
        </div>
    )
}

/* ─── Feature card with scroll-linked stagger ──────────────── */
function FeatureCard({
    feature,
    index,
    scrollProgress,
}: {
    feature: typeof FEATURES[0]
    index: number
    scrollProgress: any
}) {
    const delay = index * 0.08
    const opacity = useTransform(
        scrollProgress,
        [0 + delay, 0.2 + delay, 0.75, 1],
        [0, 1, 1, 0]
    )
    const y = useTransform(
        scrollProgress,
        [0 + delay, 0.2 + delay, 0.75, 1],
        [50, 0, 0, -30]
    )

    return (
        <motion.div
            style={{ opacity, y }}
            className="editorial-card p-8 text-center group"
        >
            <div className="relative w-16 h-16 mx-auto mb-6 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <div
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: feature.color, opacity: 0.15 }}
                />
                <feature.icon className="w-7 h-7 relative z-10" style={{ color: feature.color }} />
            </div>
            <h3 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--ink)' }}>
                {feature.title}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-light)' }}>
                {feature.description}
            </p>
        </motion.div>
    )
}
