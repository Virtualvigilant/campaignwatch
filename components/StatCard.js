// components/StatCard.js
export default function StatCard({ icon, value, label, sub, color = 'navy' }) {
  const border = {
    navy:  'border-l-navy',
    gold:  'border-l-gold',
    alert: 'border-l-alert',
    safe:  'border-l-safe',
  }[color] || 'border-l-navy'

  return (
    <div className={`card border-l-4 ${border} flex items-start gap-4`}>
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-2xl font-bold text-navy leading-tight">{value}</p>
        <p className="font-semibold text-gray-700 text-sm mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
