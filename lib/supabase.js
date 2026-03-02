// lib/supabase.js
// Single Supabase client used across the app

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xyzcompany.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy'

export const supabase = createClient(supabaseUrl, supabaseKey)

// ── Helper: format KES amounts ────────────────────────────────
export function formatKES(amount) {
  if (!amount) return 'KES 0'
  if (amount >= 1_000_000_000) return `KES ${(amount / 1_000_000_000).toFixed(1)}B`
  if (amount >= 1_000_000) return `KES ${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `KES ${(amount / 1_000).toFixed(0)}K`
  return `KES ${amount.toLocaleString()}`
}

// ── Helper: spending percentage against declared limit ────────
export function spendingPercent(spent, limit) {
  if (!limit) return 0
  return Math.min(Math.round((spent / limit) * 100), 100)
}
