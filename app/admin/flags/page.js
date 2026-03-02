'use client'
// app/admin/flags/page.js — Flag Review Page
import { useEffect, useState } from 'react'
import { createBrowserClient, formatKES, writeAuditLog } from '@/lib/supabaseAdmin'
import { SeverityBadge, ResolutionBadge } from '@/components/FlagBadge'

const FLAG_TYPE_LABELS = {
    limit_exceeded: '💸 Contribution Limit Exceeded',
    anonymous_donor: '👤 Anonymous Donor',
    foreign_funding: '🌍 Foreign Funding',
    prohibited_source: '⛔ Prohibited Source',
    suspicious_timing: '⏰ Suspicious Timing',
}

export default function FlagsReviewPage() {
    const supabase = createBrowserClient()
    const [flags, setFlags] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('open')      // open | all | resolved
    const [updating, setUpdating] = useState(null)        // flag id being updated
    const [noteModal, setNoteModal] = useState(null)        // flag for note editing
    const [noteText, setNoteText] = useState('')
    const [toast, setToast] = useState(null)

    function showToast(msg, type = 'success') {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }

    async function fetchFlags() {
        setLoading(true)
        let query = supabase.from('flags_and_alerts').select(`
      *,
      candidates (full_name, county, election_type, political_parties(abbreviation)),
      contributions (donor_name, donor_type, amount_kes, source_document),
      expenditures  (vendor_name, category, amount_kes)
    `).order('flagged_date', { ascending: false })

        if (filter === 'open') query = query.in('resolution_status', ['open', 'escalated'])
        if (filter === 'resolved') query = query.eq('resolution_status', 'resolved')

        const { data } = await query
        setFlags(data || [])
        setLoading(false)
    }

    useEffect(() => { fetchFlags() }, [filter])

    async function updateFlag(id, updates) {
        setUpdating(id)
        const { error } = await supabase.from('flags_and_alerts').update({
            ...updates,
            reviewed_by_admin: true,
        }).eq('id', id)

        if (error) {
            showToast('Update failed: ' + error.message, 'error')
        } else {
            await writeAuditLog(supabase, {
                action: 'RESOLVE', table_name: 'flags_and_alerts', record_id: id,
                details: updates,
            })
            showToast('Flag updated successfully')
            fetchFlags()
        }
        setUpdating(null)
    }

    async function saveNote() {
        await updateFlag(noteModal.id, { notes: noteText })
        setNoteModal(null)
    }

    const counts = {
        open: flags.filter(f => f.resolution_status === 'open').length,
        escalated: flags.filter(f => f.resolution_status === 'escalated').length,
        critical: flags.filter(f => f.severity === 'critical' && f.resolution_status !== 'resolved').length,
    }

    return (
        <div className="space-y-6">

            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold
          ${toast.type === 'error' ? 'bg-alert' : 'bg-safe'}`}>
                    {toast.type === 'error' ? '⚠️' : '✅'} {toast.msg}
                </div>
            )}

            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Compliance</p>
                <h1>Review Flags & Alerts</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Review flagged transactions, update their status, escalate to the DPP, or mark as resolved.
                    All actions are recorded in the audit log.
                </p>
            </div>

            {/* Status overview */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border-l-4 border-l-alert border border-ash-dark p-4 text-center">
                    <p className="text-2xl font-bold text-alert">{counts.critical}</p>
                    <p className="text-xs text-gray-500 mt-0.5">🔴 Critical Unresolved</p>
                </div>
                <div className="bg-white rounded-2xl border-l-4 border-l-orange-400 border border-ash-dark p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">{counts.open}</p>
                    <p className="text-xs text-gray-500 mt-0.5">⏳ Open (Pending Review)</p>
                </div>
                <div className="bg-white rounded-2xl border-l-4 border-l-purple-400 border border-ash-dark p-4 text-center">
                    <p className="text-2xl font-bold text-purple-700">{counts.escalated}</p>
                    <p className="text-xs text-gray-500 mt-0.5">↑ Escalated to DPP</p>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
                {[
                    { key: 'open', label: 'Open & Escalated' },
                    { key: 'all', label: 'All Flags' },
                    { key: 'resolved', label: 'Resolved' },
                ].map(f => (
                    <button key={f.key} onClick={() => setFilter(f.key)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors
              ${filter === f.key ? 'bg-navy text-white' : 'bg-white border border-ash-dark text-gray-600 hover:border-navy'}`}>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Flags list */}
            {loading ? (
                <div className="text-center py-16 text-gray-400 animate-pulse">Loading flags…</div>
            ) : flags.length === 0 ? (
                <div className="bg-white rounded-2xl border border-ash-dark p-12 text-center text-gray-400">
                    {filter === 'resolved' ? '✅ No resolved flags yet.' : '🎉 No open flags — everything looks clean!'}
                </div>
            ) : (
                <div className="space-y-4">
                    {flags.map(flag => {
                        const amount = flag.contributions?.amount_kes || flag.expenditures?.amount_kes
                        const entity = flag.contributions?.donor_name || flag.expenditures?.vendor_name
                        const isUpdating = updating === flag.id
                        const isResolved = flag.resolution_status === 'resolved'

                        return (
                            <div key={flag.id}
                                className={`bg-white rounded-2xl border border-ash-dark overflow-hidden
                  ${flag.severity === 'critical' ? 'border-l-4 border-l-alert' : flag.severity === 'medium' ? 'border-l-4 border-l-orange-400' : 'border-l-4 border-l-yellow-400'}
                  ${isResolved ? 'opacity-60' : ''}`}>

                                {/* Flag header */}
                                <div className="px-6 py-4 flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <SeverityBadge severity={flag.severity} />
                                            <ResolutionBadge status={flag.resolution_status} />
                                            {flag.reviewed_by_admin && (
                                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                                                    👁 Reviewed
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mt-1">
                                            {FLAG_TYPE_LABELS[flag.flag_type] || flag.flag_type}
                                        </p>
                                        <p className="font-bold text-navy mt-0.5">
                                            {flag.candidates?.full_name}
                                            <span className="font-normal text-gray-400 text-sm ml-2">
                                                {flag.candidates?.political_parties?.abbreviation} ·{' '}
                                                <span className="capitalize">{flag.candidates?.election_type}</span> ·{' '}
                                                {flag.candidates?.county}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        {amount && <p className="text-xl font-bold text-navy font-mono">{formatKES(amount)}</p>}
                                        {entity && <p className="text-xs text-gray-400 mt-0.5">{entity}</p>}
                                        {flag.contributions?.donor_type && (
                                            <p className="text-xs text-gray-400 capitalize">{flag.contributions.donor_type} donor</p>
                                        )}
                                    </div>
                                </div>

                                {/* Flag body */}
                                <div className="px-6 pb-4">
                                    <div className="bg-ash rounded-xl p-3 mb-4">
                                        <p className="text-xs font-semibold text-gray-500 mb-1">Violation Details</p>
                                        <p className="text-sm text-gray-700">{flag.notes}</p>
                                        {flag.contributions?.source_document && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                📄 Source: {flag.contributions.source_document}
                                            </p>
                                        )}
                                    </div>

                                    <div className="text-xs text-gray-400 mb-4">
                                        Flagged: {new Date(flag.flagged_date).toLocaleString('en-KE')}
                                    </div>

                                    {/* Action buttons */}
                                    {!isResolved && (
                                        <div className="flex flex-wrap gap-2">
                                            <button disabled={isUpdating} onClick={() => updateFlag(flag.id, { resolution_status: 'resolved' })}
                                                className="bg-safe text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-safe-dark transition-colors disabled:opacity-50">
                                                ✅ Mark Resolved
                                            </button>
                                            <button disabled={isUpdating} onClick={() => updateFlag(flag.id, { resolution_status: 'escalated' })}
                                                className="bg-purple-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50">
                                                ↑ Escalate to DPP
                                            </button>
                                            <button disabled={isUpdating}
                                                onClick={() => { setNoteModal(flag); setNoteText(flag.notes || '') }}
                                                className="bg-white border border-gray-300 text-gray-600 text-xs font-semibold px-3 py-2 rounded-lg hover:border-navy hover:text-navy transition-colors disabled:opacity-50">
                                                ✏️ Edit Note
                                            </button>
                                            <button disabled={isUpdating} onClick={() => updateFlag(flag.id, { reviewed_by_admin: true })}
                                                className="bg-white border border-gray-300 text-gray-600 text-xs font-semibold px-3 py-2 rounded-lg hover:border-navy hover:text-navy transition-colors disabled:opacity-50">
                                                👁 Mark Reviewed
                                            </button>
                                        </div>
                                    )}
                                    {isResolved && (
                                        <button onClick={() => updateFlag(flag.id, { resolution_status: 'open' })}
                                            className="text-xs text-gray-400 hover:text-navy underline transition-colors">
                                            Reopen flag
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Edit note modal */}
            {noteModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
                        <h3 className="text-navy font-bold text-lg mb-4">Edit Flag Note</h3>
                        <p className="text-xs text-gray-400 mb-3">
                            Flag ID: <span className="font-mono">{noteModal.id}</span>
                        </p>
                        <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={5}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy" />
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => setNoteModal(null)} className="btn-outline text-sm flex-1">Cancel</button>
                            <button onClick={saveNote} className="btn-primary text-sm flex-1">Save Note</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
