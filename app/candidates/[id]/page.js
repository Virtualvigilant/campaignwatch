// app/candidates/[id]/page.js — Candidate Profile (Server Component)
import { supabase, formatKES, spendingPercent } from '@/lib/supabase'
import { StatusBadge, SeverityBadge, ResolutionBadge } from '@/components/FlagBadge'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function CandidateProfilePage({ params }) {
    const { id } = await params

    const [
        { data: candidate },
        { data: contributions },
        { data: expenditures },
        { data: flags },
    ] = await Promise.all([
        supabase.from('candidates').select('*, political_parties(*)').eq('id', id).single(),
        supabase.from('contributions').select('*').eq('candidate_id', id).order('amount_kes', { ascending: false }),
        supabase.from('expenditures').select('*').eq('candidate_id', id).order('amount_kes', { ascending: false }),
        supabase.from('flags_and_alerts').select('*').eq('candidate_id', id).order('flagged_date', { ascending: false }),
    ])

    if (!candidate) return notFound()

    const totalContributions = (contributions || []).reduce((s, c) => s + c.amount_kes, 0)
    const totalExpenditure = (expenditures || []).reduce((s, e) => s + e.amount_kes, 0)
    const pct = spendingPercent(totalExpenditure, candidate.declared_spending_limit)
    const barColor = pct >= 100 ? 'bg-alert' : pct >= 75 ? 'bg-gold' : 'bg-safe'

    return (
        <div className="space-y-6">

            {/* Breadcrumb */}
            <div className="text-sm text-gray-400">
                <Link href="/candidates" className="hover:text-navy">← Back to Candidates</Link>
            </div>

            {/* Profile Header */}
            <div className="card">
                <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-full bg-navy flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                        {candidate.full_name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-navy">{candidate.full_name}</h1>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                            <span>🏛️ {candidate.political_parties?.party_name}</span>
                            <span>📍 {candidate.constituency}, {candidate.county}</span>
                            <span className="capitalize">🗳️ {candidate.election_type}</span>
                        </div>
                    </div>
                    {flags?.some(f => f.severity === 'critical') && (
                        <span className="bg-alert/10 text-alert font-bold text-sm px-3 py-1 rounded-full border border-alert/30">
                            🚩 Critical Flags
                        </span>
                    )}
                </div>

                {/* Spending progress */}
                <div className="mt-6 border-t pt-5">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-navy">Campaign Expenditure vs. Declared Limit</span>
                        <span className={`font-bold ${pct >= 90 ? 'text-alert' : 'text-navy'}`}>{pct}%</span>
                    </div>
                    <div className="w-full bg-ash-dark rounded-full h-3">
                        <div className={`h-3 rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Spent: <strong className="text-navy">{formatKES(totalExpenditure)}</strong></span>
                        <span>Limit: <strong>{formatKES(candidate.declared_spending_limit)}</strong></span>
                    </div>
                </div>

                {/* Summary stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 border-t pt-5">
                    {[
                        { label: 'Total Raised', value: formatKES(totalContributions) },
                        { label: 'Total Spent', value: formatKES(totalExpenditure) },
                        { label: 'No. of Donors', value: (contributions || []).length },
                        { label: 'Flags Raised', value: (flags || []).length },
                    ].map(s => (
                        <div key={s.label} className="text-center">
                            <p className="text-xl font-bold text-navy">{s.value}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── CONTRIBUTIONS TABLE ────────────────────────────────── */}
            <div className="card">
                <p className="section-title">Funding Sources</p>
                <h2 className="mb-4">Declared Contributions</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
                                {['Donor Name', 'Type', 'Amount (KES)', 'Date', 'Document', 'Status'].map(h => (
                                    <th key={h} className="table-header">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(contributions || []).map(c => (
                                <tr key={c.id} className="hover:bg-ash transition-colors">
                                    <td className="table-cell font-medium">{c.donor_name || '—'}</td>
                                    <td className="table-cell capitalize">{c.donor_type}</td>
                                    <td className="table-cell font-mono font-bold text-navy">{formatKES(c.amount_kes)}</td>
                                    <td className="table-cell">{new Date(c.contribution_date).toLocaleDateString('en-KE')}</td>
                                    <td className="table-cell text-xs text-gray-400">{c.source_document || '—'}</td>
                                    <td className="table-cell"><StatusBadge status={c.flag_status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── EXPENDITURES TABLE ─────────────────────────────────── */}
            <div className="card">
                <p className="section-title">Where the Money Went</p>
                <h2 className="mb-4">Declared Expenditures</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
                                {['Category', 'Vendor', 'Description', 'Amount (KES)', 'Date', 'Status'].map(h => (
                                    <th key={h} className="table-header">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(expenditures || []).map(e => (
                                <tr key={e.id} className="hover:bg-ash transition-colors">
                                    <td className="table-cell capitalize font-medium">{e.category}</td>
                                    <td className="table-cell">{e.vendor_name || '—'}</td>
                                    <td className="table-cell text-gray-500 text-xs">{e.description}</td>
                                    <td className="table-cell font-mono font-bold text-navy">{formatKES(e.amount_kes)}</td>
                                    <td className="table-cell">{new Date(e.expenditure_date).toLocaleDateString('en-KE')}</td>
                                    <td className="table-cell"><StatusBadge status={e.flag_status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── FLAGS SECTION ──────────────────────────────────────── */}
            {flags && flags.length > 0 && (
                <div className="card border-l-4 border-alert">
                    <p className="section-title">Compliance Issues</p>
                    <h2 className="mb-4">Active Flags &amp; Alerts</h2>
                    <div className="space-y-3">
                        {flags.map(flag => (
                            <div key={flag.id} className="bg-alert/5 rounded-xl p-4 border border-alert/10">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <SeverityBadge severity={flag.severity} />
                                    <ResolutionBadge status={flag.resolution_status} />
                                    <span className="text-xs text-gray-400 ml-auto">
                                        {new Date(flag.flagged_date).toLocaleString('en-KE')}
                                    </span>
                                </div>
                                <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">
                                    {flag.flag_type?.replace(/_/g, ' ')}
                                </p>
                                <p className="text-sm text-gray-700">{flag.notes}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    )
}
