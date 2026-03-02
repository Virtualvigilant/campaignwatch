'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const TABS = [
    { id: 'home', href: '/', icon: '🏠', label: 'Home' },
    { id: 'map', href: '/map', icon: '🗺️', label: 'Map' },
    { id: 'report', href: '/report', icon: '🚨', label: 'Report' },
    { id: 'me', href: '/me', icon: '👤', label: 'Me' },
]

export default function BottomNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 w-full bg-white border-t border-border-subtle shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-50 pb-[env(safe-area-inset-bottom)] bottom-nav">
            <div className="flex items-center justify-around h-[64px] max-w-md mx-auto px-2">
                {TABS.map((tab) => {
                    const isActive = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))

                    return (
                        <Link
                            key={tab.id}
                            href={tab.href}
                            className="flex flex-col items-center justify-center min-w-[56px] min-h-[56px] flex-1 group"
                        >
                            <div className={`flex flex-col items-center justify-center transition-all duration-300 ${isActive ? 'scale-110' : ''}`}>
                                <span className="text-2xl mb-1">
                                    {tab.icon}
                                </span>

                                <span className={`text-[10px] font-bold leading-none transition-colors ${isActive ? 'text-accent-kenya' : 'text-text-secondary'}`}>
                                    {tab.label}
                                </span>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
