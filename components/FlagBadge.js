// components/FlagBadge.js

// For flag_status on contributions/expenditures
export function StatusBadge({ status }) {
  const map = {
    clean: { cls: 'bg-green-50 text-risk-low border-green-200', label: '✅ Clean' },
    flagged: { cls: 'bg-amber-50 text-risk-medium border-amber-200', label: '⚠️ Flagged' },
    critical: { cls: 'bg-red-50 text-risk-high border-red-200', label: '🚩 Critical' },
  }
  const { cls, label } = map[status] || map.clean
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border uppercase tracking-wide ${cls}`}>
      {label}
    </span>
  )
}

// For severity on flags
export function SeverityBadge({ severity }) {
  const map = {
    low: { cls: 'bg-green-50 text-risk-low border-green-200', label: 'Low' },
    medium: { cls: 'bg-amber-50 text-risk-medium border-amber-200', label: 'Medium' },
    critical: { cls: 'bg-red-50 text-risk-high border-red-200', label: 'Critical' },
  }
  const { cls, label } = map[severity] || map.low
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide ${cls}`}>
      {label}
    </span>
  )
}

// For resolution status
export function ResolutionBadge({ status }) {
  const map = {
    open: { cls: 'bg-gray-100 text-text-secondary border-gray-300', label: 'Open' },
    resolved: { cls: 'bg-green-50 text-risk-low border-green-200', label: '✔ Resolved' },
    escalated: { cls: 'bg-red-50 text-risk-high border-red-200', label: '↑ Escalated' },
  }
  const { cls, label } = map[status] || map.open
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border uppercase tracking-wide ${cls}`}>
      {label}
    </span>
  )
}
