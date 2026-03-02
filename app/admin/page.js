'use client'
// app/admin/page.js — Admin Overview Dashboard
import { useEffect, useState } from 'react'
import { createBrowserClient, formatKES } from '@/lib/supabaseAdmin'
import Link from 'next/link'

function QuickStat({ icon, value, label, color = 'navy' }) {
    const border = { navy: 'border-l-navy', gold: 'border-l-gold', alert: 'border-l-alert', safe: 'border-l-safe' }[color]
    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-ash-dark border-l-4 ${border} p-5`}>
            <p className="text-2xl font-bold text-navy">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{icon} {label}</p>
        </div>
    )
}

const ACTION_COLORS = {
    UPLOAD: 'bg-blue-100 text-blue-800',
    INSERT: 'bg-safe/10 text-safe-dark',
    UPDATE: 'bg-gold/10 text-gold-dark',
    DELETE: 'bg-alert/10 text-alert-dark',
    RESOLVE: 'bg-purple-100 text-purple-800',
}

export default function AdminOverviewPage() {
    const supabase = createBrowserClient()
    const [stats, setStats] = useState(null)
    const [logs, setLogs] = useState([])
    const [admin, setAdmin] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser()

            const [
                { data: adminData },
                { data: candidates },
                { data: contributions },
                { data: expenditures },
                { data: flags },
                { data: auditLogs },
            ] = await Promise.all([
                supabase.from('admin_users').select('*').eq('id', user.id).single(),
                supabase.from('candidates').select('id', { count: 'exact' }),
                supabase.from('contributions').select('amount_kes, flag_status'),
                supabase.from('expenditures').select('amount_kes, flag_status'),
                supabase.from('flags_and_alerts').select('id, severity, resolution_status'),
                supabase.from('audit_log').select('*, admin_users(full_name)')
                    .order('created_at', { ascending: false }).limit(15),
            ])

            setAdmin(adminData)
            setStats({
                candidates: (candidates || []).length,
                totalRaised: (contributions || []).reduce((s, c) => s + c.amount_kes, 0),
                totalSpent: (expenditures || []).reduce((s, e) => s + e.amount_kes, 0),
                openFlags: (flags || []).filter(f => f.resolution_status === 'open').length,
                criticalFlags: (flags || []).filter(f => f.severity === 'critical' && f.resolution_status !== 'resolved').length,
                totalRecords: (contributions || []).length + (expenditures || []).length,
            })
            setLogs(auditLogs || [])
            setLoading(false)
        }
        load()
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center h-64 text-gray-400 animate-pulse">
            Loading overview…
        </div>
    )

    return (
        <div className="space-y-8">

            {/* Welcome */}
            <div className="bg-navy rounded-2xl px-8 py-6 text-white flex items-center justify-between">
                <div>
                    <p className="text-gold font-bold text-lg">Welcome back, {admin?.full_name || 'Admin'} 👋</p>
                    <p className="text-gray-400 text-sm mt-1">
                        Role: <span className="capitalize text-white font-medium">{admin?.role?.replace('_', ' ')}</span>
                        &nbsp;·&nbsp; Last login: {admin?.last_login
                            ? new Date(admin.last_login).toLocaleString('en-KE')
                            : 'First login'}
                    </p>
                </div>
                <span className="text-4xl">🛡️</span>
            </div>

            {/* Quick stats */}
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Database Summary</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <QuickStat icon="🏛️" value={stats.candidates} label="Candidates in DB" color="navy" />
                    <QuickStat icon="💰" value={formatKES(stats.totalRaised)} label="Total Contributions Logged" color="gold" />
                    <QuickStat icon="📊" value={formatKES(stats.totalSpent)} label="Total Expenditure Logged" color="navy" />
                    <QuickStat icon="📝" value={stats.totalRecords} label="Total Records" color="safe" />
                    <QuickStat icon="🚩" value={stats.openFlags} label="Open Flags" color="alert" />
                    <QuickStat icon="🔴" value={stats.criticalFlags} label="Unresolved Critical Flags" color="alert" />
                </div>
            </div>

            {/* Quick actions */}
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Quick Actions</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { href: '/admin/upload', icon: '⬆️', label: 'Upload CSV Data', desc: 'Import IEBC filings', color: 'bg-navy text-white' },
                        { href: '/admin/manage', icon: '🗂️', label: 'Manage Records', desc: 'Edit or delete entries', color: 'bg-white border border-navy text-navy' },
                        { href: '/admin/flags', icon: '🚩', label: 'Review Flags', desc: `${stats.openFlags} awaiting review`, color: 'bg-alert text-white' },
                    ].map(a => (
                        <Link key={a.href} href={a.href}
                            className={`${a.color} rounded-2xl p-5 flex items-start gap-4 hover:opacity-90 transition-opacity shadow-sm`}>
                            <span className="text-3xl">{a.icon}</span>
                            <div>
                                <p className="font-bold">{a.label}</p>
                                <p className="text-sm opacity-75 mt-0.5">{a.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Audit log */}
            <div className="bg-white rounded-2xl shadow-sm border border-ash-dark p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Recent Activity</p>
                <h2 className="text-navy mb-4">Audit Log</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
                                {['Action', 'Table', 'Admin', 'Details', 'Time'].map(h => (
                                    <th key={h} className="table-header">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-ash transition-colors">
                                    <td className="table-cell">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-700'}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="table-cell text-gray-500">{log.table_name || '—'}</td>
                                    <td className="table-cell font-medium">{log.admin_users?.full_name || '—'}</td>
                                    <td className="table-cell text-xs text-gray-400 max-w-xs truncate">
                                        {log.details ? JSON.stringify(log.details).slice(0, 60) + '…' : '—'}
                                    </td>
                                    <td className="table-cell text-xs text-gray-400">
                                        {new Date(log.created_at).toLocaleString('en-KE')}
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr><td colSpan={5} className="table-cell text-center text-gray-400 py-8">No activity yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}
