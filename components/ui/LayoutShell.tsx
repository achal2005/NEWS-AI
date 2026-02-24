'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/ui/Sidebar'

/** Routes where the sidebar should be hidden. */
const SIDEBAR_HIDDEN_ROUTES = ['/', '/login', '/register', '/onboarding']

export function LayoutShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const hideSidebar = SIDEBAR_HIDDEN_ROUTES.includes(pathname)

    if (hideSidebar) {
        return <>{children}</>
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 min-h-screen ml-0 md:ml-sidebar transition-[margin] duration-300">
                {children}
            </main>
        </div>
    )
}
