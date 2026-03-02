'use client'
// components/PrototypeBanner.js — Dismissible yellow prototype disclaimer
import { useState, useEffect } from 'react'

export default function PrototypeBanner() {
    const [dismissed, setDismissed] = useState(true) // start hidden to avoid flash

    useEffect(() => {
        setDismissed(sessionStorage.getItem('proto_banner_dismissed') === 'true')
    }, [])

    function dismiss() {
        sessionStorage.setItem('proto_banner_dismissed', 'true')
        setDismissed(true)
    }

    if (dismissed) return null

    return (
        <div className="bg-gold/10 border-b border-gold/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
                <p className="text-xs text-gold-dark">
                    <strong className="font-bold">⚠️ PROTOTYPE DEMO</strong>
                    <span className="mx-2 text-gold/50">|</span>
                    This platform currently displays simulated data for demonstration purposes.
                    In production, all data is sourced directly from official IEBC filings.
                </p>
                <button onClick={dismiss}
                    className="shrink-0 text-gold-dark hover:text-gold font-bold text-xs p-1 rounded hover:bg-gold/10 transition-colors"
                    aria-label="Dismiss banner">
                    ✕
                </button>
            </div>
        </div>
    )
}
