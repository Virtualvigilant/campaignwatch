// components/SpendComparison.js
import { formatKES } from '@/lib/supabase'

export default function SpendComparison({ declared, estimated, limit, currency = 'KES' }) {
    const safeLimit = limit || 1
    const declaredPct = Math.min((declared / safeLimit) * 100, 100)
    const estimatedPct = Math.min((estimated / safeLimit) * 100, 100)

    const totalEstimatedPct = Math.round((estimated / safeLimit) * 100)
    const overLimit = totalEstimatedPct > 100

    // For the orange bar, we just show 'estimated' overlaid or added
    // If we treat them as overlapping, 'estimated' bar is the full width, declared is blue inside it.

    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Spending Impact</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xl font-bold ${overLimit ? 'text-risk-high' : 'text-text-primary'}`}>
                            {totalEstimatedPct}%
                        </span>
                        <span className="text-sm text-text-secondary">of legal limit</span>
                    </div>
                </div>
                <div className="text-right text-xs">
                    <p className="text-text-secondary mb-1">Limit: <strong>{formatKES(limit)}</strong></p>
                </div>
            </div>

            {/* Container */}
            <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden">
                {/* Progress tracks directly on top of each other */}
                {/* Estimated track (Orange) - shows difference if larger than declared */}
                <div
                    className="absolute top-0 left-0 h-full bg-orange-400 opacity-80"
                    style={{ width: `${estimatedPct}%` }}
                    title="Estimated Spending"
                />
                {/* Declared track (Blue/Navy) */}
                <div
                    className="absolute top-0 left-0 h-full bg-blue-600"
                    style={{ width: `${declaredPct}%` }}
                    title="Declared Spending"
                />

                {/* Limit line - red zone highlight starts if over limit */}
                {overLimit && (
                    <div className="absolute top-0 left-0 h-full w-full border-r-4 border-risk-high opacity-50" />
                )}
            </div>

            {/* Legend */}
            <div className="flex gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                    <span className="text-text-secondary">Declared: <strong className="text-text-primary">{formatKES(declared)}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                    <span className="text-text-secondary">Estimated: <strong className="text-text-primary">{formatKES(estimated)}</strong></span>
                </div>
            </div>
        </div>
    )
}
