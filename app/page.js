// app/page.js — Main Dashboard (Server Component)
import { supabase, formatKES } from '@/lib/supabase'
import StatCard from '@/components/StatCard'
import AlertTicker from '@/components/AlertTicker'
import SpendingChart from '@/components/SpendingChart'
import TrendChart from '@/components/TrendChart'
import { StatusBadge, SeverityBadge } from '@/components/FlagBadge'
import Link from 'next/link'

// ── Aggregate expenditure by category ─────────────────────────
function groupByCategory(expenditures) {
  const map = {}
  for (const e of expenditures) {
    if (!map[e.category]) map[e.category] = 0
    map[e.category] += e.amount_kes
  }
  return Object.entries(map)
    .map(([category, total]) => ({ category: category.charAt(0).toUpperCase() + category.slice(1), total }))
    .sort((a, b) => b.total - a.total)
}

// ── Build monthly trend from contributions ─────────────────────
function buildTrend(contributions) {
  const months = {}
  for (const c of contributions) {
    const key = c.contribution_date.slice(0, 7) // "YYYY-MM"
    if (!months[key]) months[key] = 0
    months[key] += c.amount_kes
  }
  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month: month.replace('-', '/'), total }))
}

export default async function DashboardPage() {
  // Fetch everything in parallel
  const [
    { data: candidates },
    { data: parties },
    { data: contributions },
    { data: expenditures },
    { data: flags },
  ] = await Promise.all([
    supabase.from('candidates').select('*, political_parties(abbreviation)'),
    supabase.from('political_parties').select('*'),
    supabase.from('contributions').select('*').order('contribution_date', { ascending: false }),
    supabase.from('expenditures').select('*'),
    supabase.from('flags_and_alerts')
      .select('*, candidates(full_name)')
      .order('flagged_date', { ascending: false })
      .limit(5),
  ])



  // Stats
  const totalContributions = (contributions || []).reduce((s, c) => s + c.amount_kes, 0)
  const flaggedCount = (contributions || []).filter(c => c.flag_status !== 'clean').length
    + (expenditures || []).filter(e => e.flag_status !== 'clean').length
  const spendingByCategory = groupByCategory(expenditures || [])
  const trendData = buildTrend(contributions || [])

  // Top 10 donors
  const topDonors = [...(contributions || [])]
    .sort((a, b) => b.amount_kes - a.amount_kes)
    .slice(0, 8)

  return (
    <div className="space-y-8">

      {/* Page header */}
      <div>
        <p className="section-title">Live Dashboard</p>
        <h1>The Samaritan: Kenya 2027 Monitor</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Tracking declared political funding &amp; expenditure ahead of
          the August 2027 General Election under the Electoral
          Campaign Finance Act, 2013.
        </p>
      </div>
      <AlertTicker />

      {/* ── STAT CARDS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon="🏛️" color="navy"
          value={(candidates || []).length}
          label="Tracked"
          sub="47 counties" />
        <StatCard icon="💰" color="gold"
          value={formatKES(totalContributions).replace('KES ', '')}
          label="Total"
          sub="Declared" />
        <StatCard icon="🚩" color="alert"
          value={flaggedCount}
          label="Flags"
          sub="Transactions" />
        <StatCard icon="⚖️" color="safe"
          value={(parties || []).length}
          label="Parties"
          sub="Monitoring" />
      </div>



      {/* ── CHARTS ROW ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="card">
          <p className="section-title">Spending</p>
          <h2 className="mb-4 text-lg">Expenditure Breakdown</h2>
          <SpendingChart data={spendingByCategory} />
        </div>
        <div className="card">
          <p className="section-title">Trend</p>
          <h2 className="mb-4 text-lg">Inflows Over Time</h2>
          <TrendChart data={trendData} />
        </div>
      </div>

      {/* ── TOP DONORS + RECENT ALERTS ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Top Donors Table */}
        <div className="card lg:col-span-2 overflow-hidden">
          <p className="section-title">Largest Donations</p>
          <h2 className="mb-4 text-lg">Top Contributions</h2>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr>
                  {['Donor', 'Type', 'Amount (KES)', 'Status'].map(h => (
                    <th key={h} className="table-header first:rounded-tl-lg last:rounded-tr-lg">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topDonors.map(d => (
                  <tr key={d.id} className="hover:bg-ash transition-colors">
                    <td className="table-cell font-medium">{d.donor_name || 'Anonymous'}</td>
                    <td className="table-cell capitalize">{d.donor_type}</td>
                    <td className="table-cell font-mono font-bold">{formatKES(d.amount_kes)}</td>
                    <td className="table-cell"><StatusBadge status={d.flag_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="card">
          <p className="section-title">Recent Alerts</p>
          <h2 className="mb-4">Latest Flags</h2>
          <div className="space-y-3">
            {(flags || []).map(flag => (
              <div key={flag.id}
                className="border-l-4 border-alert bg-alert/5 rounded-r-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <SeverityBadge severity={flag.severity} />
                  <span className="text-xs text-gray-400">
                    {new Date(flag.flagged_date).toLocaleDateString('en-KE')}
                  </span>
                </div>
                <p className="text-xs font-semibold text-navy">
                  {flag.candidates?.full_name}
                </p>
                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{flag.notes}</p>
              </div>
            ))}
            <Link href="/watch-list"
              className="block text-center text-xs font-semibold text-gold hover:underline mt-2">
              View full Watch List →
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
