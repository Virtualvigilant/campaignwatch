'use client'
import { useState } from 'react'

function TrackingLookup() {
    const [code, setCode] = useState('')
    const [status, setStatus] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleLookup = (e) => {
        e.preventDefault()
        if (!code) return

        setLoading(true)
        setStatus(null)

        // Mock status verification (Spec: Pending -> Under Review -> Verified / Rejected)
        setTimeout(() => {
            const statuses = ['Pending', 'Under Review', 'Verified', 'Rejected']
            const mockStatus = statuses[Math.floor(Math.random() * statuses.length)]
            setStatus(mockStatus)
            setLoading(false)
        }, 800)
    }

    return (
        <div className="bg-gray-50 border border-border-subtle rounded-xl p-4 sm:p-6 mb-8 mt-6">
            <h3 className="font-bold text-text-primary mb-2">Check Report Status</h3>
            <p className="text-sm text-text-secondary mb-4">Enter your 6-character tracking code to see moderation status.</p>

            <form onSubmit={handleLookup} className="flex gap-2">
                <input
                    type="text"
                    placeholder="e.g. #K7M9P2"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2 rounded-lg border border-border-subtle focus:ring-2 focus:ring-accent-kenya outline-none uppercase font-mono tracking-wider"
                    maxLength={7}
                />
                <button type="submit" disabled={!code || loading} className="btn-primary whitespace-nowrap px-6 disabled:opacity-50">
                    {loading ? '...' : 'Check'}
                </button>
            </form>

            {status && (
                <div className="mt-4 p-4 bg-white border border-border-subtle rounded-lg flex items-center justify-between animate-fadeIn">
                    <span className="text-sm font-semibold tracking-wide text-text-secondary">STATUS</span>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${status === 'Verified' ? 'bg-green-100 text-risk-low' :
                            status === 'Rejected' ? 'bg-red-100 text-risk-high' :
                                status === 'Under Review' ? 'bg-amber-100 text-risk-medium' :
                                    'bg-gray-100 text-text-secondary'
                        }`}>
                        {status}
                    </span>
                </div>
            )}
        </div>
    )
}

export default function MePage() {
    return (
        <div className="max-w-md mx-auto py-2">

            <div className="mb-8 text-center pt-4">
                <div className="w-20 h-20 bg-gray-100 border-2 border-border-subtle rounded-full flex items-center justify-center text-4xl mx-auto mb-3 shadow-sm">
                    👤
                </div>
                <h1 className="text-2xl font-bold">Guest User</h1>
                <p className="text-sm text-text-secondary mt-1">Anonymous Session</p>
                <div className="inline-flex mt-3 items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-risk-low border border-green-100 text-xs font-semibold">
                    <span className="text-sm border-r pr-1 border-green-200">🔒</span> End-to-end encrypted
                </div>
            </div>

            <TrackingLookup />

            <div className="space-y-4">
                <div className="card !p-0 overflow-hidden text-sm font-medium text-text-primary">
                    <button className="w-full flex items-center justify-between p-4 border-b border-border-subtle hover:bg-gray-50 transition-colors">
                        <span className="flex items-center gap-3"><span className="text-xl">📖</span> How It Works</span>
                        <span className="text-text-secondary">→</span>
                    </button>
                    <button className="w-full flex items-center justify-between p-4 border-b border-border-subtle hover:bg-gray-50 transition-colors">
                        <span className="flex items-center gap-3"><span className="text-xl">🛡️</span> Your Safety</span>
                        <span className="text-text-secondary">→</span>
                    </button>
                    <button className="w-full flex items-center justify-between p-4 border-b border-border-subtle hover:bg-gray-50 transition-colors">
                        <span className="flex items-center gap-3"><span className="text-xl">ℹ️</span> About TI-Kenya</span>
                        <span className="text-text-secondary">→</span>
                    </button>
                    <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                        <span className="flex items-center gap-3"><span className="text-xl">⚙️</span> Settings</span>
                        <span className="text-text-secondary">→</span>
                    </button>
                </div>
            </div>

            {/* Spec Settings Submenu Preview (Static for design) */}
            <div className="mt-8 px-4 py-4 rounded-xl border border-dashed border-gray-300 bg-gray-50">
                <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-3">Settings Preview</h4>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center"><span className="text-text-secondary">Language</span><span className="font-semibold text-accent-kenya">English</span></div>
                    <div className="flex justify-between items-center"><span className="text-text-secondary">Text Size</span><span className="font-semibold text-text-primary">Normal</span></div>
                    <div className="flex justify-between items-center"><span className="text-text-secondary">Low-Bandwidth Mode</span><span className="w-8 h-4 bg-accent-kenya rounded-full relative"><span className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-all"></span></span></div>
                </div>
            </div>

            <div className="mt-12 text-center text-xs text-text-secondary pb-4">
                <p>Data automatically deleted after 90 days.</p>
                <p>No IP addresses or device info logged.</p>
            </div>

        </div>
    )
}
