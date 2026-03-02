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

            {/* Mobile Menu Overlay - Comprehensive & Organized */}
            {open && (
                <div className="md:hidden fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-full duration-300 max-h-[90vh] flex flex-col">

                        {/* Sticky Header */}
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
                            <div>
                                <h2 className="text-navy font-black text-xl">Platform Directory</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">The Samaritan Kenya 2027</p>
                            </div>
                            <button onClick={() => setOpen(false)} className="bg-slate-100 p-2.5 rounded-full text-slate-400 hover:text-navy transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="overflow-y-auto p-6 space-y-8 pb-32">

                            {/* Section 1: Quick Actions */}
                            <section>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gold mb-4">Quick Actions</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { href: '/watch-list', label: 'Watch List', sub: 'Flags', icon: '🚩', bg: 'bg-alert/5 border-alert/20 text-alert-dark' },
                                        { href: '/compare', label: 'Comparison', sub: 'Limits', icon: '⚖️', bg: 'bg-navy/5 border-navy/10 text-navy' },
                                        { href: '/community-reports', label: 'Signals', sub: 'Public', icon: '📢', bg: 'bg-navy/5 border-navy/10 text-navy' },
                                        { href: '/reports', label: 'Data Hub', sub: 'Exports', icon: '📑', bg: 'bg-navy/5 border-navy/10 text-navy' },
                                    ].map(item => (
                                        <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
                                            className={`flex flex-col p-4 rounded-2xl border transition-all active:scale-95 ${item.bg}`}>
                                            <span className="text-xl mb-1">{item.icon}</span>
                                            <span className="font-bold text-xs">{item.label}</span>
                                            <span className="text-[9px] opacity-60 font-medium uppercase tracking-tighter">{item.sub}</span>
                                        </Link>
                                    ))}
                                </div>
                            </section>

                            {/* Section 2: Data & Legal */}
                            <section>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gold mb-4">Data & Legal</h3>
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden">
                                    {[
                                        { label: 'Methodology & Sources', href: '/reports' },
                                        { label: 'IEBC Official Portal', href: 'https://www.iebc.or.ke', ext: true },
                                        { label: 'Kenya Law', href: 'https://kenyalaw.org', ext: true },
                                        { label: 'Legal Framework (ECF Act 2013)', href: '/reports' },
                                        { label: 'Privacy Policy', href: '/reports' },
                                        { label: 'Terms of Use', href: '/reports' },
                                    ].map((l, i) => (
                                        <Link key={i} href={l.href} target={l.ext ? "_blank" : "_self"}
                                            className="flex items-center justify-between p-4 text-sm font-medium text-navy border-b border-slate-100 last:border-0 active:bg-slate-100">
                                            {l.label}
                                            <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </Link>
                                    ))}
                                </div>
                            </section>

                            {/* Section 3: Partners */}
                            <section>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gold mb-4">Partners</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['TI Kenya', 'KISP Programme', 'ELGIA', 'URAI Trust', 'CMD Kenya'].map(p => (
                                        <span key={p} className="bg-white border border-slate-200 px-3 py-1.5 rounded-full text-[11px] font-bold text-slate-600 shadow-sm">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </section>

                            {/* Section 4: Contact */}
                            <section>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gold mb-4">Support & Contact</h3>
                                <div className="space-y-3">
                                    <a href="mailto:report@campaignwatch.or.ke" className="flex items-center gap-3 p-4 bg-navy text-white rounded-2xl shadow-lg active:scale-[0.98] transition-transform">
                                        <div className="bg-white/10 p-2 rounded-xl">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold uppercase opacity-60">Email Support</p>
                                            <p className="font-bold text-sm">report@campaignwatch.or.ke</p>
                                        </div>
                                    </a>
                                    <a href="tel:+254203750329" className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 text-navy rounded-2xl active:bg-slate-100 transition-colors">
                                        <div className="bg-navy/5 p-2 rounded-xl">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold uppercase text-slate-400">Call Office</p>
                                            <p className="font-bold text-sm">+254 20 375 0329</p>
                                        </div>
                                    </a>
                                </div>
                            </section>

                            <p className="text-center text-[10px] text-slate-400 font-medium">
                                Independent platform tracking platform political campaign finance integrity.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
