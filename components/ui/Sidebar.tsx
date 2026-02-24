'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Newspaper, Trophy, BookOpen, Settings, Menu, X,
    Sun, Moon, Coffee, User, LogIn, LogOut, Home
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/components/ui/ThemeProvider'

const NAV_ITEMS = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { href: '/quiz', icon: BookOpen, label: 'Quiz' },
    { href: '/profile', icon: Settings, label: 'Settings' },
]

const THEMES = [
    { id: 'paper' as const, icon: Sun, label: 'Paper' },
    { id: 'dark' as const, icon: Moon, label: 'Dark' },
    { id: 'sepia' as const, icon: Coffee, label: 'Sepia' },
]

export function Sidebar() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
    const { theme, setTheme } = useTheme()

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    return (
        <>
            {/* Mobile hamburger */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-4 left-4 z-50 p-2 md:hidden"
                style={{ color: 'var(--ink)' }}
                aria-label="Open menu"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Mobile overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 z-40 md:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-full z-50
                    glass-sidebar flex flex-col
                    w-64 md:w-sidebar
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0
                    transition-transform duration-300 ease-out
                `}
            >
                {/* Header */}
                <div className="p-6 pb-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div
                                className="w-10 h-10 flex items-center justify-center rounded-sm"
                                style={{ backgroundColor: 'var(--ink)' }}
                            >
                                <Newspaper className="w-5 h-5" style={{ color: 'var(--paper)' }} />
                            </div>
                            <div>
                                <h1 className="text-lg font-serif font-bold leading-tight tracking-tight" style={{ color: 'var(--ink)' }}>
                                    The Daily
                                </h1>
                                <span className="text-[0.65rem] uppercase tracking-[0.2em] font-semibold" style={{ color: 'var(--ink-muted)' }}>
                                    Brief
                                </span>
                            </div>
                        </Link>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 md:hidden"
                            style={{ color: 'var(--ink-muted)' }}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="editorial-rule mx-6 !my-0" />

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-sm
                                    text-sm font-medium transition-all duration-200
                                `}
                                style={{
                                    color: isActive ? 'var(--accent)' : 'var(--ink-light)',
                                    backgroundColor: isActive ? 'var(--paper-sunken)' : 'transparent',
                                }}
                            >
                                <item.icon className="w-[18px] h-[18px]" />
                                <span>{item.label}</span>
                                {isActive && (
                                    <div
                                        className="ml-auto w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: 'var(--accent)' }}
                                    />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Theme Switcher */}
                <div className="px-6 py-4">
                    <p className="text-[0.65rem] uppercase tracking-[0.15em] font-semibold mb-3" style={{ color: 'var(--ink-muted)' }}>
                        Theme
                    </p>
                    <div className="flex gap-2">
                        {THEMES.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id)}
                                className="flex-1 flex flex-col items-center gap-1.5 py-2 rounded-sm text-xs font-medium transition-all duration-200"
                                style={{
                                    color: theme === t.id ? 'var(--accent)' : 'var(--ink-muted)',
                                    backgroundColor: theme === t.id ? 'var(--paper-sunken)' : 'transparent',
                                    border: theme === t.id ? '1px solid var(--border-strong)' : '1px solid transparent',
                                }}
                            >
                                <t.icon className="w-4 h-4" />
                                <span>{t.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="editorial-rule mx-6 !my-0" />

                {/* User Section */}
                <div className="p-6 pt-4">
                    {authLoading ? (
                        <div className="h-10 rounded-sm animate-pulse" style={{ backgroundColor: 'var(--paper-sunken)' }} />
                    ) : isAuthenticated && user ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden"
                                    style={{ backgroundColor: 'var(--paper-sunken)', color: 'var(--ink-light)' }}
                                >
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt={user.display_name || 'User'} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-4 h-4" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>
                                        {user.display_name || 'Reader'}
                                    </p>
                                    <p className="text-[0.7rem] truncate" style={{ color: 'var(--ink-muted)' }}>
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 text-xs font-medium w-full px-3 py-2 rounded-sm transition-colors"
                                style={{ color: 'var(--danger)', backgroundColor: 'transparent' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--paper-sunken)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            className="btn-primary w-full text-xs"
                        >
                            <LogIn className="w-3.5 h-3.5" />
                            Sign In
                        </Link>
                    )}
                </div>
            </aside>
        </>
    )
}
