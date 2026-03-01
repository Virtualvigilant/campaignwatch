// app/watch-list/page.js — Public Watch List (Server Component)
import { supabase, formatKES } from '@/lib/supabase'
import { SeverityBadge, ResolutionBadge } from '@/components/FlagBadge'
import Link from 'next/link'

const FLAG_TYPE_LABELS = {
    limit_exceeded: '💸 Contribution Limit Exceeded',
    anonymous_donor: '👤 Anonymous Donor',
    foreign_funding: '🌍 Foreign Funding',
    prohibited_source: '⛔ Prohibited Source',
    suspicious_timing: '⏰ Suspicious Timing',
}

export default async function WatchListPage({ searchParams }) {
    const params = await searchParams
    const severityFilter = params?.severity || 'all'
    const statusFilter = params?.status || 'all'

    let query = supabase
        .from('flags_and_alerts')
        .select(`
      *,
      candidates (full_name, county, election_type, political_parties(abbreviation)),
      contributions (amount_kes, donor_name, donor_type),
      expenditures  (amount_kes, vendor_name, category)
    `)
        .order('flagged_date', { ascending: false })

    if (severityFilter !== 'all') query = query.eq('severity', severityFilter)
    if (statusFilter !== 'all') query = query.eq('resolution_status', statusFilter)

    const { data: flags } = await query

    const counts = {
        total: (flags || []).length,
        critical: (flags || []).filter(f => f.severity === 'critical').length,
        medium: (flags || []).filter(f => f.severity === 'medium').length,
        low: (flags || []).filter(f => f.severity === 'low').length,
    }

    return (
        <div className="space-y-6">
            <div>
                <p className="section-title">Compliance Monitor</p>
                <h1>🚩 Flagged Transactions — Public Watch List</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Records automatically flagged against Kenya's Elections Campaign Financing Act 2013.
                    All flags are publicly visible in the interest of electoral transparency.
                </p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Flags', value: counts.total, cls: 'border-l-gray-400' },
                    { label: 'Critical', value: counts.critical, cls: 'border-l-alert' },
                    { label: 'Medium', value: counts.medium, cls: 'border-l-orange-400' },
                    { label: 'Low', value: counts.low, cls: 'border-l-yellow-400' },
                ].map(c => (
                    <div key={c.label} className={`card border-l-4 ${c.cls} text-center`}>
                        <p className="text-2xl font-bold text-navy">{c.value}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="card flex flex-wrap gap-6 items-center">
                <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Severity</label>
                    <div className="flex gap-2">
                        {['all', 'low', 'medium', 'critical'].map(s => (
                            <a key={s} href={`?severity=${s}&status=${statusFilter}`}
                                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors
                  ${severityFilter === s ? 'bg-navy text-white border-navy' : 'border-gray-300 text-gray-600 hover:border-navy'}`}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </a>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Status</label>
                    <div className="flex gap-2">
                        {['all', 'open', 'escalated', 'resolved'].map(s => (
                            <a key={s} href={`?severity=${severityFilter}&status=${s}`}
                                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors
                  ${statusFilter === s ? 'bg-navy text-white border-navy' : 'border-gray-300 text-gray-600 hover:border-navy'}`}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Flags list */}
            <div className="space-y-4">
                {(flags || []).map(flag => {
                    const amount = flag.contributions?.amount_kes || flag.expenditures?.amount_kes
                    const entity = flag.contributions?.donor_name || flag.expenditures?.vendor_name || 'N/A'
                    return (
                        <div key={flag.id}
                            className={`card border-l-4 ${flag.severity === 'critical' ? 'border-l-alert' : flag.severity === 'medium' ? 'border-l-orange-400' : 'border-l-yellow-400'}`}>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <SeverityBadge severity={flag.severity} />
                                        <ResolutionBadge status={flag.resolution_status} />
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                            {FLAG_TYPE_LABELS[flag.flag_type] || flag.flag_type}
                                        </span>
                                    </div>
                                    <Link href={`/candidates/${flag.candidate_id}`}
                                        className="font-bold text-navy hover:text-navy-light transition-colors">
                                        {flag.candidates?.full_name}
                                    </Link>
                                    <span className="text-gray-400 text-xs ml-2">
                                        {flag.candidates?.political_parties?.abbreviation} ·{' '}
                                        <span className="capitalize">{flag.candidates?.election_type}</span> ·{' '}
                                        {flag.candidates?.county}
                                    </span>
                                </div>
                                <div className="text-right">
                                    {amount && (
                                        <p className="text-xl font-bold text-navy font-mono">{formatKES(amount)}</p>
                                    )}
                                    {entity !== 'N/A' && (
                                        <p className="text-xs text-gray-400">{entity}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-3 bg-ash rounded-lg p-3">
                                <p className="text-sm text-gray-700">{flag.notes}</p>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                                <span className="text-xs text-gray-400">
                                    Flagged: {new Date(flag.flagged_date).toLocaleString('en-KE')}
                                </span>
                                <span className="text-xs text-gray-400">
                                    Admin reviewed: {flag.reviewed_by_admin ? '✅ Yes' : '❌ Pending'}
                                </span>
                            </div>
                        </div>
                    )
                })}
                {(flags || []).length === 0 && (
                    <div className="card text-center py-12 text-gray-400">
                        No flags match the current filters.
                    </div>
                )}
            </div>

            {/* Legal note */}
            <div className="card bg-navy text-white">
                <h3 className="text-gold mb-2">📖 How Flags Are Determined</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                    Transactions are automatically checked against the <strong className="text-white">Elections Campaign Financing Act, 2013</strong> and{' '}
                    <strong className="text-white">IEBC Campaign Finance Regulations, 2017</strong>. Flags are triggered when:{' '}
                    (1) an anonymous contribution exceeds KES 1,000,000; (2) a single donor contribution exceeds the legal per-donor ceiling;{' '}
                    (3) a contribution originates from a foreign national or foreign entity; (4) total spending breaches the candidate's declared ceiling;{' '}
                    or (5) an expenditure is made to an unregistered vendor close to election day. Flagged records remain public until resolved or escalated to the DPP.
                </p>
            </div>
        </div>
    )
}
