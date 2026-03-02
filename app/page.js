// app/page.js — Main Dashboard (Server Component)
import { supabase, formatKES } from '@/lib/supabase'
import StatCard from '@/components/StatCard'
import SpendingChart from '@/components/SpendingChart'
import TrendChart from '@/components/TrendChart'
import { StatusBadge, SeverityBadge } from '@/components/FlagBadge'
import AlertCard from '@/components/AlertCard'
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
      .select('*, candidates(full_name, county, election_type)')
      .order('flagged_date', { ascending: false })
      .limit(6),
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
    .slice(0, 5)

  return (
    <div className="space-y-8">

      {/* Hero Section */}
      <div className="max-w-3xl">
        <h1 className="mb-3">Mambo! 🇰🇪</h1>
        <p className="text-text-secondary text-lg leading-relaxed flex flex-wrap items-center gap-2">
          <span className="font-bold text-text-primary px-2 py-1 bg-green-50 text-risk-low border border-green-100 rounded">
            KES {formatKES(totalContributions).replace('KES ', '')} tracked
          </span>
          <span className="text-border-subtle">|</span>
          <span className="font-semibold text-text-primary">{(candidates || []).length} candidates</span>
          <span className="text-border-subtle">|</span>
          <span className="font-semibold text-risk-high">🔴 {flaggedCount} flags</span>
          <span className="text-border-subtle">|</span>
          <span className="text-sm">Updated 2m ago</span>
        </p>
      </div>

      {/* ── STAT CARDS (Horizontal Scroll on Mobile) ───────────────── */}
      <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 hide-scrollbar">
        <div className="w-[85vw] sm:w-auto shrink-0">
          <StatCard icon="📊" color="navy"
            value={(candidates || []).length}
            label="Candidates Tracked"
            sub="Across all 47 counties" />
        </div>
        <div className="w-[85vw] sm:w-auto shrink-0">
          <StatCard icon="💰" color="gold"
            value={formatKES(totalContributions)}
            label="Total Declared"
            sub="As of latest IEBC filing" />
        </div>
        <div className="w-[85vw] sm:w-auto shrink-0">
          <StatCard icon="🚩" color="alert"
            value={flaggedCount}
            label="Flagged Transactions"
            sub="Requiring public scrutiny" />
        </div>
        <div className="w-[85vw] sm:w-auto shrink-0">
          <StatCard icon="🏛️" color="safe"
            value={(parties || []).length}
            label="Parties Monitored"
            sub="Registered with IEBC" />
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Charts and Tables (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Map Placeholder */}
          <div className="card h-[40vh] min-h-[300px] flex flex-col justify-center items-center bg-gray-50 border-dashed border-2">
            <span className="text-5xl mb-3">🗺️</span>
            <h3 className="text-text-secondary">Kenya Interactive Map</h3>
            <p className="text-xs text-text-secondary mt-1">County breakdown visualization placeholder</p>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <p className="section-title">Spending by Category</p>
              <h2 className="mb-4">Breakdown</h2>
              <SpendingChart data={spendingByCategory} />
            </div>
            <div className="card">
              <p className="section-title">Monthly Trend</p>
              <h2 className="mb-4">Inflows</h2>
              <TrendChart data={trendData} />
            </div>
          </div>

          {/* Top Donors Table */}
          <div className="card">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="section-title">Largest Donations</p>
                <h2>Top Contributors</h2>
              </div>
              <Link href="/reports" className="text-sm font-semibold text-accent-kenya hover:underline">
                View All →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {['Donor', 'Type', 'Amount (KES)', 'Status'].map(h => (
                      <th key={h} className="table-header first:rounded-tl-lg last:rounded-tr-lg">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topDonors.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell font-medium">{d.donor_name || 'Anonymous'}</td>
                      <td className="table-cell capitalize text-text-secondary text-xs">{d.donor_type}</td>
                      <td className="table-cell font-mono font-bold text-text-primary">{formatKES(d.amount_kes)}</td>
                      <td className="table-cell"><StatusBadge status={d.flag_status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Alert Feed (1/3 width) */}
        <div className="space-y-4">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="section-title text-risk-high tracking-widest">Recent Alerts</p>
              <h2>Latest Flags</h2>
            </div>
          </div>

          <div className="space-y-3">
            {!flags || flags.length === 0 ? (
              <div className="card text-center py-10 bg-gray-50 border-dashed border-2">
                <span className="text-4xl mb-2 block">✅</span>
                <h3 className="text-text-primary font-bold">No High-Risk Alerts</h3>
                <p className="text-sm text-text-secondary mt-1">All clear for recent transactions.</p>
              </div>
            ) : (
              (flags || []).map(flag => {
                const dateStr = new Date(flag.flagged_date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                let positionStr = flag.candidates?.county
                if (flag.candidates?.election_type) {
                  positionStr += ` · ${flag.candidates?.election_type}`
                }

                return (
                  <AlertCard
                    key={flag.id}
                    candidate={flag.candidates?.full_name || 'Unknown Candidate'}
                    position={positionStr}
                    issue={flag.notes}
                    risk={flag.severity}
                    date={dateStr}
                    amount={null} // We'd need to join to get amount, omitted for simplicity unless added to view
                  />
                )
              })
            )}
          </div>

          <Link href="/reports"
            className="block text-center text-sm font-semibold text-text-secondary hover:text-text-primary btn-outline mt-2 w-full pt-3">
            Browse Full Watch List
          </Link>
        </div>

      </div>

    </div>
  )
}
