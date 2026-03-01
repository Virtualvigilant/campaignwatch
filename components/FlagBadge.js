// components/FlagBadge.js

// For flag_status on contributions/expenditures
export function StatusBadge({ status }) {
  const map = {
    clean:    { cls: 'bg-safe/10 text-safe-dark border-safe/30',     label: '✅ Clean'    },
    flagged:  { cls: 'bg-gold/10 text-gold-dark border-gold/30',     label: '⚠️ Flagged'  },
    critical: { cls: 'bg-alert/10 text-alert-dark border-alert/30',  label: '🚩 Critical' },
  }
  const { cls, label } = map[status] || map.clean
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {label}
    </span>
  )
}

// For severity on flags
export function SeverityBadge({ severity }) {
  const map = {
    low:      { cls: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Low'      },
    medium:   { cls: 'bg-orange-100 text-orange-800 border-orange-300', label: 'Medium'   },
    critical: { cls: 'bg-alert/10 text-alert-dark border-alert/30',     label: 'Critical' },
  }
  const { cls, label } = map[severity] || map.low
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${cls}`}>
      {label}
    </span>
  )
}

// For resolution status
export function ResolutionBadge({ status }) {
  const map = {
    open:      { cls: 'bg-gray-100 text-gray-700 border-gray-300',      label: 'Open'      },
    resolved:  { cls: 'bg-safe/10 text-safe-dark border-safe/30',       label: '✔ Resolved' },
    escalated: { cls: 'bg-alert/10 text-alert-dark border-alert/30',    label: '↑ Escalated' },
  }
  const { cls, label } = map[status] || map.open
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {label}
    </span>
  )
}
