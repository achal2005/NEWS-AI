import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Terms of Service — NUTSHELL',
    description: 'Terms of Service for NutShell AI news reader.',
}

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-canvas text-ink font-mono selection:bg-highlight selection:text-ink">
            <div className="max-w-2xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs text-ink/40 hover:text-ink transition-colors mb-6">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        <span>BACK TO HOME</span>
                    </Link>
                    <div className="bg-ink text-primary px-3 py-1 inline-block font-black text-xs uppercase rotate-1 border-2 border-ink mb-4">
                        Legal
                    </div>
                    <h1 className="font-display font-black text-4xl uppercase tracking-tight">Terms of Service</h1>
                    <p className="text-sm text-ink/50 mt-2">Last updated: April 2026</p>
                </div>

                {/* Content */}
                <div className="space-y-6 border-3 border-ink bg-white p-6 md:p-8 shadow-hard">
                    <section>
                        <h2 className="font-display font-bold text-xl uppercase mb-2 border-b-2 border-ink pb-2">Acceptance of Terms</h2>
                        <p className="text-sm leading-relaxed">
                            By accessing and using NutShell, you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not use the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display font-bold text-xl uppercase mb-2 border-b-2 border-ink pb-2">Service Description</h2>
                        <p className="text-sm leading-relaxed">
                            NutShell is an AI-powered news aggregation and summarization platform. We curate
                            articles from public RSS feeds and generate AI summaries using Google Gemini. The service
                            includes personalized feeds, weekly quizzes, and gamification features.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display font-bold text-xl uppercase mb-2 border-b-2 border-ink pb-2">User Accounts</h2>
                        <p className="text-sm leading-relaxed">
                            You are responsible for maintaining the security of your account credentials. Accounts are
                            created via Google OAuth and are subject to Google&apos;s own terms of service.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display font-bold text-xl uppercase mb-2 border-b-2 border-ink pb-2">Content &amp; Copyright</h2>
                        <p className="text-sm leading-relaxed">
                            News articles are sourced from publicly available RSS feeds. Original article content
                            remains the property of its respective publishers. AI-generated summaries are provided
                            for educational and informational purposes only.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display font-bold text-xl uppercase mb-2 border-b-2 border-ink pb-2">Limitation of Liability</h2>
                        <p className="text-sm leading-relaxed">
                            NutShell is provided &quot;as is&quot; without warranties of any kind. We are not
                            liable for the accuracy of AI-generated content or any decisions made based on
                            information provided by the service.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
