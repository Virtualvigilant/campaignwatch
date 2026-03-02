// components/Footer.js — Production 4-column footer
import Link from 'next/link'
import { ShieldLogo } from './Navbar'

const platformLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/candidates', label: 'Candidates' },
    { href: '/watch-list', label: 'Watch List' },
    { href: '/compare', label: 'Compare Candidates' },
    { href: '/community-reports', label: 'Reports & Data' },
    { href: '/ask', label: 'Ask AI' },
    { href: '/tip-off', label: 'Report a Violation' },
]

const legalLinks = [
    { href: '/reports', label: 'Methodology & Sources', ext: false },
    { href: 'https://www.iebc.or.ke', label: 'IEBC Official Portal', ext: true },
    { href: 'https://kenyalaw.org', label: 'Kenya Law', ext: true },
]

const partners = [
    'TI Kenya (Transparency International Kenya)',
    'KISP Programme',
    'ELGIA',
    'URAI Trust',
    'CMD Kenya',
]

export default function Footer() {
    return (
        <footer className="bg-navy mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* Column 1 — Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2.5">
                            <ShieldLogo size={30} white />
                            <span className="text-gold font-bold text-base">The Samaritan</span>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Protecting Democracy Through Transparency
                        </p>
                        <p className="text-gray-500 text-xs leading-relaxed">
                            An independent platform tracking political campaign finance
                            integrity ahead of Kenya&apos;s August 2027 General Election.
                        </p>
                        <div className="flex gap-3 pt-1">
                            <a href="https://twitter.com/CampaignWatchKE" target="_blank" rel="noopener noreferrer"
                                className="text-gray-500 hover:text-gold transition-colors" aria-label="Twitter/X">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            <a href="https://facebook.com/CampaignWatchKE" target="_blank" rel="noopener noreferrer"
                                className="text-gray-500 hover:text-gold transition-colors" aria-label="Facebook">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Column 2 — Platform */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gold mb-4">Platform</h4>
                        <ul className="space-y-2">
                            {platformLinks.map(l => (
                                <li key={l.href}>
                                    <Link href={l.href} className="text-gray-400 text-sm hover:text-white transition-colors">
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3 — Legal & Data */}
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gold mb-4">Data & Legal</h4>
                        <ul className="space-y-2">
                            {legalLinks.map(l => (
                                <li key={l.href}>
                                    {l.ext ? (
                                        <a href={l.href} target="_blank" rel="noopener noreferrer"
                                            className="text-gray-400 text-sm hover:text-white transition-colors inline-flex items-center gap-1">
                                            {l.label}
                                            <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    ) : (
                                        <Link href={l.href} className="text-gray-400 text-sm hover:text-white transition-colors">
                                            {l.label}
                                        </Link>
                                    )}
                                </li>
                            ))}
                            <li>
                                <Link href="/reports" className="text-gray-400 text-sm hover:text-white transition-colors">
                                    Legal Framework (ECF Act 2013)
                                </Link>
                            </li>
                            <li>
                                <Link href="/reports" className="text-gray-400 text-sm hover:text-white transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/reports" className="text-gray-400 text-sm hover:text-white transition-colors">
                                    Terms of Use
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4 — Partners & Contact */}
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-gold mb-4">Partners</h4>
                            <ul className="space-y-1.5">
                                {partners.map(p => (
                                    <li key={p} className="text-gray-400 text-sm">{p}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-gold mb-3">Contact</h4>
                            <p className="text-sm">
                                <a href="mailto:report@campaignwatch.or.ke"
                                    className="text-gray-400 hover:text-white transition-colors">
                                    report@campaignwatch.or.ke
                                </a>
                            </p>
                            <p className="text-sm mt-1">
                                <a href="tel:+254203750329"
                                    className="text-gray-400 hover:text-white transition-colors">
                                    +254 20 375 0329
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/10 bg-navy-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4
                        flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-500">
                    <p>© 2026 The Samaritan — CampaignWatch Kenya. Independent of IEBC and all political parties.</p>
                    <p>Supported by FCDO · KISP Programme</p>
                    <p>Data sourced from public IEBC filings and citizen reports. Prototype demonstration platform.</p>
                </div>
            </div>
        </footer>
    )
}
