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
        <nav className="bg-navy shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo + Brand */}
                    <Link href="/" className="flex items-center gap-2.5">
                        <ShieldLogo size={34} />
                        <span className="leading-tight">
                            <span className="text-gold font-bold text-base block">The Samaritan</span>
                            <span className="text-gray-400 text-[10px] font-medium tracking-wide">Protecting Democracy Through Transparency</span>
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden lg:flex items-center gap-0.5">
                        {links.map(l => {
                            const active = pathname === l.href
                            return (
                                <Link key={l.href} href={l.href}
                                    className={`px-3 py-2 text-sm font-medium transition-colors relative
                    ${active
                                            ? 'text-gold'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5 rounded-lg'}`}>
                                    {l.label}
                                    {active && (
                                        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gold rounded-full" />
                                    )}
                                </Link>
                            )
                        })}
                        <Link href="/tip-off"
                            className="ml-3 bg-alert text-white text-sm font-semibold px-4 py-2 rounded-lg
                         hover:bg-alert-dark transition-colors">
                            🛡️ Report Violation
                        </Link>
                    </div>

                    {/* Hamburger */}
                    <button onClick={() => setOpen(!open)} className="lg:hidden text-gray-300 hover:text-white p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {open
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="lg:hidden border-t border-navy-light">
                    {/* Mobile header with logo */}
                    <div className="px-5 py-3 border-b border-navy-light flex items-center gap-2">
                        <ShieldLogo size={24} />
                        <span className="text-gold font-bold text-sm">The Samaritan</span>
                    </div>

                    {/* Nav links */}
                    <div className="px-4 py-3 space-y-1">
                        {links.map(l => {
                            const active = pathname === l.href
                            return (
                                <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                                    className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${active
                                            ? 'text-gold border-l-2 border-gold bg-white/5'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5'}`}>
                                    {l.label}
                                </Link>
                            )
                        })}
                    </div>

                    {/* Divider + Report button */}
                    <div className="px-4 pb-4 border-t border-navy-light pt-3">
                        <Link href="/tip-off" onClick={() => setOpen(false)}
                            className="block w-full text-center bg-alert text-white text-sm font-bold px-4 py-3 rounded-xl
                         hover:bg-alert-dark transition-colors">
                            🛡️ Report a Violation
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    )
}
