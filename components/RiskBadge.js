// components/RiskBadge.js

export default function RiskBadge({ level }) {
    const map = {
        low: { cls: 'bg-green-50 text-risk-low border-green-200', icon: '✅', label: 'Safe' },
        medium: { cls: 'bg-amber-50 text-risk-medium border-amber-200', icon: '⚠️', label: 'Attention' },
        high: { cls: 'bg-red-50 text-risk-high border-red-200', icon: '🚩', label: 'Critical' },
    }

    const { cls, icon, label } = map[level] || map.low

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wide ${cls}`}>
            <span>{icon}</span> {label}
        </span>
    )
}
