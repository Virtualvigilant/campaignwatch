// lib/supabaseAdmin.js
// Supabase client with auth helpers for admin panel

import { createClient } from '@supabase/supabase-js'

// Server-side client (for Server Components and API routes)
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Client-side Supabase client (singleton — prevents auth lock contention)
let _browserClient = null
export function createBrowserClient() {
    if (!_browserClient) {
        _browserClient = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        )
    }
    return _browserClient
}

// ── Write an audit log entry ──────────────────────────────────
export async function writeAuditLog(client, { action, table_name, record_id, details }) {
    const { data: { user } } = await client.auth.getUser()
    if (!user) return
    await client.from('audit_log').insert({
        admin_id: user.id,
        action,
        table_name,
        record_id: record_id || null,
        details: details || null,
    })
}

// ── Parse a CSV string into array of objects ──────────────────
export function parseCSV(text) {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return []
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    return lines.slice(1).map(line => {
        // Handle quoted values with commas inside
        const values = []
        let cur = '', inQuotes = false
        for (const ch of line) {
            if (ch === '"') { inQuotes = !inQuotes }
            else if (ch === ',' && !inQuotes) { values.push(cur.trim()); cur = '' }
            else { cur += ch }
        }
        values.push(cur.trim())
        return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
    })
}

// ── Format KES ───────────────────────────────────────────────
export function formatKES(amount) {
    if (!amount) return 'KES 0'
    const n = Number(amount)
    if (n >= 1_000_000_000) return `KES ${(n / 1_000_000_000).toFixed(1)}B`
    if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(1)}M`
    return `KES ${n.toLocaleString()}`
}
