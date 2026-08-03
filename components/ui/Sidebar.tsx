'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'

const NAV_ITEMS = [
    { href: '/dashboard', icon: 'newspaper', label: 'Today', tag: 'ED.01' },
    { href: '/leaderboard', icon: 'trophy', label: 'Roster', tag: 'ED.02' },
    { href: '/quiz', icon: 'bolt', label: 'Quiz', tag: 'ED.03' },
    { href: '/profile', icon: 'settings_b_roll', label: 'System', tag: 'ED.04' },
]

export function Sidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()

    return (
        <>
            {/* ── Desktop Sidebar ── */}
            <aside className="hidden md:flex w-[280px] fixed h-screen border-r-2 border-ink flex-col bg-paper-grey z-10 overflow-x-hidden paper-grain">
                {/* Masthead */}
                <div className="px-6 pt-7 pb-6 border-b-2 border-ink">
                    <p className="font-mono text-[10px] tracking-[0.3em] text-ink/45 uppercase mb-1.5">
                        The AI Daily
                    </p>
                    <h1 className="font-display font-black text-[2.9rem] leading-[0.82] tracking-tight">
                        Nut<span className="text-primary">shell</span>
                    </h1>
                    <div className="mt-3 inline-flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                        <span className="font-mono text-[10px] font-bold tracking-[0.2em] text-ink/55 uppercase">Press running</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 flex flex-col py-5 gap-1 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group relative flex items-center gap-3 mx-3 px-4 py-3 border-2 transition-all duration-150 ${isActive
                                    ? 'bg-ink text-canvas border-ink'
                                    : 'bg-transparent text-ink border-transparent hover:border-ink hover:bg-surface'
                                    }`}
                            >
                                {/* active spine */}
                                <span
                                    className={`absolute left-0 top-0 bottom-0 w-1.5 bg-secondary transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'
                                        }`}
                                />
                                <span
                                    className="material-symbols-outlined text-[22px]"
                                    style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}, 'wght' ${isActive ? 700 : 500}` }}
                                >
                                    {item.icon}
                                </span>
                                <span className="font-display font-bold text-lg tracking-tight">{item.label}</span>
                                <span
                                    className={`ml-auto font-mono text-[9px] tracking-widest ${isActive ? 'text-secondary' : 'text-ink/30'
                                        }`}
                                >
                                    {item.tag}
                                </span>
                            </Link>
                        )
                    })}
                </nav>

                {/* User footer */}
                <div className="mt-auto p-4 border-t-2 border-ink bg-surface">
                    {user ? (
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-primary border-2 border-ink flex items-center justify-center text-canvas font-display font-black text-lg">
                                {user.display_name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="font-display font-bold text-sm leading-tight truncate max-w-[150px]">
                                    {user.display_name || 'Reader'}
                                </span>
                                <span className="font-mono text-[10px] text-ink/50 tracking-wide">SUBSCRIBER</span>
                            </div>
                        </div>
                    ) : null}
                    <div className="flex justify-between items-center">
                        <p className="font-mono text-[10px] text-ink/40 uppercase tracking-widest">
                            Vol.1 · No.4
                        </p>
                        {user ? (
                            <button
                                onClick={logout}
                                className="flex items-center gap-1.5 px-2 py-1 border-2 border-ink bg-canvas font-mono text-[10px] font-bold tracking-wide hover:bg-secondary hover:text-canvas hover:border-ink transition-colors"
                                title="Sign out"
                            >
                                <span className="material-symbols-outlined text-[14px]">logout</span>
                                OUT
                            </button>
                        ) : null}
                    </div>
                </div>
            </aside>

            {/* ── Mobile Bottom Nav ── */}
            <nav className="md:hidden fixed bottom-0 w-full bg-surface border-t-2 border-ink z-50">
                <div className="flex justify-around px-2 py-1.5">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 ${isActive ? 'text-ink' : 'text-ink/40'}`}
                            >
                                <span
                                    className="material-symbols-outlined text-[24px]"
                                    style={{ fontVariationSettings: `'FILL' ${isActive ? 1 : 0}, 'wght' ${isActive ? 700 : 400}` }}
                                >
                                    {item.icon}
                                </span>
                                <span className="font-mono text-[9px] font-bold tracking-wider uppercase">{item.label}</span>
                                <span className={`h-0.5 w-5 ${isActive ? 'bg-secondary' : 'bg-transparent'}`} />
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </>
    )
}
