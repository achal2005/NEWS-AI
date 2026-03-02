'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'

const SIDEBAR_HIDDEN_ROUTES = ['/', '/login', '/register', '/onboarding']

export function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const hideSidebar = SIDEBAR_HIDDEN_ROUTES.includes(pathname)

    if (hideSidebar) {
        return <>{children}</>
    }

    return (
        <div className="relative min-h-screen flex bg-canvas text-ink">
            <Sidebar />
            <main className="flex-1 ml-0 md:ml-[280px] flex flex-col min-h-screen relative min-w-0 overflow-x-hidden">
                {children}
            </main>
        </div>
    )
}
