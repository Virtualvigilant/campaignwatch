'use client'
// components/Navbar.js
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/candidates', label: 'Candidates' },
  { href: '/watch-list', label: '🚩 Watch List' },
  { href: '/reports', label: 'Reports' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Subtle glassmorphism on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-200 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-border-subtle' : 'bg-transparent border-b border-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-text-primary font-bold text-lg leading-tight transition-transform group-hover:scale-[1.02]">
              CampaignWatch<br />
              <span className="text-text-secondary text-xs font-medium">Kenya 🇰🇪 2027</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(l => {
              const isActive = pathname === l.href
              return (
                <Link key={l.href} href={l.href}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors
                    ${isActive
                      ? 'bg-bg-primary text-text-primary shadow-sm border border-border-subtle'
                      : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'}`}>
                  {l.label}
                </Link>
              )
            })}
            <Link href="/report"
              className="ml-3 btn-primary text-sm shadow-sm">
              Report a Violation
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)}
            className="md:hidden text-text-secondary hover:text-text-primary p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu - fades in under glass */}
      {open && (
        <div className="md:hidden border-t border-border-subtle bg-white px-4 py-3 space-y-1 shadow-lg absolute w-full">
          {links.map(l => {
            const isActive = pathname === l.href
            return (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium
                  ${isActive ? 'bg-bg-primary text-text-primary border border-border-subtle' : 'text-text-secondary hover:text-text-primary hover:bg-gray-50'}`}>
                {l.label}
              </Link>
            )
          })}
          <div className="pt-2 mt-2 border-t border-border-subtle">
            <Link href="/report" onClick={() => setOpen(false)}
              className="block w-full text-center btn-primary text-sm shadow-sm py-2">
              Report a Violation
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
