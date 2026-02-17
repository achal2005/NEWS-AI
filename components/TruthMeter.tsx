'use client';

import React from 'react';

interface TruthMeterProps {
    score: number | null | undefined;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    className?: string;
}

export default function TruthMeter({
    score,
    size = 'md',
    showLabel = true,
    className = ''
}: TruthMeterProps) {
    if (score === null || score === undefined) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--ink-faint)' }} />
                    {showLabel && (
                        <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>Unverified</span>
                    )}
                </div>
            </div>
        );
    }

    const getScoreData = (s: number) => {
        if (s >= 80) return { color: 'var(--success)', label: 'Verified', icon: '✓' };
        if (s >= 60) return { color: '#6B8C42', label: 'Mostly True', icon: '◉' };
        if (s >= 40) return { color: 'var(--warning)', label: 'Mixed', icon: '◐' };
        if (s >= 20) return { color: '#C4641D', label: 'Mostly False', icon: '⚠' };
        return { color: 'var(--danger)', label: 'False', icon: '✕' };
    };

    const data = getScoreData(score);

    const sizes = {
        sm: { container: 'h-4 w-24', text: 'text-xs' },
        md: { container: 'h-6 w-32', text: 'text-sm' },
        lg: { container: 'h-8 w-40', text: 'text-base' }
    };

    const sizeConfig = sizes[size];

    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <div
                className={`relative ${sizeConfig.container} rounded-full overflow-hidden`}
                style={{ backgroundColor: 'var(--paper-sunken)' }}
            >
                <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${score}%`, backgroundColor: data.color }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`font-bold ${sizeConfig.text} drop-shadow-sm`} style={{ color: 'var(--paper)' }}>
                        {score}%
                    </span>
                </div>
            </div>
            {showLabel && (
                <div className={`flex items-center gap-1 ${sizeConfig.text}`} style={{ color: data.color }}>
                    <span>{data.icon}</span>
                    <span className="font-medium">{data.label}</span>
                </div>
            )}
        </div>
    );
}

export function TruthMeterBadge({ score }: { score: number | null | undefined }) {
    if (score === null || score === undefined) {
        return (
            <span
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                style={{
                    backgroundColor: 'var(--paper-sunken)',
                    color: 'var(--ink-muted)',
                    border: '1px solid var(--border)',
                }}
            >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--ink-faint)' }} />
                Unverified
            </span>
        );
    }

    const getColor = (s: number) => {
        if (s >= 70) return 'var(--success)';
        if (s >= 40) return 'var(--warning)';
        return 'var(--danger)';
    };

    const color = getColor(score);

    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{
                backgroundColor: 'var(--paper-sunken)',
                color: color,
                border: `1px solid ${color}`,
            }}
        >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
            {score}%
        </span>
    );
}
