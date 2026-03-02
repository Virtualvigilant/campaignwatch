// components/CandidateCard.js
import Link from 'next/link'
import { formatKES, spendingPercent } from '@/lib/supabase'
import RiskBadge from './RiskBadge'

export default function CandidateCard({ candidate, totalSpent, flagCount }) {
  const pct = spendingPercent(totalSpent, candidate.declared_spending_limit)
  const barColor = pct >= 100 ? 'bg-risk-high' : pct >= 75 ? 'bg-risk-medium' : 'bg-risk-low'

  const hasFlags = flagCount > 0
  const riskLevel = flagCount > 2 ? 'high' : flagCount > 0 ? 'medium' : 'low'

  return (
    <Link href={`/candidates/${candidate.id}`}
      className="card card-hoverable block group">

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-text-primary group-hover:text-accent-kenya transition-colors">
            {candidate.full_name}
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {candidate.political_parties?.abbreviation} &nbsp;·&nbsp;
            {candidate.county} &nbsp;·&nbsp;
            <span className="capitalize">{candidate.election_type}</span>
          </p>
        </div>
        {hasFlags && (
          <RiskBadge level={riskLevel} />
        )}
      </div>

      {/* Spending bar */}
      <div className="mb-3 bg-gray-50 rounded-lg p-3 border border-border-subtle">
        <div className="flex justify-between text-xs text-text-secondary mb-1.5">
          <span>Spent: <strong className="text-text-primary">{formatKES(totalSpent)}</strong></span>
          <span>Limit: {formatKES(candidate.declared_spending_limit)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div className={`h-1.5 rounded-full ${barColor} transition-all`}
            style={{ width: `${pct}%` }} />

        </div>
        <p className="text-right text-[10px] text-text-secondary mt-1 font-semibold">{pct}% of limit used</p>
      </div>

      <p className="text-xs text-accent-kenya font-semibold mt-2 group-hover:underline">View full profile →</p>
    </Link>
  )
}
