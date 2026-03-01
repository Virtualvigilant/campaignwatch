'use client'
// components/Navbar.js
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const links = [
  { href: '/',            label: 'Dashboard'   },
  { href: '/candidates',  label: 'Candidates'  },
  { href: '/watch-list',  label: '🚩 Watch List' },
  { href: '/reports',     label: 'Reports'     },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="bg-navy shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-gold font-bold text-lg leading-tight">
              CampaignWatch<br/>
              <span className="text-white text-xs font-normal">Kenya 🇰🇪 2027</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link key={l.href} href={l.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${pathname === l.href
                    ? 'bg-gold text-white'
                    : 'text-gray-300 hover:text-white hover:bg-navy-light'}`}>
                {l.label}
              </Link>
            ))}
            <a href="mailto:info@tikenya.org"
               className="ml-3 bg-alert text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-alert-dark transition-colors">
              Report a Violation
            </a>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)}
            className="md:hidden text-gray-300 hover:text-white p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-navy-light px-4 py-3 space-y-1">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className={`block px-4 py-2 rounded-lg text-sm font-medium
                ${pathname === l.href ? 'bg-gold text-white' : 'text-gray-300 hover:text-white'}`}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
