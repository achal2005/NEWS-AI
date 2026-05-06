'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'

const NAV_ITEMS = [
    { href: '/dashboard', icon: 'newspaper', label: 'TODAY' },
    { href: '/leaderboard', icon: 'trophy', label: 'ROSTER' },
    { href: '/quiz', icon: 'bolt', label: 'QUIZ' },
    { href: '/profile', icon: 'settings_b_roll', label: 'SYSTEM' },
]

export function Sidebar() {
    const pathname = usePathname()
    const { user, logout } = useAuth()

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-[280px] fixed h-screen border-r-3 border-ink flex-col bg-paper-grey z-10 overflow-x-hidden"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E\")" }}
            >
                {/* Brand Header */}
                <div className="p-6 pb-8 border-b-3 border-ink bg-primary flex flex-col justify-between items-start">
                    <h1 className="font-display text-4xl leading-none tracking-tight text-ink uppercase font-black">
                        NUTSHELL
                    </h1>
                    <div className="mt-2 inline-flex items-center gap-2 border-2 border-ink bg-white px-2 py-0.5 shadow-hard-sm">
                        <span className="w-2 h-2 rounded-full bg-alert animate-pulse" />
                        <span className="text-[10px] font-bold tracking-wider">ONLINE</span>
                    </div>
                </div>

                {/* Navigation Stack */}
                <nav className="flex-1 flex flex-col py-6 gap-3 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                        if (isActive) {
                            return (
                                <div key={item.href} className="group relative pl-4 pr-0">
                                    {/* Connector hides border */}
                                    <div className="absolute right-[-3px] top-0 bottom-0 w-[4px] bg-canvas z-30" />
                                    <Link
                                        href={item.href}
                                        className="relative z-20 flex items-center justify-between w-full p-4 bg-canvas border-y-3 border-l-3 border-r-0 border-ink shadow-[-4px_4px_0px_0px_#121212] translate-x-[3px] transition-transform"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-[28px] font-bold"
                                                style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>
                                                {item.icon}
                                            </span>
                                            <span className="font-sans font-bold text-lg tracking-wide">{item.label}</span>
                                        </div>
                                        <div className="w-3 h-3 bg-primary border-2 border-ink rounded-full mr-4" />
                                    </Link>
                                </div>
                            )
                        }

                        return (
                            <div key={item.href} className="group px-4">
                                <Link
                                    href={item.href}
                                    className="flex items-center gap-3 w-full p-3 bg-white border-3 border-ink shadow-hard transition-all duration-200 hover:-translate-y-1 hover:shadow-hard-hover hover:bg-primary/20"
                                >
                                    <span className="material-symbols-outlined text-[24px]"
                                        style={{ fontVariationSettings: "'FILL' 0, 'wght' 500" }}>
                                        {item.icon}
                                    </span>
                                    <span className="font-sans font-bold text-lg text-ink/80 group-hover:text-ink">{item.label}</span>
                                </Link>
                            </div>
                        )
                    })}
                </nav>

                {/* User Profile Footer */}
                <div className="mt-auto p-4 border-t-3 border-ink bg-white">
                    {user ? (
                        <div className="flex items-center gap-3 mb-4 p-2 bg-paper-grey border-2 border-ink border-dashed">
                            <div className="w-10 h-10 bg-cool border-2 border-ink flex items-center justify-center text-white font-bold">
                                {user.display_name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-sans font-bold text-sm leading-tight truncate max-w-[140px]">
                                    {user.display_name || 'READER'}
                                </span>
                                <span className="font-mono text-[10px] text-ink/60">LVL 4. INTELLECT</span>
                            </div>
                        </div>
                    ) : null}
                    <div className="flex justify-between items-end">
                        <p className="font-mono text-[10px] text-ink/50 uppercase tracking-widest">
                            V 1.0.4 [BETA]
                        </p>
                        {user ? (
                            <button
                                onClick={logout}
                                className="w-8 h-8 flex items-center justify-center border-2 border-ink bg-canvas hover:bg-alert hover:text-white transition-colors shadow-hard-sm"
                                title="Sign Out"
                            >
                                <span className="material-symbols-outlined text-[18px]">logout</span>
                            </button>
                        ) : null}
                    </div>
                </div>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white border-t-3 border-ink z-50">
                <div className="flex justify-around p-2">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center p-2 ${isActive ? 'text-ink' : 'text-gray-400 hover:text-ink'}`}
                            >
                                {isActive ? (
                                    <div className="size-8 bg-primary border-2 border-ink rounded-full flex items-center justify-center -mt-6 shadow-hard-sm">
                                        <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                                    </div>
                                ) : (
                                    <span className="material-symbols-outlined">{item.icon}</span>
                                )}
                                <span className="text-[10px] font-bold mt-1">{item.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </>
    )
}
