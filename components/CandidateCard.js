// components/CandidateCard.js
import Link from 'next/link'
import { formatKES, spendingPercent } from '@/lib/supabase'
import { StatusBadge } from './FlagBadge'

export default function CandidateCard({ candidate, totalSpent, flagCount }) {
  const pct = spendingPercent(totalSpent, candidate.declared_spending_limit)
  const barColor = pct >= 100 ? 'bg-alert' : pct >= 75 ? 'bg-gold' : 'bg-safe'

  return (
    <Link href={`/candidates/${candidate.id}`}
      className="card hover:shadow-md transition-shadow block group">

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-navy group-hover:text-navy-light transition-colors">
            {candidate.full_name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {candidate.political_parties?.abbreviation} &nbsp;·&nbsp;
            {candidate.county} &nbsp;·&nbsp;
            <span className="capitalize">{candidate.election_type}</span>
          </p>
        </div>
        {flagCount > 0 && (
          <span className="bg-alert/10 text-alert text-xs font-bold px-2 py-0.5 rounded-full border border-alert/20">
            🚩 {flagCount} flag{flagCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Spending bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Spent: <strong className="text-navy">{formatKES(totalSpent)}</strong></span>
          <span>Limit: {formatKES(candidate.declared_spending_limit)}</span>
        </div>
        <div className="w-full bg-ash-dark rounded-full h-2">
          <div className={`h-2 rounded-full ${barColor} transition-all`}
               style={{ width: `${pct}%` }} />
        </div>
        <p className="text-right text-xs text-gray-400 mt-0.5">{pct}% of limit used</p>
      </div>

      <p className="text-xs text-gold font-medium mt-2">View full profile →</p>
    </Link>
  )
}
