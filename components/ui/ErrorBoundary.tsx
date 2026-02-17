'use client'

import React, { Component, ReactNode } from 'react'
import { RotateCcw } from 'lucide-react'

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
                    <div className="editorial-card p-8 md:p-12 text-center max-w-md">
                        <p
                            className="font-serif text-2xl font-bold mb-3"
                            style={{ color: 'var(--ink)' }}
                        >
                            Something went wrong
                        </p>
                        <p
                            className="text-sm mb-6"
                            style={{ color: 'var(--ink-muted)' }}
                        >
                            An unexpected error occurred while loading this page.
                        </p>
                        <button
                            onClick={this.handleReset}
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Try Again
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
