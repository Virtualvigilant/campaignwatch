'use client'
// app/admin/manage/page.js — Manage Records (Edit & Delete)
import { useEffect, useState } from 'react'
import { createBrowserClient, formatKES, writeAuditLog } from '@/lib/supabaseAdmin'
import { StatusBadge } from '@/components/FlagBadge'

const TABLES = ['contributions', 'expenditures', 'candidates']

const TABLE_COLUMNS = {
    contributions: ['donor_name', 'donor_type', 'amount_kes', 'contribution_date', 'flag_status', 'source_document'],
    expenditures: ['category', 'vendor_name', 'amount_kes', 'expenditure_date', 'flag_status', 'description'],
    candidates: ['full_name', 'election_type', 'county', 'constituency', 'declared_spending_limit'],
}

const EDITABLE_FIELDS = {
    contributions: [
        { key: 'donor_name', label: 'Donor Name', type: 'text' },
        { key: 'donor_type', label: 'Donor Type', type: 'select', options: ['individual', 'corporate', 'foreign', 'anonymous'] },
        { key: 'amount_kes', label: 'Amount (KES)', type: 'number' },
        { key: 'contribution_date', label: 'Date', type: 'date' },
        { key: 'flag_status', label: 'Flag Status', type: 'select', options: ['clean', 'flagged', 'critical'] },
        { key: 'source_document', label: 'Source Document', type: 'text' },
    ],
    expenditures: [
        { key: 'category', label: 'Category', type: 'select', options: ['advertising', 'rallies', 'transport', 'staff', 'printing', 'other'] },
        { key: 'vendor_name', label: 'Vendor', type: 'text' },
        { key: 'amount_kes', label: 'Amount (KES)', type: 'number' },
        { key: 'expenditure_date', label: 'Date', type: 'date' },
        { key: 'flag_status', label: 'Flag Status', type: 'select', options: ['clean', 'flagged', 'critical'] },
        { key: 'description', label: 'Description', type: 'text' },
    ],
    candidates: [
        { key: 'full_name', label: 'Full Name', type: 'text' },
        { key: 'election_type', label: 'Election Type', type: 'select', options: ['presidential', 'gubernatorial', 'parliamentary', 'senatorial', 'women_rep'] },
        { key: 'county', label: 'County', type: 'text' },
        { key: 'constituency', label: 'Constituency', type: 'text' },
        { key: 'declared_spending_limit', label: 'Spending Limit (KES)', type: 'number' },
    ],
}

