'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo)
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback

            return (
                <div className="min-h-[50vh] flex items-center justify-center px-8">
                    <div className="bg-white border-3 border-ink shadow-hard p-8 md:p-12 text-center max-w-md">
                        <span className="material-symbols-outlined text-5xl text-alert mb-4 block">error</span>
                        <p className="font-display text-2xl font-bold mb-3">
                            Something went wrong
                        </p>
                        <p className="font-mono text-sm text-ink/60 mb-6">
                            An unexpected error occurred while loading this page.
                        </p>
                        <button
                            onClick={this.handleReset}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary border-3 border-ink shadow-hard font-bold hover:shadow-hard-hover hover:-translate-y-1 transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">refresh</span>
                            Try Again
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
