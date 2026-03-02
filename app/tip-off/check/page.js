'use client'
// app/tip-off/check/page.js — Check Tip Status by Reference Code
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const STATUS_INFO = {
  received:      { icon: '📥', label: 'Received',      color: 'bg-blue-100 text-blue-800',    desc: 'Your tip has been received and is in the queue for review by a TI Kenya investigator.' },
  under_review:  { icon: '🔍', label: 'Under Review',  color: 'bg-gold/10 text-gold-dark',    desc: 'A TI Kenya investigator is actively reviewing your submission.' },
  verified:      { icon: '✅', label: 'Verified',      color: 'bg-safe/10 text-safe-dark',    desc: 'Your tip has been verified and relevant information has been added to our public Watch List.' },
  dismissed:     { icon: '❌', label: 'Dismissed',     color: 'bg-gray-100 text-gray-500',    desc: 'After review, our investigators determined this tip did not contain sufficient evidence to proceed. This does not mean the events did not occur.' },
}

export default function CheckTipPage() {
  const [code,     setCode]     = useState('')
  const [result,   setResult]   = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [notFound, setNotFound] = useState(false)

  async function handleCheck(e) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    setNotFound(false)

    const { data, error } = await supabase
      .from('tip_offs')
      .select('reference_code, tip_type, status, created_at, reviewed_at')
      .eq('reference_code', code.toUpperCase().trim())
      .single()

    if (error || !data) {
      setNotFound(true)
    } else {
      setResult(data)
    }
    setLoading(false)
  }

  const TIP_TYPE_LABELS = {
    undeclared_donation: 'Undeclared donation',
    cash_distribution:   'Cash distribution to voters',
    foreign_funding:     'Foreign funding',
    vote_buying:         'Vote buying',
    spending_violation:  'Spending limit violation',
    other:               'Other violation',
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <p className="section-title">Citizen Accountability</p>
        <h1>Check Tip Status</h1>
        <p className="text-gray-500 text-sm mt-1">
          Enter your reference code to see the current status of your submission.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleCheck} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Reference Code</label>
            <input type="text" required value={code} onChange={e => setCode(e.target.value)}
              placeholder="e.g. TIP-2026-4821"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-mono font-bold
                         uppercase focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy
                         tracking-widest text-center" />
          </div>
          <button type="submit" disabled={loading || code.length < 5}
            className="w-full btn-primary disabled:opacity-50">
            {loading ? 'Checking…' : 'Check Status'}
          </button>
        </form>

        {/* Not found */}
        {notFound && (
          <div className="mt-5 bg-alert/5 border border-alert/20 rounded-xl p-4 text-center">
            <p className="font-semibold text-alert">Reference code not found</p>
            <p className="text-xs text-gray-500 mt-1">
              Check the code and try again. Codes are case-insensitive.
            </p>
          </div>
        )}

        {/* Found */}
        {result && (() => {
          const info = STATUS_INFO[result.status]
          return (
            <div className="mt-5 space-y-4">
              <div className={`${info.color} rounded-xl p-4 text-center`}>
                <p className="text-3xl mb-1">{info.icon}</p>
                <p className="font-bold text-lg">{info.label}</p>
                <p className="text-xs mt-1 opacity-75">{result.reference_code}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm py-1.5 border-b border-ash-dark">
                  <span className="text-gray-400">Type</span>
                  <span className="font-medium">{TIP_TYPE_LABELS[result.tip_type]}</span>
                </div>
                <div className="flex justify-between text-sm py-1.5 border-b border-ash-dark">
                  <span className="text-gray-400">Submitted</span>
                  <span className="font-medium">{new Date(result.created_at).toLocaleDateString('en-KE')}</span>
                </div>
                {result.reviewed_at && (
                  <div className="flex justify-between text-sm py-1.5">
                    <span className="text-gray-400">Reviewed</span>
                    <span className="font-medium">{new Date(result.reviewed_at).toLocaleDateString('en-KE')}</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600 bg-ash rounded-xl p-3">{info.desc}</p>
            </div>
          )
        })()}
      </div>

      <div className="text-center">
        <Link href="/tip-off" className="text-sm text-gold hover:underline">
          Submit a new tip →
        </Link>
      </div>
    </div>
  )
}
