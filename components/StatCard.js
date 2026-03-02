// components/StatCard.js
export default function StatCard({ icon, value, label, sub, color = 'navy' }) {
  const border = {
    navy: 'border-l-navy',
    gold: 'border-l-gold',
    alert: 'border-l-alert',
    safe: 'border-l-safe',
  }[color] || 'border-l-navy'

  return (
    <div className={`card border-l-4 ${border} flex items-center gap-3 p-4 sm:p-6`}>
      <span className="text-2xl sm:text-3xl shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-lg sm:text-2xl font-black text-navy leading-tight truncate">{value}</p>
        <p className="font-bold text-slate-500 text-[10px] sm:text-sm uppercase tracking-wider mt-0.5 truncate">{label}</p>
      </div>
    </div>
  )
}
