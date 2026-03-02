'use client'
// app/reports/page.js — Reports & Export Page (Client Component for download actions)
import { useEffect, useState } from 'react'
import { supabase, formatKES } from '@/lib/supabase'

function ReportCard({ icon, title, description, onDownload, loading }) {
  return (
    <div className="card flex items-start gap-4">
      <span className="text-4xl">{icon}</span>
      <div className="flex-1">
        <h3 className="font-bold text-navy">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
        <button onClick={onDownload} disabled={loading}
          className="mt-3 btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Generating…' : '⬇ Download CSV'}
        </button>
      </div>
    </div>
  )
}

// Convert array of objects → CSV string
function toCSV(rows) {
  if (!rows || !rows.length) return ''
  const headers = Object.keys(rows[0]).join(',')
  const body = rows.map(r =>
    Object.values(r).map(v =>
      typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
    ).join(',')
  ).join('\n')
  return `${headers}\n${body}`
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

export default function ReportsPage() {
  const [loading, setLoading] = useState({})
  const [summary, setSummary] = useState(null)

  // Fetch summary stats on mount
  useEffect(() => {
    async function load() {
      const [
        { data: candidates },
        { data: contributions },
        { data: expenditures },
        { data: flags },
      ] = await Promise.all([
        supabase.from('candidates').select('id'),
        supabase.from('contributions').select('amount_kes'),
        supabase.from('expenditures').select('amount_kes'),
        supabase.from('flags_and_alerts').select('id'),
      ])
      setSummary({
        candidates: (candidates || []).length,
        contributions: (contributions || []).reduce((s, c) => s + c.amount_kes, 0),
        expenditures: (expenditures || []).reduce((s, e) => s + e.amount_kes, 0),
        flags: (flags || []).length,
      })
    }
    load()
  }, [])

  async function handleDownload(key, table, columns, filename) {
    setLoading(l => ({ ...l, [key]: true }))
    try {
      const { data } = await supabase.from(table).select(columns)
      downloadCSV(toCSV(data || []), filename)
    } finally {
      setLoading(l => ({ ...l, [key]: false }))
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="section-title">Data Export</p>
        <h1>Reports &amp; Downloads</h1>
        <p className="text-gray-500 text-sm mt-1">
          All reports are generated in real-time from the latest verified IEBC data.
          Files are exported in CSV format, compatible with Excel, Google Sheets, and analysis tools.
        </p>
      </div>

      {/* Summary stats */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Candidates', value: summary.candidates },
            { label: 'Total Raised', value: formatKES(summary.contributions) },
            { label: 'Total Spent', value: formatKES(summary.expenditures) },
            { label: 'Flags in Database', value: summary.flags },
          ].map(s => (
            <div key={s.label} className="card text-center">
              <p className="text-xl font-bold text-navy">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Report cards */}
      <div className="space-y-4">
        <h2>Available Reports</h2>

        <ReportCard
          icon="🏛️"
          title="Candidates & Parties Report"
          description="Full list of all monitored candidates including party affiliation, county, election type, and declared spending limits."
          loading={loading.candidates}
          onDownload={() => handleDownload(
            'candidates',
            'candidates',
            'full_name, election_type, county, constituency, declared_spending_limit, registration_date',
            `TheSamaritan_Candidates_${new Date().toISOString().slice(0, 10)}.csv`
          )} />

        <ReportCard
          icon="💰"
          title="Full Contributions Report"
          description="All declared contributions including donor name, type, amount, recipient candidate, date, IEBC document reference, and flag status."
          loading={loading.contributions}
          onDownload={() => handleDownload(
            'contributions',
            'contributions',
            'candidate_id, donor_name, donor_type, amount_kes, contribution_date, source_document, flag_status',
            `TheSamaritan_Contributions_${new Date().toISOString().slice(0, 10)}.csv`
          )} />

        <ReportCard
          icon="📊"
          title="Expenditure Report"
          description="All declared expenditures including category, vendor, amount, date, description, and flag status. Use to audit how campaign money was spent."
          loading={loading.expenditures}
          onDownload={() => handleDownload(
            'expenditures',
            'expenditures',
            'candidate_id, category, vendor_name, amount_kes, expenditure_date, description, flag_status',
            `TheSamaritan_Expenditures_${new Date().toISOString().slice(0, 10)}.csv`
          )} />

        <ReportCard
          icon="🚩"
          title="Flagged Transactions Report"
          description="All transactions flagged for potential violations of the Elections Campaign Financing Act 2013, including flag type, severity, and resolution status."
          loading={loading.flags}
          onDownload={() => handleDownload(
            'flags',
            'flags_and_alerts',
            'candidate_id, flag_type, severity, flagged_date, reviewed_by_admin, resolution_status, notes',
            `TheSamaritan_Flags_${new Date().toISOString().slice(0, 10)}.csv`
          )} />
      </div>

      {/* Usage note */}
      <div className="card bg-ash border border-ash-dark">
        <h3 className="text-navy mb-2">📋 Data Usage Guidelines</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          This data is sourced from official IEBC filings and is provided for public accountability purposes under Kenya's Access to Information Act, 2016.
          Reports are for educational, journalistic, and civic use. All data represents declarations made to the IEBC — unverified claims are annotated as such.
          For formal verification or legal use, request certified copies directly from the IEBC.
          For questions, contact <a href="mailto:info@tikenya.org" className="text-gold hover:underline">info@tikenya.org</a>.
        </p>
      </div>
    </div>
  )
}
