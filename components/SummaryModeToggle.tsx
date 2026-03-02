'use client'

interface SummaryModeToggleProps {
    mode: string
    onModeChange: (mode: string) => void
}

export default function SummaryModeToggle({ mode, onModeChange }: SummaryModeToggleProps) {
    return (
        <div className="flex items-center gap-4 bg-white border-3 border-ink p-2 shadow-hard rounded-full">
            <span className={`font-bold text-sm pl-2 ${mode === 'kid' ? 'text-ink' : 'text-gray-400'}`}>
                SKIM
            </span>

            {/* Custom Toggle */}
            <button
                onClick={() => onModeChange(mode === 'kid' ? 'pro' : 'kid')}
                className="relative w-20 h-10 rounded-full border-3 border-ink bg-paper-grey flex items-center cursor-pointer transition-colors duration-200"
                aria-label={`Switch to ${mode === 'kid' ? 'DEEP' : 'SKIM'} mode`}
            >
                <div
                    className="w-8 h-8 bg-primary border-3 border-ink rounded-full absolute transition-all duration-300 shadow-sm z-10"
                    style={{ left: mode === 'pro' ? 'calc(100% - 2.2rem)' : '2px' }}
                />
            </button>

            <span className={`font-bold text-sm pr-2 ${mode === 'pro' ? 'text-ink' : 'text-gray-400'}`}>
                DEEP
            </span>
        </div>
    )
}
