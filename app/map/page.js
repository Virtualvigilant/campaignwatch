'use client'
import { useState } from 'react'
import Link from 'next/link'

// Mock Data for the County "Bottom Sheet"
const COUNTY_DATA = {
    name: 'NAIROBI COUNTY',
    totalSpend: '2.1B',
    candidates: [
        { name: 'Candidate A', risk: 'high', icon: '🔴' },
        { name: 'Candidate B', risk: 'medium', icon: '🟡' },
        { name: 'Candidate C', risk: 'low', icon: '🟢' },
    ]
}

export default function MapPage() {
    const [sheetOpen, setSheetOpen] = useState(false)

    return (
        <div className="relative h-[calc(100vh-140px)] w-full overflow-hidden bg-gray-100 rounded-xl border border-border-subtle flex flex-col items-center justify-center">

            {/* Base Map Graphic Placeholder */}
            <div
                className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center p-6 text-center"
                onClick={() => setSheetOpen(true)}
            >
                <div className="w-32 h-32 opacity-20 bg-accent-kenya rounded-full blur-3xl absolute top-1/3 left-1/3"></div>
                <div className="text-6xl mb-4">🗺️</div>
                <h2 className="text-xl font-bold text-text-primary">Interactive County Map</h2>
                <p className="text-sm text-text-secondary mt-2 max-w-xs">
                    Tap anywhere on the map to view county-level spending and flagged candidates.
                </p>

                <button className="mt-8 px-6 py-2 bg-white border border-border-subtle rounded-full text-sm font-semibold text-text-primary shadow-sm active:scale-95 transition-transform">
                    Tap to simulate NAIROBI
                </button>
            </div>

            {/* Draggable Bottom Sheet Overlay */}
            <div className={`absolute bottom-0 left-0 w-full bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-border-subtle transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${sheetOpen ? 'translate-y-0' : 'translate-y-full'
                }`}>

                {/* Drag Handle */}
                <div
                    className="w-full h-8 flex items-center justify-center cursor-pointer pt-2 pb-6"
                    onClick={() => setSheetOpen(false)}
                >
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                </div>

                <div className="px-6 pb-8">
                    <div className="mb-6">
                        <p className="section-title text-text-secondary mb-1">County Analysis</p>
                        <h3 className="text-2xl font-bold text-text-primary">{COUNTY_DATA.name}</h3>
                        <p className="text-xl font-semibold text-text-primary mt-2 flex items-baseline gap-1">
                            <span className="text-accent-kenya text-sm font-bold">KES</span>
                            {COUNTY_DATA.totalSpend} <span className="text-sm font-normal text-text-secondary">total spend</span>
                        </p>
                    </div>

                    <div className="space-y-3 mb-6">
                        {COUNTY_DATA.candidates.map((c, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-border-subtle">
                                <div className="flex items-center gap-3">
                                    <span className="text-text-secondary font-mono text-sm">{i + 1}.</span>
                                    <span className="font-semibold text-sm">{c.name}</span>
                                </div>
                                <span className="text-lg" title={`Risk: ${c.risk}`}>{c.icon}</span>
                            </div>
                        ))}
                    </div>

                    <Link href="/candidates" className="w-full block text-center btn-primary text-sm shadow-sm">
                        See Full Analysis →
                    </Link>
                </div>
            </div>

        </div>
    )
}
