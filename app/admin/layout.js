'use client'
// app/admin/layout.js — Admin Layout with Auth Guard
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabaseAdmin'
import Link from 'next/link'

const NAV = [
    { href: '/admin', icon: '📊', label: 'Overview' },
    { href: '/admin/upload', icon: '⬆️', label: 'Upload Data' },
    { href: '/admin/manage', icon: '🗂️', label: 'Manage Records' },
    { href: '/admin/flags', icon: '🚩', label: 'Review Flags' },
    { href: '/admin/tipoffs', icon: '🛡️', label: 'Tip-Offs' },
]

export default function AdminLayout({ children }) {
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createBrowserClient()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session && pathname !== '/admin/login') {
                router.push('/admin/login')
            } else {
                setUser(session?.user ?? null)
                setLoading(false)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session && pathname !== '/admin/login') {
                router.push('/admin/login')
            } else {
                setUser(session?.user ?? null)
                setLoading(false)
            }
        })
        return () => subscription.unsubscribe()
    }, [pathname])

    async function handleSignOut() {
        await supabase.auth.signOut()
        router.push('/admin/login')
    }

    // Don't wrap the login page
    if (pathname === '/admin/login') return <>{children}</>

    if (loading) {
        return (
            <div className="min-h-screen bg-ash flex items-center justify-center">
                <div className="text-navy font-semibold animate-pulse">Verifying access…</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-ash flex">

            {/* ── SIDEBAR ───────────────────────────────────────────── */}
            <aside className="w-64 bg-navy flex flex-col sticky top-0 h-screen">
                {/* Logo */}
                <div className="px-6 py-5 border-b border-navy-light">
                    <p className="text-gold font-bold text-base leading-tight">CampaignWatch Kenya</p>
                    <p className="text-gray-400 text-xs mt-0.5">Admin Panel</p>
                </div>

                {/* Nav links */}
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {NAV.map(l => (
                        <Link key={l.href} href={l.href}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${pathname === l.href
                                    ? 'bg-gold text-white'
                                    : 'text-gray-300 hover:bg-navy-light hover:text-white'}`}>
                            <span>{l.icon}</span>
                            {l.label}
                        </Link>
                    ))}
                </nav>

                {/* User info + sign out */}
                <div className="px-4 py-4 border-t border-navy-light">
                    <p className="text-xs text-gray-400 truncate mb-2">{user?.email}</p>
                    <button onClick={handleSignOut}
                        className="w-full text-xs text-gray-400 hover:text-white border border-gray-600
                       hover:border-gray-400 rounded-lg px-3 py-2 transition-colors text-left">
                        Sign out →
                    </button>
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-navy-light">
                    <p className="text-xs text-gray-600">TI Kenya · KISP Programme</p>
                </div>
            </aside>

            {/* ── MAIN CONTENT ──────────────────────────────────────── */}
            <div className="flex-1 overflow-auto">
                {/* Top bar */}
                <div className="bg-white border-b border-ash-dark px-8 py-4 flex items-center justify-between">
                    <h1 className="text-navy font-bold text-lg">
                        {NAV.find(n => n.href === pathname)?.label ?? 'Admin Panel'}
                    </h1>
                    <div className="flex items-center gap-3">
                        <Link href="/" target="_blank"
                            className="text-xs text-gray-400 hover:text-navy transition-colors">
                            View public site ↗
                        </Link>
                        <span className="bg-safe/10 text-safe-dark text-xs font-semibold px-3 py-1 rounded-full border border-safe/20">
                            ● Live
                        </span>
                    </div>
                </div>

                {/* Page content */}
                <div className="p-8">
                    {children}
                </div>
            </div>
        </div>
    )
}
