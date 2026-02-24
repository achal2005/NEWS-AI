'use client'

import { motion } from 'framer-motion'

/**
 * Folding Newspaper Loader
 * 
 * A 3D animated newspaper that unfolds page-by-page with a typewriter text effect.
 * Uses CSS custom properties so it automatically adapts to Paper/Dark/Sepia themes.
 */
export function NewspaperLoader() {
    const pageVariants = {
        folded: (i: number) => ({
            rotateX: -90,
            opacity: 0,
            transition: { delay: i * 0.4, duration: 0.6, ease: [0, 0, 0.2, 1] as const },
        }),
        unfolded: (i: number) => ({
            rotateX: 0,
            opacity: 1,
            transition: { delay: i * 0.4, duration: 0.6, ease: [0, 0, 0.2, 1] as const },
        }),
    }

    return (
        <div className="flex flex-col items-center justify-center py-24">
            {/* 3D Perspective Container */}
            <div style={{ perspective: '800px' }} className="mb-8">
                <div className="flex flex-col items-center gap-1" style={{ transformStyle: 'preserve-3d' }}>
                    {[0, 1, 2].map(i => (
                        <motion.div
                            key={i}
                            custom={i}
                            initial="folded"
                            animate="unfolded"
                            variants={pageVariants}
                            style={{
                                transformOrigin: 'top center',
                                backfaceVisibility: 'hidden',
                            }}
                        >
                            <div
                                className="relative overflow-hidden"
                                style={{
                                    width: `${180 - i * 12}px`,
                                    height: `${60 - i * 4}px`,
                                    backgroundColor: 'var(--paper-raised)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '2px',
                                    boxShadow: `0 ${2 + i}px ${8 + i * 4}px rgba(0,0,0,0.08)`,
                                }}
                            >
                                {/* Fake text lines */}
                                <div className="p-2.5 space-y-1.5">
                                    {i === 0 && (
                                        <>
                                            <div className="h-2.5 rounded-sm" style={{ backgroundColor: 'var(--ink)', width: '75%' }} />
                                            <div className="flex gap-1.5">
                                                <div className="h-1.5 rounded-sm flex-1" style={{ backgroundColor: 'var(--border-strong)' }} />
                                                <div className="h-1.5 rounded-sm flex-1" style={{ backgroundColor: 'var(--border-strong)' }} />
                                            </div>
                                            <div className="h-1.5 rounded-sm" style={{ backgroundColor: 'var(--border)', width: '90%' }} />
                                        </>
                                    )}
                                    {i === 1 && (
                                        <>
                                            <div className="flex gap-1.5">
                                                <div className="h-1.5 rounded-sm flex-1" style={{ backgroundColor: 'var(--border-strong)' }} />
                                                <div className="h-1.5 rounded-sm" style={{ backgroundColor: 'var(--border-strong)', width: '40%' }} />
                                            </div>
                                            <div className="h-1.5 rounded-sm" style={{ backgroundColor: 'var(--border)', width: '80%' }} />
                                            <div className="h-1.5 rounded-sm" style={{ backgroundColor: 'var(--border)', width: '60%' }} />
                                        </>
                                    )}
                                    {i === 2 && (
                                        <>
                                            <div className="h-1.5 rounded-sm" style={{ backgroundColor: 'var(--border-strong)', width: '65%' }} />
                                            <div className="h-1.5 rounded-sm" style={{ backgroundColor: 'var(--border)', width: '85%' }} />
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Typewriter Text */}
            <TypewriterLoader />
        </div>
    )
}

function TypewriterLoader() {
    const text = "Printing today's edition..."

    return (
        <div className="text-center">
            <p className="font-serif text-lg italic" style={{ color: 'var(--ink-muted)' }}>
                {text.split('').map((char, i) => (
                    <motion.span
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 + i * 0.04, duration: 0.1 }}
                    >
                        {char}
                    </motion.span>
                ))}
                <motion.span
                    className="inline-block w-0.5 h-5 ml-0.5 align-text-bottom"
                    style={{ backgroundColor: 'var(--accent)' }}
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                />
            </p>
        </div>
    )
}
