// components/StatCard.js
export default function StatCard({ icon, value, label, sub, color }) {
  // Ignored color prop in new uniform design
  return (
    <div className={`card flex items-start gap-4 card-hoverable`}>
      <span className="text-3xl shrink-0">{icon}</span>
      <div>
        <p className="text-[28px] font-bold text-text-primary leading-none tracking-tight">{value}</p>
        <p className="font-semibold text-text-secondary text-sm mt-1">{label}</p>
        {sub && <p className="text-xs text-text-secondary opacity-80 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
