'use client'
// components/AlertTicker.js — Live alerts marquee with pulsing dot and View All link
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const SEVERITY_DOT = { critical: 'bg-alert', medium: 'bg-gold', low: 'bg-safe' }
const FLAG_SHORT = {
  anonymous_donor: 'Anonymous donation',
  foreign_funding: 'Foreign funding',
  limit_exceeded: 'Limit exceeded',
  suspicious_timing: 'Suspicious timing',
  prohibited_source: 'Prohibited source',
}

export default function AlertTicker() {
  const [alerts, setAlerts] = useState([])
  const [paused, setPaused] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('flags_and_alerts')
        .select('*, candidates(full_name, county)')
        .eq('resolution_status', 'open')
        .order('flagged_date', { ascending: false })
        .limit(12)
      setAlerts(data || [])
      setLoading(false)
    }
    load()
    const interval = setInterval(load, 300_000)
    return () => clearInterval(interval)
  }, [])

  if (loading || alerts.length === 0) return null

  const ticker = [...alerts, ...alerts]

  return (
    <div className="bg-navy border-b border-navy-light sticky top-16 z-40"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}>
      <div className="flex items-center">

        {/* Label with pulsing red dot */}
        <div className="shrink-0 bg-alert/90 px-4 py-2 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <span className="text-white text-xs font-bold uppercase tracking-widest">Live Alerts</span>
        </div>

        {/* Scrolling track */}
        <div className="flex-1 overflow-hidden">
          <div className={`flex gap-10 py-2 ${paused ? '' : 'animate-ticker'}`}
            style={{ width: 'max-content' }}>
            {ticker.map((alert, i) => (
              <Link key={`${alert.id}-${i}`} href="/watch-list"
                className="flex items-center gap-2 whitespace-nowrap text-sm hover:opacity-80 transition-opacity">
                {/* Severity dot */}
                <span className={`w-2 h-2 rounded-full ${SEVERITY_DOT[alert.severity] || 'bg-gold'}`} />
                {/* Flag type */}
                <span className="text-gold font-semibold">
                  {FLAG_SHORT[alert.flag_type] || alert.flag_type?.replace(/_/g, ' ')}
                </span>
                <span className="text-gray-500">—</span>
                {/* Candidate name */}
                <span className="text-white font-medium">{alert.candidates?.full_name}</span>
                {/* County */}
                {alert.candidates?.county && (
                  <span className="text-gray-500 text-xs">· {alert.candidates.county}</span>
                )}
                {/* Date */}
                <span className="text-gray-500 text-xs">
                  · {new Date(alert.flagged_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* View All link */}
        <Link href="/watch-list"
          className="shrink-0 px-4 py-2 text-xs text-gray-400 hover:text-gold font-semibold transition-colors whitespace-nowrap">
          View All →
        </Link>
      </div>

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
