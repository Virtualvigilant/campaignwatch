// components/StatCard.js — Stat card with inline SVG icons
const ICONS = {
    navy: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="14" width="24" height="14" rx="2" stroke="#1B2A4A" strokeWidth="2" fill="none" />
            <path d="M8 14V10a8 8 0 0116 0v4" stroke="#1B2A4A" strokeWidth="2" fill="none" strokeLinecap="round" />
            <rect x="8" y="18" width="4" height="6" rx="1" fill="#1B2A4A" opacity="0.3" />
            <rect x="14" y="18" width="4" height="6" rx="1" fill="#1B2A4A" opacity="0.5" />
            <rect x="20" y="18" width="4" height="6" rx="1" fill="#1B2A4A" opacity="0.3" />
            <path d="M4 14h24" stroke="#1B2A4A" strokeWidth="2" strokeLinecap="round" />
            <path d="M16 6v-2M12 14V8M20 14V8" stroke="#1B2A4A" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    gold: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="12" stroke="#F5A623" strokeWidth="2" fill="none" />
            <circle cx="16" cy="16" r="8" stroke="#F5A623" strokeWidth="1.5" fill="none" opacity="0.4" />
            <text x="16" y="20" textAnchor="middle" fill="#F5A623" fontSize="12" fontWeight="bold" fontFamily="sans-serif">K</text>
        </svg>
    ),
    alert: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M8 6h4v18H8z" fill="#E63946" rx="1" />
            <path d="M12 6h10c0 0 2 1 2 4s-2 4-2 4H12" fill="none" stroke="#E63946" strokeWidth="2" strokeLinejoin="round" />
            <path d="M12 14h8c0 0 1.5 1 1.5 3s-1.5 3-1.5 3H12" fill="none" stroke="#E63946" strokeWidth="1.5" strokeLinejoin="round" opacity="0.6" />
            <circle cx="10" cy="28" r="2" fill="#E63946" opacity="0.3" />
        </svg>
    ),
    safe: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <line x1="8" y1="14" x2="24" y2="14" stroke="#2DC653" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="8" x2="16" y2="26" stroke="#2DC653" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="26" x2="20" y2="26" stroke="#2DC653" strokeWidth="2" strokeLinecap="round" />
            <circle cx="16" cy="8" r="2" fill="#2DC653" />
            <path d="M6 15L8 14 10 15C10 18 9 19 8 19S6 18 6 15z" stroke="#2DC653" strokeWidth="1.5" fill="none" />
            <path d="M22 15L24 14 26 15C26 18 25 19 24 19S22 18 22 15z" stroke="#2DC653" strokeWidth="1.5" fill="none" />
        </svg>
    ),
}

export default function StatCard({ icon, value, label, sub, color = 'navy' }) {
    const border = {
        navy: 'border-l-navy',
        gold: 'border-l-gold',
        alert: 'border-l-alert',
        safe: 'border-l-safe',
    }[color] || 'border-l-navy'

    const svgIcon = ICONS[color] || null

    return (
        <div className={`card border-l-4 ${border} flex items-start gap-4`}>
            <div className="shrink-0 mt-0.5">
                {svgIcon || <span className="text-3xl">{icon}</span>}
            </div>
            <div>
                <p className="text-2xl font-bold text-navy leading-tight">{value}</p>
                <p className="font-semibold text-gray-700 text-sm mt-0.5">{label}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    )
}
