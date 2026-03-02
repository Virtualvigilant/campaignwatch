'use client'
// components/Navbar.js — UPDATED with all new feature links
// REPLACE your existing components/Navbar.js with this

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

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

                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-gold font-bold text-lg leading-tight">
                            The Samaritan<br />
                            <span className="text-white text-xs font-normal">Protecting Democracy Through Transparency</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        {links.map(l => (
                            <Link key={l.href} href={l.href}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${pathname === l.href
                                        ? 'bg-gold text-white'
                                        : 'text-gray-300 hover:text-white hover:bg-navy-light'}`}>
                                {l.label}
                            </Link>
                        ))}
                        <Link href="/tip-off"
                            className="ml-2 bg-alert text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-alert-dark transition-colors">
                            🛡️ Report Violation
                        </Link>
                    </div>

                    <button onClick={() => setOpen(!open)} className="md:hidden text-gray-300 hover:text-white p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {open
                                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                        </svg>
                    </button>
                </div>
            </div>

            {open && (
                <div className="md:hidden border-t border-navy-light px-4 py-3 space-y-1">
                    {links.map(l => (
                        <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                            className={`block px-4 py-2 rounded-lg text-sm font-medium
                ${pathname === l.href ? 'bg-gold text-white' : 'text-gray-300 hover:text-white'}`}>
                            {l.label}
                        </Link>
                    ))}
                    <Link href="/tip-off" onClick={() => setOpen(false)}
                        className="block px-4 py-2 rounded-lg text-sm font-medium bg-alert text-white">
                        🛡️ Report Violation
                    </Link>
                </div>
            )}
        </nav>
    )
}
