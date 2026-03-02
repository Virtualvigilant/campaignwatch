// components/AlertCard.js
import { formatKES } from '@/lib/supabase'

export default function AlertCard({ candidate, position, issue, amount, risk, date }) {
    const borderColors = {
        low: 'border-l-risk-low',
        medium: 'border-l-risk-medium',
        high: 'border-l-risk-high'
    }

    const iconColors = {
        low: 'text-risk-low bg-green-50',
        medium: 'text-risk-medium bg-amber-50',
        high: 'text-risk-high bg-red-50'
    }

    const icon = risk === 'high' ? '🚩' : risk === 'medium' ? '⚠️' : 'ℹ️'

    return (
        <div className={`card border-l-4 ${borderColors[risk] || borderColors.medium} hover:bg-gray-50 cursor-pointer group`}>
            <div className="flex items-start gap-4">
                {/* Candidate Avatar minimal fallback */}
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-text-secondary font-bold shrink-0">
                    {candidate.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                        <h4 className="font-bold text-text-primary truncate">{candidate}</h4>
                        <span className="text-xs text-text-secondary whitespace-nowrap">{date}</span>
                    </div>
                    <p className="text-xs text-text-secondary truncate mb-2">{position}</p>

                    <div className="bg-gray-50 rounded-lg p-2.5 border border-border-subtle group-hover:bg-white transition-colors">
                        <div className="flex gap-2 items-start mb-1">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${iconColors[risk] || iconColors.medium} text-[10px]`}>
                                {icon}
                            </span>
                            <p className="text-sm font-semibold text-text-primary line-clamp-2">{issue}</p>
                        </div>
                        {amount && amount > 0 && (
                            <p className="text-xs font-mono font-bold text-text-secondary ml-7 mt-1 tracking-tight">
                                Involving: {formatKES(amount)}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
