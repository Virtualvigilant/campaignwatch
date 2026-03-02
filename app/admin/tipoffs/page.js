'use client'
// app/admin/tipoffs/page.js — Admin Tip-Off Review Page
import { useEffect, useState } from 'react'
import { createBrowserClient, writeAuditLog } from '@/lib/supabaseAdmin'

const TIP_TYPE_LABELS = {
    undeclared_donation: '💰 Undeclared Donation',
    cash_distribution: '💵 Cash Distribution',
    foreign_funding: '🌍 Foreign Funding',
    vote_buying: '🗳️ Vote Buying',
    spending_violation: '📊 Spending Violation',
    other: '📋 Other',
}

const STATUS_STYLES = {
    received: { cls: 'bg-blue-100 text-blue-800 border-blue-300', label: '🆕 Received' },
    under_review: { cls: 'bg-gold/10 text-gold-dark border-gold/30', label: '🔍 Under Review' },
    actioned: { cls: 'bg-safe/10 text-safe-dark border-safe/30', label: '✅ Actioned' },
    dismissed: { cls: 'bg-gray-100 text-gray-600 border-gray-300', label: '✕ Dismissed' },
}

export default function AdminTipOffsPage() {
    const supabase = createBrowserClient()
    const [tips, setTips] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('received')
    const [expanded, setExpanded] = useState(null)
    const [noteId, setNoteId] = useState(null)
    const [noteText, setNoteText] = useState('')
    const [updating, setUpdating] = useState(null)
    const [toast, setToast] = useState(null)

    function showToast(msg, type = 'success') {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }

    async function fetchTips() {
        setLoading(true)
        let query = supabase
            .from('tip_offs')
            .select('*')
            .order('created_at', { ascending: false })

        if (filter !== 'all') query = query.eq('status', filter)

        const { data } = await query
        setTips(data || [])
        setLoading(false)
    }

    useEffect(() => { fetchTips() }, [filter])

    async function updateStatus(id, newStatus) {
        setUpdating(id)
        const { error } = await supabase
            .from('tip_offs')
            .update({ status: newStatus })
            .eq('id', id)

        if (error) {
            showToast('Update failed: ' + error.message, 'error')
        } else {
            await writeAuditLog(supabase, {
                action: 'UPDATE',
                table_name: 'tip_offs',
                record_id: id,
                details: { status: newStatus },
            })
            showToast(`Tip-off marked as ${newStatus.replace('_', ' ')}`)
            fetchTips()
        }
        setUpdating(null)
    }

    async function saveNote() {
        setUpdating(noteId)
        const { error } = await supabase
            .from('tip_offs')
            .update({ admin_notes: noteText })
            .eq('id', noteId)

        if (error) {
            showToast('Failed to save note: ' + error.message, 'error')
        } else {
            await writeAuditLog(supabase, {
                action: 'UPDATE',
                table_name: 'tip_offs',
                record_id: noteId,
                details: { admin_notes: noteText },
            })
            showToast('Admin note saved')
            fetchTips()
        }
        setNoteId(null)
        setUpdating(null)
    }

    const counts = {
        received: tips.length > 0 || filter === 'received' ? tips.filter(t => t.status === 'received').length : '—',
        under_review: tips.length > 0 || filter === 'under_review' ? tips.filter(t => t.status === 'under_review').length : '—',
        actioned: tips.length > 0 || filter === 'actioned' ? tips.filter(t => t.status === 'actioned').length : '—',
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
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Citizen Reports</p>
                <h1>Tip-Off Inbox</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Review anonymous citizen reports submitted through the public whistleblower portal.
                    Update statuses and add investigation notes.
                </p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border-l-4 border-l-blue-400 border border-ash-dark p-4 text-center">
                    <p className="text-2xl font-bold text-blue-700">{filter === 'all' ? tips.filter(t => t.status === 'received').length : (filter === 'received' ? tips.length : counts.received)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">🆕 New (Received)</p>
                </div>
                <div className="bg-white rounded-2xl border-l-4 border-l-gold border border-ash-dark p-4 text-center">
                    <p className="text-2xl font-bold text-gold-dark">{filter === 'all' ? tips.filter(t => t.status === 'under_review').length : (filter === 'under_review' ? tips.length : counts.under_review)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">🔍 Under Review</p>
                </div>
                <div className="bg-white rounded-2xl border-l-4 border-l-safe border border-ash-dark p-4 text-center">
                    <p className="text-2xl font-bold text-safe-dark">{filter === 'all' ? tips.filter(t => t.status === 'actioned').length : (filter === 'actioned' ? tips.length : counts.actioned)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">✅ Actioned</p>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { key: 'received', label: '🆕 New' },
                    { key: 'under_review', label: '🔍 Under Review' },
                    { key: 'all', label: '📋 All' },
                    { key: 'actioned', label: '✅ Actioned' },
                    { key: 'dismissed', label: '✕ Dismissed' },
                ].map(f => (
                    <button key={f.key} onClick={() => setFilter(f.key)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors
              ${filter === f.key ? 'bg-navy text-white' : 'bg-white border border-ash-dark text-gray-600 hover:border-navy'}`}>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Tips list */}
            {loading ? (
                <div className="text-center py-16 text-gray-400 animate-pulse">Loading tip-offs…</div>
            ) : tips.length === 0 ? (
                <div className="bg-white rounded-2xl border border-ash-dark p-12 text-center text-gray-400">
                    {filter === 'received' ? '🎉 No new tip-offs to review.' : `No tip-offs with status "${filter.replace('_', ' ')}".`}
                </div>
            ) : (
                <div className="space-y-4">
                    {tips.map(tip => {
                        const isExpanded = expanded === tip.id
                        const statusInfo = STATUS_STYLES[tip.status] || STATUS_STYLES.received
                        const isUpdating = updating === tip.id

                        return (
                            <div key={tip.id}
                                className="bg-white rounded-2xl border border-ash-dark overflow-hidden">

                                {/* Header row — click to expand */}
                                <button onClick={() => setExpanded(isExpanded ? null : tip.id)}
                                    className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-ash/50 transition-colors">

                                    {/* Status badge */}
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border flex-shrink-0 ${statusInfo.cls}`}>
                                        {statusInfo.label}
                                    </span>

                                    {/* Type + subject */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-navy truncate">
                                            {TIP_TYPE_LABELS[tip.tip_type] || tip.tip_type}
                                            {tip.subject_name && (
                                                <span className="font-normal text-gray-500 ml-2">— {tip.subject_name}</span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate mt-0.5">{tip.description}</p>
                                    </div>

                                    {/* Reference + time */}
                                    <div className="text-right flex-shrink-0">
                                        <p className="font-mono text-xs text-gold font-bold">{tip.reference_code}</p>
                                        <p className="text-xs text-gray-400">{new Date(tip.created_at).toLocaleDateString('en-KE')}</p>
                                    </div>

                                    {/* Expand arrow */}
                                    <span className={`text-gray-400 text-xs transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                                </button>

                                {/* Expanded details */}
                                {isExpanded && (
                                    <div className="px-6 pb-5 border-t border-ash-dark pt-4 space-y-4">

                                        {/* Full description */}
                                        <div className="bg-ash rounded-xl p-4">
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Description</p>
                                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{tip.description}</p>
                                        </div>

                                        {/* Details grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {[
                                                { label: 'Location', value: tip.location || 'Not specified' },
                                                { label: 'Date', value: tip.incident_date ? new Date(tip.incident_date).toLocaleDateString('en-KE') : 'Not specified' },
                                                { label: 'Contact', value: tip.contact_method === 'none' ? '🛡️ Anonymous' : `${tip.contact_method}: ${tip.contact_detail || '—'}` },
                                                { label: 'Submitted', value: new Date(tip.created_at).toLocaleString('en-KE') },
                                            ].map(d => (
                                                <div key={d.label} className="bg-white border border-ash-dark rounded-lg p-3">
                                                    <p className="text-xs text-gray-400 font-semibold">{d.label}</p>
                                                    <p className="text-sm text-navy mt-0.5 break-words">{d.value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Evidence */}
                                        {tip.evidence_description && (
                                            <div className="bg-gold/5 border border-gold/20 rounded-xl p-4">
                                                <p className="text-xs font-bold text-gold-dark mb-1">📎 Evidence Described</p>
                                                <p className="text-sm text-gray-700">{tip.evidence_description}</p>
                                            </div>
                                        )}

                                        {/* Admin notes */}
                                        {tip.admin_notes && (
                                            <div className="bg-navy/5 border border-navy/10 rounded-xl p-4">
                                                <p className="text-xs font-bold text-navy mb-1">📝 Admin Notes</p>
                                                <p className="text-sm text-gray-700">{tip.admin_notes}</p>
                                            </div>
                                        )}

                                        {/* Action buttons */}
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {tip.status !== 'under_review' && (
                                                <button disabled={isUpdating} onClick={() => updateStatus(tip.id, 'under_review')}
                                                    className="bg-gold text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gold-dark transition-colors disabled:opacity-50">
                                                    🔍 Mark Under Review
                                                </button>
                                            )}
                                            {tip.status !== 'actioned' && (
                                                <button disabled={isUpdating} onClick={() => updateStatus(tip.id, 'actioned')}
                                                    className="bg-safe text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-safe-dark transition-colors disabled:opacity-50">
                                                    ✅ Mark Actioned
                                                </button>
                                            )}
                                            {tip.status !== 'dismissed' && (
                                                <button disabled={isUpdating} onClick={() => updateStatus(tip.id, 'dismissed')}
                                                    className="bg-gray-200 text-gray-600 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50">
                                                    ✕ Dismiss
                                                </button>
                                            )}
                                            {tip.status === 'dismissed' && (
                                                <button disabled={isUpdating} onClick={() => updateStatus(tip.id, 'received')}
                                                    className="text-xs text-gray-400 hover:text-navy underline">
                                                    Reopen
                                                </button>
                                            )}
                                            <button disabled={isUpdating}
                                                onClick={() => { setNoteId(tip.id); setNoteText(tip.admin_notes || '') }}
                                                className="bg-white border border-gray-300 text-gray-600 text-xs font-semibold px-4 py-2 rounded-lg hover:border-navy hover:text-navy transition-colors disabled:opacity-50">
                                                ✏️ Add/Edit Note
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Note modal */}
            {noteId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
                        <h3 className="text-navy font-bold text-lg mb-1">Admin Notes</h3>
                        <p className="text-xs text-gray-400 mb-4">
                            Add investigation notes or internal comments. These are only visible to admin staff.
                        </p>
                        <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={5}
                            placeholder="Add investigation notes, actions taken, or follow-up details…"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy" />
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => setNoteId(null)} className="btn-outline text-sm flex-1">Cancel</button>
                            <button onClick={saveNote} className="btn-primary text-sm flex-1">Save Note</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
