'use client'
// app/compare/page.js — Side-by-side Candidate Finance Comparison
import { useEffect, useState } from 'react'
import { supabase, formatKES, spendingPercent } from '@/lib/supabase'
import { StatusBadge } from '@/components/FlagBadge'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function CandidateSelector({ value, onChange, candidates, exclude }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full border-2 border-ash-dark rounded-xl px-4 py-3 text-sm font-semibold
                 text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy bg-white">
      <option value="">— Select a candidate —</option>
      {candidates
        .filter(c => c.id !== exclude)
        .map(c => (
          <option key={c.id} value={c.id}>
            {c.full_name} ({c.political_parties?.abbreviation} · {c.county})
          </option>
        ))}
    </select>
  )
}

function StatComparison({ label, a, b, format = v => v, higher = 'worse' }) {
  const aVal = a ?? 0
  const bVal = b ?? 0
  const aWins = higher === 'worse' ? aVal < bVal : aVal > bVal
  const bWins = higher === 'worse' ? bVal < aVal : bVal > aVal

  return (
    <div className="grid grid-cols-3 items-center py-3 border-b border-ash-dark last:border-0">
      <div className={`text-right pr-4 ${aWins ? 'text-safe-dark font-bold' : 'text-gray-700'}`}>
        {format(aVal)}
        {aWins && <span className="ml-1 text-safe text-xs">✓</span>}
      </div>
      <div className="text-center text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</div>
      <div className={`text-left pl-4 ${bWins ? 'text-safe-dark font-bold' : 'text-gray-700'}`}>
        {bWins && <span className="mr-1 text-safe text-xs">✓</span>}
        {format(bVal)}
      </div>
    </div>
  )
}

const CATEGORIES = ['advertising','rallies','transport','staff','printing','other']

