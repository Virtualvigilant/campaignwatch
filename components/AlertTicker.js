'use client'
// components/AlertTicker.js
// Scrolling marquee of recent flagged violations
// Add to the top of app/page.js, just below the Navbar

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const SEVERITY_DOT = { critical: '🔴', medium: '🟡', low: '🟢' }
const FLAG_SHORT = {
  anonymous_donor:   'Anonymous donation',
  foreign_funding:   'Foreign funding',
  limit_exceeded:    'Limit exceeded',
  suspicious_timing: 'Suspicious timing',
  prohibited_source: 'Prohibited source',
}

export default function AlertTicker() {
  const [alerts,  setAlerts]  = useState([])
  const [paused,  setPaused]  = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('flags_and_alerts')
        .select('*, candidates(full_name, election_type)')
        .eq('resolution_status', 'open')
        .order('flagged_date', { ascending: false })
        .limit(12)
      setAlerts(data || [])
      setLoading(false)
    }
    load()

    // Refresh every 5 minutes
    const interval = setInterval(load, 300_000)
    return () => clearInterval(interval)
  }, [])

  if (loading || alerts.length === 0) return null

  // Duplicate alerts so the scroll loops seamlessly
  const ticker = [...alerts, ...alerts]

  return (
    <div className="bg-navy border-b border-navy-light sticky top-16 z-40"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}>
      <div className="flex items-center">

        {/* Label badge */}
        <div className="flex-shrink-0 bg-alert px-4 py-2 flex items-center gap-2">
          <span className="text-white text-xs font-bold uppercase tracking-widest">🚨 Live Alerts</span>
        </div>

        {/* Scrolling track */}
        <div className="flex-1 overflow-hidden">
          <div className={`flex gap-10 py-2 ${paused ? '' : 'animate-ticker'}`}
            style={{ width: 'max-content' }}>
            {ticker.map((alert, i) => (
              <Link key={`${alert.id}-${i}`} href="/watch-list"
                className="flex items-center gap-2 whitespace-nowrap text-sm hover:opacity-80 transition-opacity">
                <span>{SEVERITY_DOT[alert.severity]}</span>
                <span className="text-gold font-semibold">
                  {FLAG_SHORT[alert.flag_type] || alert.flag_type?.replace(/_/g,' ')}
                </span>
                <span className="text-gray-300">—</span>
                <span className="text-white">{alert.candidates?.full_name}</span>
                <span className="text-gray-400 text-xs">
                  · {new Date(alert.flagged_date).toLocaleDateString('en-KE', { day:'numeric', month:'short' })}
                </span>
                <span className="text-navy-light mx-4">·</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Pause indicator */}
        <div className="flex-shrink-0 px-3">
          <span className="text-gray-500 text-xs">{paused ? '⏸' : '▶'}</span>
        </div>
      </div>

      {/* CSS animation — add this to globals.css too (see note below) */}
      <style jsx>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 40s linear infinite;
        }
      `}</style>
    </div>
  )
}