export default function ManagePage() {
    const supabase = createBrowserClient()
    const [activeTable, setActiveTable] = useState('contributions')
    const [records, setRecords] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [editing, setEditing] = useState(null)  // record being edited
    const [editForm, setEditForm] = useState({})
    const [saving, setSaving] = useState(false)
    const [deleteId, setDeleteId] = useState(null)  // confirm delete
    const [toast, setToast] = useState(null)

    function showToast(msg, type = 'success') {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3500)
    }

    async function fetchRecords() {
        setLoading(true)
        const cols = TABLE_COLUMNS[activeTable].join(',') + ',id'
        const { data } = await supabase.from(activeTable).select(cols)
            .order('created_at', { ascending: false })
        setRecords(data || [])
        setLoading(false)
    }

    useEffect(() => { fetchRecords() }, [activeTable])

    // ── Filter by search ──────────────────────────────────────────
    const filtered = records.filter(r => {
        const str = Object.values(r).join(' ').toLowerCase()
        return str.includes(search.toLowerCase())
    })

    // ── Open edit modal ───────────────────────────────────────────
    function openEdit(record) {
        setEditing(record)
        setEditForm({ ...record })
    }

    // ── Save edited record ────────────────────────────────────────
    async function saveEdit() {
        setSaving(true)
        const { error } = await supabase.from(activeTable).update(editForm).eq('id', editing.id)
        if (error) {
            showToast('Failed to save: ' + error.message, 'error')
        } else {
            await writeAuditLog(supabase, {
                action: 'UPDATE', table_name: activeTable, record_id: editing.id,
                details: { before: editing, after: editForm },
            })
            showToast('Record updated successfully')
            setEditing(null)
            fetchRecords()
        }
        setSaving(false)
    }

    // ── Delete record ─────────────────────────────────────────────
    async function confirmDelete() {
        const { error } = await supabase.from(activeTable).delete().eq('id', deleteId)
        if (error) {
            showToast('Delete failed: ' + error.message, 'error')
        } else {
            await writeAuditLog(supabase, {
                action: 'DELETE', table_name: activeTable, record_id: deleteId,
            })
            showToast('Record deleted')
            fetchRecords()
        }
        setDeleteId(null)
    }

    function renderCell(key, value) {
        if (!value && value !== 0) return <span className="text-gray-300">—</span>
        if (key === 'amount_kes' || key === 'declared_spending_limit') return formatKES(value)
        if (key === 'flag_status') return <StatusBadge status={value} />
        if (key.endsWith('_date')) return new Date(value).toLocaleDateString('en-KE')
        if (typeof value === 'string' && value.length > 40) return value.slice(0, 40) + '…'
        return value
    }

    const cols = TABLE_COLUMNS[activeTable]
    const fields = EDITABLE_FIELDS[activeTable]

    return (
        <div className="space-y-6">

            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold transition-all
          ${toast.type === 'error' ? 'bg-alert' : 'bg-safe'}`}>
                    {toast.type === 'error' ? '⚠️' : '✅'} {toast.msg}
                </div>
            )}

            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Data Management</p>
                <h1>Manage Records</h1>
                <p className="text-gray-500 text-sm mt-1">Edit or delete individual records. All changes are logged in the audit trail.</p>
            </div>

            {/* Table tabs */}
            <div className="flex gap-2">
                {TABLES.map(t => (
                    <button key={t} onClick={() => setActiveTable(t)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors capitalize
              ${activeTable === t ? 'bg-navy text-white' : 'bg-white border border-ash-dark text-gray-600 hover:border-navy'}`}>
                        {t}
                    </button>
                ))}
            </div>

            {/* Search + record count */}
            <div className="flex items-center gap-3">
                <input type="text" placeholder={`Search ${activeTable}…`}
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="flex-1 border border-ash-dark rounded-xl px-4 py-2.5 text-sm
                     focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy" />
                <span className="text-xs text-gray-400 whitespace-nowrap">
                    {filtered.length} of {records.length} records
                </span>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-ash-dark overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
                                {cols.map(c => (
                                    <th key={c} className="table-header capitalize">{c.replace(/_/g, ' ')}</th>
                                ))}
                                <th className="table-header">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={cols.length + 1} className="table-cell text-center py-12 text-gray-400 animate-pulse">Loading…</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={cols.length + 1} className="table-cell text-center py-12 text-gray-400">No records found.</td></tr>
                            ) : filtered.map(r => (
                                <tr key={r.id} className="hover:bg-ash transition-colors">
                                    {cols.map(c => (
                                        <td key={c} className="table-cell">{renderCell(c, r[c])}</td>
                                    ))}
                                    <td className="table-cell">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEdit(r)}
                                                className="text-xs font-semibold text-navy hover:underline">Edit</button>
                                            <span className="text-gray-300">|</span>
                                            <button onClick={() => setDeleteId(r.id)}
                                                className="text-xs font-semibold text-alert hover:underline">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── EDIT MODAL ──────────────────────────────────────────── */}
            {editing && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="bg-navy text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
                            <h3 className="text-white font-bold">Edit Record</h3>
                            <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-ash rounded-xl px-4 py-2 text-xs text-gray-400 font-mono">
                                ID: {editing.id}
                            </div>
                            {fields.map(f => (
                                <div key={f.key}>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">{f.label}</label>
                                    {f.type === 'select' ? (
                                        <select value={editForm[f.key] || ''} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20">
                                            {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                                        </select>
                                    ) : (
                                        <input type={f.type} value={editForm[f.key] || ''} onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20" />
                                    )}
                                </div>
                            ))}
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setEditing(null)} className="btn-outline text-sm flex-1">Cancel</button>
                                <button onClick={saveEdit} disabled={saving}
                                    className="btn-primary text-sm flex-1 disabled:opacity-50">
                                    {saving ? 'Saving…' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── DELETE CONFIRM MODAL ─────────────────────────────────── */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
                        <div className="text-4xl mb-4">⚠️</div>
                        <h3 className="text-navy font-bold text-lg mb-2">Delete Record?</h3>
                        <p className="text-gray-500 text-sm mb-5">
                            This action cannot be undone. The record will be permanently removed from the database.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteId(null)} className="btn-outline text-sm flex-1">Cancel</button>
                            <button onClick={confirmDelete}
                                className="bg-alert text-white font-semibold px-4 py-2 rounded-lg hover:bg-alert-dark transition-colors flex-1 text-sm">
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
