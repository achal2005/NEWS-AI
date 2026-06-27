'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { CountryMarker } from '@/components/ui/Globe/GlobeScene'
import { COUNTRIES } from '@/components/ui/Globe/GlobeScene'

const GlobeScene = dynamic(() => import('@/components/ui/Globe/GlobeScene'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-[3px] border-[#000000] border-t-[#00AAEE] animate-spin mx-auto mb-4" />
                <p className="font-mono text-xs text-[#000000]/50 uppercase tracking-widest">LOADING GLOBE_DATA...</p>
            </div>
        </div>
    ),
})

const CountryNewsPanel = dynamic(() => import('@/components/ui/Globe/CountryNewsPanel'), { ssr: false })

export default function GlobePage() {
    const [selectedCountry, setSelectedCountry] = useState<CountryMarker | null>(null)
    const [hoveredCountry, setHoveredCountry] = useState<CountryMarker | null>(null)
    const [panelOpen, setPanelOpen] = useState(false)

    const handleSelectCountry = useCallback((country: CountryMarker) => {
        setSelectedCountry(country)
        setPanelOpen(true)
    }, [])
    const handleHoverCountry = useCallback((c: CountryMarker) => setHoveredCountry(c), [])
    const handleUnhoverCountry = useCallback(() => setHoveredCountry(null), [])
    const handleClosePanel = useCallback(() => {
        setPanelOpen(false)
        setTimeout(() => setSelectedCountry(null), 500)
    }, [])

    return (
        <div className="min-h-screen flex flex-col relative" style={{ backgroundColor: '#F2F2F2', color: '#000000' }}>
            {/* Halftone texture */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.04] z-0"
                style={{ backgroundImage: 'radial-gradient(#000000 1px, transparent 0)', backgroundSize: '4px 4px' }} />

            {/* ═══ HEADER ═══ */}
            <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b-[3px] border-[#000000] relative z-20"
                style={{ backgroundColor: '#F2F2F2' }}>
                <div className="flex items-center gap-3">
                    <Link href="/dashboard"
                        className="w-8 h-8 border-[3px] border-[#000000] flex items-center justify-center hover:bg-[#00AAEE] transition-colors"
                        style={{ backgroundColor: '#00AAEE', boxShadow: '3px 3px 0px #000000' }}>
                        <span className="material-symbols-outlined text-[#000000] text-lg">arrow_back</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 border-[3px] border-[#000000] rounded-full flex items-center justify-center"
                            style={{ backgroundColor: '#00AAEE' }}>
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-black uppercase tracking-tighter">World Wire</h2>
                    </div>
                </div>
                <nav className="hidden md:flex gap-6 font-mono text-[11px] font-bold uppercase">
                    <span className="text-[#000000]/40">Nodes: {COUNTRIES.length}</span>
                    <span className="text-[#000000]/40">Status: Active</span>
                </nav>
                <div className="flex gap-2">
                    <div className="hidden sm:flex items-center gap-1.5 border-[3px] border-[#000000] px-3 py-1"
                        style={{ backgroundColor: '#00AAEE', boxShadow: '3px 3px 0px #000000' }}>
                        <span className="w-2 h-2 rounded-full bg-[#000000] animate-pulse" />
                        <span className="font-mono text-[10px] font-bold uppercase">LIVE</span>
                    </div>
                </div>
            </header>

            {/* ═══ MAIN ═══ */}
            <main className="flex-1 relative overflow-hidden flex items-center justify-center p-4 lg:p-8">
                {/* Globe */}
                <div className="relative w-full max-w-5xl mx-auto aspect-square md:aspect-[16/10] flex items-center justify-center">
                    {/* Globe canvas in circular frame */}
                    <div className="relative z-10 w-[320px] h-[320px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px] rounded-full border-[3px] border-[#000000] overflow-hidden"
                        style={{ boxShadow: '8px 8px 0px #000000', backgroundColor: '#000000' }}>
                        <GlobeScene
                            selectedCountry={selectedCountry} hoveredCountry={hoveredCountry}
                            onSelectCountry={handleSelectCountry} onHoverCountry={handleHoverCountry}
                            onUnhoverCountry={handleUnhoverCountry}
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 rounded-full pointer-events-none"
                            style={{ background: 'radial-gradient(circle, transparent 60%, rgba(17,17,17,0.3) 100%)' }} />
                    </div>

                    {/* UI Scrap: Stats (top-left) */}
                    <div className="absolute top-2 left-2 md:top-8 md:left-8 z-20 w-44 md:w-56 border-[3px] border-[#000000] p-3 md:p-4"
                        style={{ backgroundColor: '#F2F2F2', boxShadow: '6px 6px 0px #000000', transform: 'rotate(2deg)' }}>
                        <div className="flex items-center justify-between border-b-[3px] border-[#000000] pb-2 mb-3">
                            <span className="font-mono text-[10px] font-bold uppercase">Global_Stats</span>
                            <span className="material-symbols-outlined text-sm">monitoring</span>
                        </div>
                        <div className="space-y-2">
                            <div>
                                <p className="font-mono text-[9px] text-[#000000]/50 uppercase mb-0.5">Active Nations</p>
                                <p className="text-xl md:text-2xl font-black">{COUNTRIES.length}</p>
                            </div>
                            <div>
                                <p className="font-mono text-[9px] text-[#000000]/50 uppercase mb-0.5">Data Streams</p>
                                <p className="text-xl md:text-2xl font-black">2.8B</p>
                            </div>
                        </div>
                    </div>

                    {/* UI Scrap: Stamp Button (bottom-right) */}
                    <div className="absolute bottom-8 right-2 md:bottom-16 md:right-8 z-20" style={{ transform: 'rotate(-3deg)' }}>
                        <button onClick={() => {
                            const randomCountry = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)]
                            handleSelectCountry(randomCountry)
                        }}
                            className="flex flex-col items-center justify-center border-[3px] border-[#000000] px-4 md:px-6 py-3 md:py-4 transition-transform hover:translate-x-1 hover:translate-y-1"
                            style={{ backgroundColor: '#EA8C21', boxShadow: '6px 6px 0px #000000', color: '#F2F2F2' }}>
                            <span className="text-sm md:text-lg font-black uppercase">Tap Any</span>
                            <span className="text-lg md:text-2xl font-black uppercase tracking-widest" style={{ color: '#00AAEE' }}>Country</span>
                        </button>
                    </div>

                    {/* UI Scrap: Transmission Tag */}
                    <div className="hidden md:block absolute top-1/4 right-6 lg:right-16 z-20 border-[3px] border-[#000000] px-3 py-1"
                        style={{ backgroundColor: '#00AAEE', transform: 'rotate(12deg)', boxShadow: '3px 3px 0px #000000' }}>
                        <span className="font-mono text-[10px] font-bold uppercase">Transmission Active</span>
                    </div>

                    {/* UI Scrap: Signal dot */}
                    <div className="hidden md:flex absolute bottom-1/4 left-6 lg:left-16 z-20 w-14 h-14 rounded-full items-center justify-center"
                        style={{ backgroundColor: '#000000', transform: 'rotate(-10deg)' }}>
                        <span className="material-symbols-outlined text-2xl" style={{ color: '#00AAEE' }}>wifi_tethering</span>
                    </div>



                    {/* Hovered country tooltip */}
                    {hoveredCountry && !panelOpen && (
                        <div className="absolute bottom-4 left-4 z-30 animate-fade-in">
                            <div className="border-[3px] border-[#000000] p-2 md:p-3 max-w-xs"
                                style={{ backgroundColor: '#F2F2F2', boxShadow: '4px 4px 0px #000000' }}>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="w-3 h-3 border-[2px] border-[#000000]" style={{ backgroundColor: '#00AAEE' }} />
                                    <span className="font-black text-sm uppercase">{hoveredCountry.name}</span>
                                </div>
                                <p className="font-mono text-[9px] text-[#000000]/50 uppercase tracking-wider">Click to view headlines →</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ═══ COUNTRY BUTTONS ═══ */}
            <div className="relative z-20 border-y-[3px] border-[#000000] bg-[#F2F2F2]">
                <div className="px-3 py-2.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                    <div className="flex gap-1.5 min-w-max">
                        {COUNTRIES.map((c) => (
                            <button key={c.code} onClick={() => handleSelectCountry(c)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 border-[2px] border-[#000000] font-mono text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap
                                    ${selectedCountry?.code === c.code
                                        ? '-translate-y-0.5'
                                        : 'hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#000000]'
                                    }`}
                                style={{
                                    backgroundColor: selectedCountry?.code === c.code ? '#00AAEE' : '#F2F2F2',
                                    boxShadow: selectedCountry?.code === c.code ? '3px 3px 0px #000000' : 'none',
                                }}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#00AAEE', border: '1px solid #000000' }} />
                                {c.code.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ LIVE WIRES TICKER ═══ */}
            <footer className="relative z-20 border-t-[3px] border-[#000000] overflow-hidden" style={{ backgroundColor: '#000000', color: '#F2F2F2' }}>
                <div className="flex items-center">
                    <div className="border-r-[3px] border-[#333] px-3 py-2.5 flex items-center gap-2 shrink-0"
                        style={{ backgroundColor: '#EA8C21' }}>
                        <span className="material-symbols-outlined text-sm animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                        <span className="font-mono text-[11px] font-bold uppercase">Live_Wires</span>
                    </div>
                    <div className="relative flex overflow-x-hidden w-full py-2.5">
                        <div className="animate-marquee whitespace-nowrap flex gap-8 font-mono text-[11px] px-4">
                            <span>&gt; Global transmission sequence initiated. Awaiting input.</span>
                            <span style={{ color: '#00AAEE' }}>&gt; {COUNTRIES.length} nodes synchronized.</span>
                            <span>&gt; Packet loss minimal. Pulse steady at 120ms.</span>
                            <span style={{ color: '#EA8C21' }}>&gt; Warning: Sub-routine anomaly detected in Sector 4.</span>
                            <span>&gt; Click any country node to access local data streams.</span>
                            <span style={{ color: '#00AAEE' }}>&gt; All systems operational. Feed integrity verified.</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ═══ NEWS PANEL ═══ */}
            <CountryNewsPanel country={selectedCountry} isOpen={panelOpen} onClose={handleClosePanel} />
            {panelOpen && <div className="fixed inset-0 bg-black/30 z-40" onClick={handleClosePanel} />}

            <style jsx>{`
                div::-webkit-scrollbar { display: none; }
                @keyframes scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .animate-marquee { animation: scroll-left 30s linear infinite; }
            `}</style>
        </div>
    )
}
