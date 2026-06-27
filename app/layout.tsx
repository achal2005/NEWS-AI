import type { Metadata } from 'next'
import { Space_Grotesk, Space_Mono, Epilogue } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import { QueryProvider } from '@/components/QueryProvider'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { LayoutShell } from '@/components/ui/LayoutShell'

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    variable: '--font-space-grotesk',
    display: 'swap',
    weight: ['300', '400', '500', '600', '700'],
})

const spaceMono = Space_Mono({
    subsets: ['latin'],
    variable: '--font-space-mono',
    display: 'swap',
    weight: ['400', '700'],
})

const epilogue = Epilogue({
    subsets: ['latin'],
    variable: '--font-epilogue',
    display: 'swap',
    weight: ['300', '400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: 'NUTSHELL',
    description: 'AI-powered news ecosystem with a neo-zine brutalist interface. Curated intelligence, gamified reading, and personalized summaries.',
    keywords: 'AI, news, zine, brutalist, intelligence, summaries, curated',
    openGraph: {
        title: 'NUTSHELL',
        description: 'AI-powered news with a neo-zine brutalist interface',
        type: 'website',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning className={`${spaceGrotesk.variable} ${spaceMono.variable} ${epilogue.variable}`}>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
            </head>
            <body className="min-h-screen font-sans bg-canvas text-ink antialiased selection:bg-highlight selection:text-ink">
                {/* Noise texture overlay */}
                <div className="noise-overlay" />
                <AuthProvider>
                    <QueryProvider>
                        <ThemeProvider>
                            <LayoutShell>
                                <ErrorBoundary>
                                    {children}
                                </ErrorBoundary>
                            </LayoutShell>
                        </ThemeProvider>
                    </QueryProvider>
                </AuthProvider>
            </body>
        </html>
    )
}
