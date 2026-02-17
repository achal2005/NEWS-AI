'use client';

import React from 'react';

interface SummaryModeToggleProps {
    mode: 'kid' | 'pro';
    onModeChange: (mode: 'kid' | 'pro') => void;
    disabled?: boolean;
    className?: string;
}

export default function SummaryModeToggle({
    mode,
    onModeChange,
    disabled = false,
    className = ''
}: SummaryModeToggleProps) {
    const isKidMode = mode === 'kid';

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-muted)' }}>
                Mode
            </span>
            <button
                onClick={() => onModeChange(isKidMode ? 'pro' : 'kid')}
                disabled={disabled}
                className={`
                    relative flex items-center h-10 px-1 py-1 rounded-sm
                    transition-all duration-300 ease-out
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                style={{
                    border: '1px solid var(--border-strong)',
                    backgroundColor: 'var(--paper-sunken)',
                }}
                aria-label={`Switch to ${isKidMode ? 'Pro' : 'Kid'} mode`}
            >
                <span
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-sm font-medium transition-all duration-300"
                    style={{
                        backgroundColor: isKidMode ? 'var(--ink)' : 'transparent',
                        color: isKidMode ? 'var(--paper)' : 'var(--ink-muted)',
                    }}
                >
                    🎈 Kid
                </span>
                <span
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-sm font-medium transition-all duration-300"
                    style={{
                        backgroundColor: !isKidMode ? 'var(--ink)' : 'transparent',
                        color: !isKidMode ? 'var(--paper)' : 'var(--ink-muted)',
                    }}
                >
                    🎯 Pro
                </span>
            </button>
        </div>
    );
}

export function ModeSwitch({
    mode,
    onModeChange,
    size = 'md'
}: {
    mode: 'kid' | 'pro';
    onModeChange: (mode: 'kid' | 'pro') => void;
    size?: 'sm' | 'md';
}) {
    const isKidMode = mode === 'kid';

    const sizes = {
        sm: 'h-7 text-xs',
        md: 'h-9 text-sm'
    };

    return (
        <div
            className={`inline-flex rounded-sm p-0.5 ${sizes[size]}`}
            style={{
                backgroundColor: 'var(--paper-sunken)',
                border: '1px solid var(--border)',
            }}
        >
            <button
                onClick={() => onModeChange('kid')}
                className="flex items-center gap-1 px-3 rounded-sm font-medium transition-all"
                style={{
                    backgroundColor: isKidMode ? 'var(--ink)' : 'transparent',
                    color: isKidMode ? 'var(--paper)' : 'var(--ink-muted)',
                }}
            >
                🎈 Kid
            </button>
            <button
                onClick={() => onModeChange('pro')}
                className="flex items-center gap-1 px-3 rounded-sm font-medium transition-all"
                style={{
                    backgroundColor: !isKidMode ? 'var(--ink)' : 'transparent',
                    color: !isKidMode ? 'var(--paper)' : 'var(--ink-muted)',
                }}
            >
                🎯 Pro
            </button>
        </div>
    );
}

export function ModeBadge({ mode }: { mode: 'kid' | 'pro' }) {
    const isKidMode = mode === 'kid';

    return (
        <span
            className="inline-flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-medium"
            style={{
                backgroundColor: 'var(--paper-sunken)',
                color: 'var(--ink-light)',
                border: '1px solid var(--border)',
            }}
        >
            {isKidMode ? '🎈 Kid Mode' : '🎯 Pro Mode'}
        </span>
    );
}
