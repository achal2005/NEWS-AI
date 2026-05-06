import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Privacy Policy — NUTSHELL',
    description: 'Privacy Policy for NutShell AI news reader.',
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-canvas text-ink font-mono selection:bg-highlight selection:text-ink">
            <div className="max-w-2xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs text-ink/40 hover:text-ink transition-colors mb-6">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        <span>BACK TO HOME</span>
                    </Link>
                    <div className="bg-primary text-white px-3 py-1 inline-block font-black text-xs uppercase -rotate-1 border-2 border-ink mb-4">
                        Legal
                    </div>
                    <h1 className="font-display font-black text-4xl uppercase tracking-tight">Privacy Policy</h1>
                    <p className="text-sm text-ink/50 mt-2">Last updated: April 2026</p>
                </div>

                {/* Content */}
                <div className="space-y-6 border-3 border-ink bg-white p-6 md:p-8 shadow-hard">
                    <section>
                        <h2 className="font-display font-bold text-xl uppercase mb-2 border-b-2 border-ink pb-2">Information We Collect</h2>
                        <p className="text-sm leading-relaxed">
                            When you create an account via Google OAuth, we collect your email address and display name.
                            We also store your reading preferences, quiz scores, and interaction data to personalize your experience.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display font-bold text-xl uppercase mb-2 border-b-2 border-ink pb-2">How We Use Your Data</h2>
                        <p className="text-sm leading-relaxed">
                            Your data is used solely to power your personalized news feed, generate relevant quizzes,
                            and track your reading progress. We do not sell your personal information to third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display font-bold text-xl uppercase mb-2 border-b-2 border-ink pb-2">AI Processing</h2>
                        <p className="text-sm leading-relaxed">
                            Article summaries are generated using Google Gemini AI. Your reading preferences may be used
                            to improve summary quality. No personal data is shared with AI providers beyond what is
                            necessary for generating summaries.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-display font-bold text-xl uppercase mb-2 border-b-2 border-ink pb-2">Contact</h2>
                        <p className="text-sm leading-relaxed">
                            For privacy-related questions, please reach out through our project repository.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
