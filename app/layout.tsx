import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { LayoutShell } from '@/components/ui/LayoutShell'

const playfair = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-playfair',
    display: 'swap',
    weight: ['400', '500', '600', '700', '800', '900'],
})

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
    weight: ['300', '400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
    title: 'The Daily Brief | AI-Curated Intelligence',
    description: 'A premium AI-powered news platform delivering curated intelligence with personalized summaries, fact-checking, and editorial rigor.',
    keywords: 'AI, news, editorial, intelligence, summaries, curated, fact-check',
    openGraph: {
        title: 'The Daily Brief | AI-Curated Intelligence',
        description: 'Premium news summaries powered by artificial intelligence',
        type: 'website',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${playfair.variable} ${inter.variable}`} data-theme="paper">
            <body className="min-h-screen antialiased font-sans">
                <AuthProvider>
                    <ThemeProvider>
                        <LayoutShell>
                            <ErrorBoundary>
                                {children}
                            </ErrorBoundary>
                        </LayoutShell>
                    </ThemeProvider>
                </AuthProvider>
            </body>
        </html>
    )
}

