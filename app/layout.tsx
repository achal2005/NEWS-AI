import type { Metadata } from 'next'
import { Fraunces, Space_Mono, Epilogue } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import { QueryProvider } from '@/components/QueryProvider'
import { ThemeProvider } from '@/components/ui/ThemeProvider'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { LayoutShell } from '@/components/ui/LayoutShell'

// Display: characterful high-contrast editorial serif (masthead + headlines)
const fraunces = Fraunces({
    subsets: ['latin'],
    variable: '--font-display',
    display: 'swap',
    axes: ['opsz', 'SOFT', 'WONK'],
})

// Utility: data, labels, timestamps
const spaceMono = Space_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
    display: 'swap',
    weight: ['400', '700'],
})

// Body: quiet, readable grotesque
const epilogue = Epilogue({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
    weight: ['300', '400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
    title: 'NUTSHELL',
    description: 'The AI news reader that puts the day in a nutshell — summarized, quizzed, and printed like your own daily riso edition.',
    keywords: 'AI, news, reader, summaries, quiz, editorial, risograph, curated',
    openGraph: {
        title: 'NUTSHELL — the day, in a nutshell',
        description: 'AI news summaries, a weekly quiz, and a feed tuned to you.',
        type: 'website',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning className={`${fraunces.variable} ${spaceMono.variable} ${epilogue.variable}`}>
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
