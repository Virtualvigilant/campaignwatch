'use client'
// components/Navbar.js — The Samaritan Navbar with SVG shield logo
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

// ── Inline SVG Shield Logo ─────────────────────────────────────
export function ShieldLogo({ size = 36, white = false }) {
    const navy = white ? '#FFFFFF' : '#1B2A4A'
    const gold = '#F5A623'
    const green = '#2DC653'
    const h = Math.round(size * (40 / 36))
    return (
        <svg width={size} height={h} viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Shield body */}
            <path d="M18 2L4 8v12c0 9.5 6 16 14 18 8-2 14-8.5 14-18V8L18 2z" fill={navy} />
            {/* Green accent stripe at bottom */}
            <path d="M18 37c-1.5-.4-3-1.1-4.3-2C15 36.2 16.5 37 18 37.5c1.5-.5 3-1.3 4.3-2.5C21 36 19.5 36.6 18 37z" fill={green} opacity="0.9" />
            {/* Balance scale — crossbar */}
            <line x1="11" y1="16" x2="25" y2="16" stroke={gold} strokeWidth="1.8" strokeLinecap="round" />
            {/* Balance scale — pillar */}
            <line x1="18" y1="12" x2="18" y2="26" stroke={gold} strokeWidth="1.8" strokeLinecap="round" />
            {/* Balance scale — base */}
            <line x1="14" y1="26" x2="22" y2="26" stroke={gold} strokeWidth="1.8" strokeLinecap="round" />
            {/* Left pan */}
            <path d="M9 17L11 16 13 17" stroke={gold} strokeWidth="1.4" strokeLinecap="round" fill="none" />
            <path d="M9 17C9 19.5 10 21 11 21S13 19.5 13 17" stroke={gold} strokeWidth="1.2" fill="none" />
            {/* Right pan */}
            <path d="M23 17L25 16 27 17" stroke={gold} strokeWidth="1.4" strokeLinecap="round" fill="none" />
            <path d="M23 17C23 19.5 24 21 25 21S27 19.5 27 17" stroke={gold} strokeWidth="1.2" fill="none" />
            {/* Top triangle accent */}
            <circle cx="18" cy="12" r="1.8" fill={gold} />
        </svg>
    )
}

const links = [
    { href: '/', label: 'Dashboard' },
    { href: '/candidates', label: 'Candidates' },
    { href: '/compare', label: '⚖️ Compare' },
    { href: '/watch-list', label: '🚩 Watch List' },
    { href: '/community-reports', label: '📢 Reports' },
    { href: '/ask', label: '🤖 Ask AI' },
    { href: '/reports', label: 'Docs' },
]

export default function Navbar() {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    return (
        <>
            {/* Top Navigation - Desktop (Full) / Mobile (Logo Only) */}
            <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Branding - Enhanced with remote's ShieldLogo but compact for mobile */}
                        <Link href="/" className="flex items-center gap-2">
                            <ShieldLogo size={32} />
                            <span className="text-navy font-black text-lg md:text-xl leading-tight tracking-tight">
                                THE <span className="text-gold">SAMARITAN</span>
                                <span className="hidden md:block text-slate-400 text-[10px] font-medium uppercase tracking-[0.1em]">Kenya Finance Monitor</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {links.map(l => (
                                <Link key={l.href} href={l.href}
                                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all
                                    ${pathname === l.href
                                            ? 'text-gold'
                                            : 'text-slate-600 hover:text-navy hover:bg-slate-50'}`}>
                                    {l.label}
                                </Link>
                            ))}
                            <Link href="/tip-off"
                                className="ml-4 bg-navy text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-navy-light transition-all shadow-sm uppercase tracking-wider">
                                🛡️ Report Violation
                            </Link>
                        </div>

                        {/* Mobile: Version display */}
                        <div className="md:hidden flex items-center">
                            <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-1 rounded-full uppercase tracking-widest">v1.2 Live</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navigation - High visibility 5-tab system */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-1 flex justify-around items-end z-50 pb-safe shadow-[0_-4px_12_rgba(0,0,0,0.05)]">

                <Link href="/" className={`flex flex-col items-center py-2 min-w-[64px] transition-colors ${pathname === '/' ? 'text-gold' : 'text-slate-400'}`}>
                    <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    <span className="text-[9px] font-bold uppercase tracking-tight">Dashboard</span>
                </Link>

                <Link href="/candidates" className={`flex flex-col items-center py-2 min-w-[64px] transition-colors ${pathname === '/candidates' ? 'text-gold' : 'text-slate-400'}`}>
                    <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    <span className="text-[9px] font-bold uppercase tracking-tight">Profiles</span>
                </Link>

                {/* Central Action Button: Report Violation */}
                <Link href="/tip-off" className="relative -mt-6 flex flex-col items-center group">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 border-4 border-white
                        ${pathname === '/tip-off' ? 'bg-alert animate-pulse' : 'bg-navy'}`}>
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-tight mt-1 ${pathname === '/tip-off' ? 'text-alert' : 'text-slate-400'}`}>Report</span>
                </Link>

                <Link href="/ask" className={`flex flex-col items-center py-2 min-w-[64px] transition-colors ${pathname === '/ask' ? 'text-gold' : 'text-slate-400'}`}>
                    <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    <span className="text-[9px] font-bold uppercase tracking-tight">Ask AI</span>
                </Link>

                <button onClick={() => setOpen(!open)} className={`flex flex-col items-center py-2 min-w-[64px] transition-colors ${open ? 'text-gold' : 'text-slate-400'}`}>
                    <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span className="text-[9px] font-bold uppercase tracking-tight">More</span>
                </button>
            </div>

            {/* Mobile Menu Overlay - Clean & Spaced */}
            {open && (
                <div className="md:hidden fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 pb-24 shadow-2xl animate-in slide-in-from-bottom-full duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-navy font-black text-xl">Quick Actions</h2>
                            <button onClick={() => setOpen(false)} className="bg-slate-100 p-2 rounded-full text-slate-400 hover:text-navy">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { href: '/watch-list', label: 'Watch List', sub: 'Flagged Activity', icon: '🚩', highlight: true },
                                { href: '/compare', label: 'Candidate Comparison', sub: 'Against limits', icon: '⚖️' },
                                { href: '/community-reports', label: 'Community Signals', sub: 'Public feed', icon: '📢' },
                                { href: '/reports', label: 'Download Data', sub: 'CSV Exports', icon: '📑' },
                            ].map(item => (
                                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                                    className={`flex flex-col p-4 rounded-2xl border transition-all active:scale-95
                                    ${item.highlight ? 'bg-gold border-gold text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-navy hover:border-gold/30'}`}>
                                    <span className="text-xl mb-2">{item.icon}</span>
                                    <span className="font-bold text-sm leading-tight">{item.label}</span>
                                    <span className={`text-[10px] mt-1 ${item.highlight ? 'text-white/80' : 'text-slate-400'}`}>{item.sub}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
