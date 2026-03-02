// app/candidates/[id]/page.js — Candidate Profile (Server Component)
import { supabase, formatKES, spendingPercent } from '@/lib/supabase'
import { StatusBadge, SeverityBadge, ResolutionBadge } from '@/components/FlagBadge'
import SpendComparison from '@/components/SpendComparison'
import RiskBadge from '@/components/RiskBadge'
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

    // For estimated, if flags mention an amount we could add it, but for demo we'll infer estimated as 1.5x declared if any flags exist, or just use declared.
    const hasCriticalFlags = flags?.some(f => f.severity === 'critical');
    const estimatedExpenditure = hasCriticalFlags ? totalExpenditure * 1.5 : totalExpenditure;

    return (
        <div className="space-y-6">

            {/* Breadcrumb */}
            <div className="text-sm text-text-secondary mb-4">
                <Link href="/candidates" className="hover:text-text-primary font-semibold">← Back to Candidates</Link>
            </div>

            {/* Profile Header */}
            <div className="card">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold shrink-0 border-4 shadow-sm ${hasCriticalFlags ? 'bg-risk-high border-red-100' : 'bg-gray-800 border-gray-100'
                            }`}>
                            {candidate.full_name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-[28px] mb-1">{candidate.full_name}</h1>
                            <div className="flex flex-wrap gap-2 text-sm text-text-secondary font-medium">
                                <span className="bg-gray-100 px-2 py-0.5 rounded-md">🏛️ {candidate.political_parties?.party_name}</span>
                                <span className="bg-gray-100 px-2 py-0.5 rounded-md">📍 {candidate.constituency}, {candidate.county}</span>
                                <span className="bg-gray-100 px-2 py-0.5 rounded-md capitalize">🗳️ {candidate.election_type}</span>
                            </div>
                        </div>
                    </div>
                    {hasCriticalFlags && (
                        <div className="md:ml-auto">
                            <RiskBadge level="high" />
                        </div>
                    )}
                </div>

                {/* Spending progress - New SpendComparison Component */}
                <div className="mt-8 pt-6 border-t border-border-subtle">
                    <SpendComparison
                        declared={totalExpenditure}
                        estimated={estimatedExpenditure}
                        limit={candidate.declared_spending_limit}
                    />
                </div>

                {/* Summary stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-border-subtle pt-6">
                    {[
                        { label: 'Total Raised', value: formatKES(totalContributions) },
                        { label: 'Total Declared Spent', value: formatKES(totalExpenditure) },
                        { label: 'No. of Donors', value: (contributions || []).length },
                        { label: 'Flags Raised', value: (flags || []).length },
                    ].map(s => (
                        <div key={s.label} className="text-center p-3 bg-gray-50 rounded-xl border border-border-subtle">
                            <p className="text-xl font-bold text-text-primary">{s.value}</p>
                            <p className="text-[11px] font-semibold text-text-secondary mt-1 tracking-wide uppercase">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── FLAGS SECTION (Moved up for priority visibility) ──────────────────────────────────────── */}
            {flags && flags.length > 0 && (
                <div className="card shadow-sm border border-red-200 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-risk-high"></div>
                    <p className="section-title text-risk-high">Compliance Issues</p>
                    <h2 className="mb-4">Active Flags &amp; Alerts</h2>
                    <div className="space-y-4">
                        {flags.map(flag => (
                            <div key={flag.id} className="bg-white rounded-xl p-4 border border-border-subtle shadow-sm hover:border-red-200 transition-colors">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <SeverityBadge severity={flag.severity} />
                                    <ResolutionBadge status={flag.resolution_status} />
                                    <span className="text-xs text-text-secondary ml-auto font-medium">
                                        {new Date(flag.flagged_date).toLocaleString('en-KE')}
                                    </span>
                                </div>
                                <p className="text-xs font-bold uppercase tracking-wide text-text-secondary mb-1">
                                    {flag.flag_type?.replace(/_/g, ' ')}
                                </p>
                                <p className="text-sm text-text-primary font-medium">{flag.notes}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                            {(contributions || []).map((c, i) => (
                                <tr key={c.id || i} className="hover:bg-gray-50 transition-colors">
                                    <td className="table-cell font-medium">{c.donor_name || '—'}</td>
                                    <td className="table-cell capitalize text-text-secondary">{c.donor_type}</td>
                                    <td className="table-cell font-mono font-bold text-text-primary">{formatKES(c.amount_kes)}</td>
                                    <td className="table-cell text-text-secondary">{new Date(c.contribution_date).toLocaleDateString('en-KE')}</td>
                                    <td className="table-cell text-xs text-text-secondary max-w-xs truncate" title={c.source_document}>{c.source_document || '—'}</td>
                                    <td className="table-cell"><StatusBadge status={c.flag_status} /></td>
                                </tr>
                            ))}
                            {(!contributions || contributions.length === 0) && (
                                <tr><td colSpan="6" className="text-center py-6 text-text-secondary">No contributions declared.</td></tr>
                            )}
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
                            {(expenditures || []).map((e, i) => (
                                <tr key={e.id || i} className="hover:bg-gray-50 transition-colors">
                                    <td className="table-cell capitalize font-medium">{e.category}</td>
                                    <td className="table-cell">{e.vendor_name || '—'}</td>
                                    <td className="table-cell text-text-secondary text-xs max-w-xs line-clamp-2">{e.description}</td>
                                    <td className="table-cell font-mono font-bold text-text-primary">{formatKES(e.amount_kes)}</td>
                                    <td className="table-cell text-text-secondary">{new Date(e.expenditure_date).toLocaleDateString('en-KE')}</td>
                                    <td className="table-cell"><StatusBadge status={e.flag_status} /></td>
                                </tr>
                            ))}
                            {(!expenditures || expenditures.length === 0) && (
                                <tr><td colSpan="6" className="text-center py-6 text-text-secondary">No expenditures declared.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}