export default function ComparePage() {
  const [candidates, setCandidates] = useState([])
  const [idA, setIdA] = useState('')
  const [idB, setIdB] = useState('')
  const [dataA, setDataA] = useState(null)
  const [dataB, setDataB] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('candidates').select('*, political_parties(abbreviation, party_name)')
      .then(({ data }) => setCandidates(data || []))
  }, [])

  async function fetchCandidateData(id) {
    const [
      { data: candidate },
      { data: contributions },
      { data: expenditures },
      { data: flags },
    ] = await Promise.all([
      supabase.from('candidates').select('*, political_parties(*)').eq('id', id).single(),
      supabase.from('contributions').select('*').eq('candidate_id', id),
      supabase.from('expenditures').select('*').eq('candidate_id', id),
      supabase.from('flags_and_alerts').select('*').eq('candidate_id', id),
    ])

    const totalRaised = (contributions || []).reduce((s, c) => s + c.amount_kes, 0)
    const totalSpent  = (expenditures  || []).reduce((s, e) => s + e.amount_kes, 0)

    const spendByCategory = Object.fromEntries(
      CATEGORIES.map(cat => [cat, (expenditures || []).filter(e => e.category === cat).reduce((s, e) => s + e.amount_kes, 0)])
    )

    const donorTypes = {}
    for (const c of contributions || []) {
      donorTypes[c.donor_type] = (donorTypes[c.donor_type] || 0) + c.amount_kes
    }

    return {
      candidate, contributions, expenditures, flags,
      totalRaised, totalSpent, spendByCategory, donorTypes,
      flagCount: (flags || []).length,
      criticalFlags: (flags || []).filter(f => f.severity === 'critical').length,
    }
  }

  useEffect(() => {
    if (!idA && !idB) return
    setLoading(true)
    Promise.all([
      idA ? fetchCandidateData(idA) : Promise.resolve(null),
      idB ? fetchCandidateData(idB) : Promise.resolve(null),
    ]).then(([a, b]) => {
      setDataA(a); setDataB(b); setLoading(false)
    })
  }, [idA, idB])

  const hasComparison = dataA && dataB

  // Build category chart data
  const categoryChart = hasComparison ? CATEGORIES.map(cat => ({
    name:  cat.charAt(0).toUpperCase() + cat.slice(1),
    [dataA.candidate?.full_name?.split(' ')[0]]: dataA.spendByCategory[cat],
    [dataB.candidate?.full_name?.split(' ')[0]]: dataB.spendByCategory[cat],
  })) : []

  return (
    <div className="space-y-6">

      <div>
        <p className="section-title">Analysis Tool</p>
        <h1>Compare Candidates Side by Side</h1>
        <p className="text-gray-500 text-sm mt-1">
          Select two candidates to compare their declared finances, donor sources, and flag history.
        </p>
      </div>

      {/* Selector */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-navy mb-2">Candidate A</p>
            <CandidateSelector value={idA} onChange={setIdA} candidates={candidates} exclude={idB} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-navy mb-2">Candidate B</p>
            <CandidateSelector value={idB} onChange={setIdB} candidates={candidates} exclude={idA} />
          </div>
        </div>
        {!idA && !idB && (
          <p className="text-center text-gray-400 text-sm mt-4">Select two candidates to begin comparison</p>
        )}
      </div>

      {loading && (
        <div className="text-center py-12 text-gray-400 animate-pulse">Loading comparison data…</div>
      )}

      {hasComparison && !loading && (
        <div className="space-y-5">

          {/* Header comparison */}
          <div className="grid grid-cols-2 gap-4">
            {[dataA, dataB].map((d, i) => {
              const pct = spendingPercent(d.totalSpent, d.candidate.declared_spending_limit)
              const barColor = pct >= 100 ? 'bg-alert' : pct >= 75 ? 'bg-gold' : 'bg-safe'
              return (
                <div key={i} className={`card border-t-4 ${i === 0 ? 'border-t-navy' : 'border-t-gold'}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${i === 0 ? 'bg-navy' : 'bg-gold'}`}>
                      {d.candidate.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-navy">{d.candidate.full_name}</h3>
                      <p className="text-xs text-gray-400">
                        {d.candidate.political_parties?.abbreviation} · {d.candidate.county} ·
                        <span className="capitalize"> {d.candidate.election_type}</span>
                      </p>
                    </div>
                    {d.criticalFlags > 0 && (
                      <span className="ml-auto bg-alert/10 text-alert text-xs font-bold px-2 py-0.5 rounded-full">
                        🚩 {d.criticalFlags} critical
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-ash-dark rounded-full h-2 mb-1">
                    <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Spent: <strong className="text-navy">{formatKES(d.totalSpent)}</strong></span>
                    <span>{pct}% of {formatKES(d.candidate.declared_spending_limit)} limit</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Head-to-head stats */}
          <div className="card">
            <p className="section-title">Head to Head</p>
            <div className="grid grid-cols-3 items-center mb-2">
              <p className="text-right text-xs font-bold text-navy pr-4 truncate">
                {dataA.candidate.full_name.split(' ')[0]}
              </p>
              <span />
              <p className="text-left text-xs font-bold text-gold pl-4 truncate">
                {dataB.candidate.full_name.split(' ')[0]}
              </p>
            </div>

            <StatComparison label="Total Raised"   a={dataA.totalRaised} b={dataB.totalRaised} format={formatKES} higher="better" />
            <StatComparison label="Total Spent"    a={dataA.totalSpent}  b={dataB.totalSpent}  format={formatKES} higher="worse"  />
            <StatComparison label="No. of Donors"  a={(dataA.contributions||[]).length} b={(dataB.contributions||[]).length} higher="better" />
            <StatComparison label="Flags Raised"   a={dataA.flagCount}   b={dataB.flagCount}   higher="worse"  />
            <StatComparison label="Critical Flags" a={dataA.criticalFlags} b={dataB.criticalFlags} higher="worse" />
            <StatComparison label="% of Limit Used"
              a={spendingPercent(dataA.totalSpent, dataA.candidate.declared_spending_limit)}
              b={spendingPercent(dataB.totalSpent, dataB.candidate.declared_spending_limit)}
              format={v => `${v}%`} higher="worse" />
          </div>

          {/* Spending by category chart */}
          <div className="card">
            <p className="section-title">Spending Breakdown</p>
            <h2 className="mb-4">Expenditure by Category</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChart} layout="vertical" margin={{ left: 8, right: 20 }}>
                  <XAxis type="number" tickFormatter={v => `${(v/1e6).toFixed(0)}M`} tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={v => formatKES(v)} />
                  <Bar dataKey={dataA.candidate.full_name.split(' ')[0]} fill="#1B2A4A" radius={[0,4,4,0]} />
                  <Bar dataKey={dataB.candidate.full_name.split(' ')[0]} fill="#F5A623" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-6 justify-center mt-2">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-navy" /><span className="text-xs text-gray-500">{dataA.candidate.full_name.split(' ')[0]}</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-gold" /><span className="text-xs text-gray-500">{dataB.candidate.full_name.split(' ')[0]}</span></div>
            </div>
          </div>

          {/* Donor type breakdown */}
          <div className="grid grid-cols-2 gap-4">
            {[dataA, dataB].map((d, i) => (
              <div key={i} className="card">
                <p className="section-title">{i === 0 ? dataA.candidate.full_name.split(' ')[0] : dataB.candidate.full_name.split(' ')[0]}</p>
                <h3 className="mb-3">Donor Sources</h3>
                <div className="space-y-2">
                  {Object.entries(d.donorTypes).sort((a,b) => b[1]-a[1]).map(([type, amount]) => (
                    <div key={type} className="flex items-center gap-2">
                      <span className="text-sm capitalize text-gray-600 w-24">{type}</span>
                      <div className="flex-1 bg-ash-dark rounded-full h-2">
                        <div className="h-2 rounded-full bg-navy"
                          style={{ width: `${Math.round((amount / d.totalRaised) * 100)}%` }} />
                      </div>
                      <span className="text-xs text-gray-400 w-16 text-right">{formatKES(amount)}</span>
                    </div>
                  ))}
                  {Object.keys(d.donorTypes).length === 0 && (
                    <p className="text-gray-400 text-sm">No contributions recorded</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Flags comparison */}
          {(dataA.flagCount > 0 || dataB.flagCount > 0) && (
            <div className="card border-l-4 border-l-alert">
              <p className="section-title">Compliance Issues</p>
              <h2 className="mb-4">Active Flags</h2>
              <div className="grid grid-cols-2 gap-4">
                {[dataA, dataB].map((d, i) => (
                  <div key={i}>
                    <p className="text-xs font-bold text-gray-400 mb-2">{d.candidate.full_name.split(' ')[0]}</p>
                    {d.flags?.length === 0
                      ? <p className="text-safe text-sm">✅ No flags</p>
                      : d.flags?.map(f => (
                          <div key={f.id} className="bg-alert/5 rounded-xl p-3 mb-2">
                            <div className="flex gap-2 mb-1">
                              <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${f.severity === 'critical' ? 'bg-alert/20 text-alert' : 'bg-orange-100 text-orange-700'}`}>
                                {f.severity}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">{f.notes?.slice(0,100)}…</p>
                          </div>
                        ))}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
