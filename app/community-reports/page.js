'use client'
// app/community-reports/page.js — Public Approved Tip-Offs with Voting
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const TIP_TYPE_LABELS = {
    undeclared_donation: '💰 Undeclared Donation',
    cash_distribution: '💵 Cash Distribution',
    foreign_funding: '🌍 Foreign Funding',
    vote_buying: '🗳️ Vote Buying',
    spending_violation: '📊 Spending Violation',
    other: '📋 Other',
}

const TIP_TYPE_COLORS = {
    undeclared_donation: 'bg-gold/10 text-gold-dark border-gold/30',
    cash_distribution: 'bg-alert/10 text-alert-dark border-alert/30',
    foreign_funding: 'bg-purple-100 text-purple-800 border-purple-300',
    vote_buying: 'bg-red-100 text-red-800 border-red-300',
    spending_violation: 'bg-blue-100 text-blue-800 border-blue-300',
    other: 'bg-gray-100 text-gray-700 border-gray-300',
}

// ── LocalStorage helpers for tracking votes ────────────────────
function getVotedTips() {
    if (typeof window === 'undefined') return {}
    try { return JSON.parse(localStorage.getItem('tipoff_votes') || '{}') }
    catch { return {} }
}

function saveVote(tipId, vote) {
    const votes = getVotedTips()
    votes[tipId] = vote
    localStorage.setItem('tipoff_votes', JSON.stringify(votes))
}

export default function CommunityReportsPage() {
    const [tips, setTips] = useState([])
    const [loading, setLoading] = useState(true)
    const [votedMap, setVotedMap] = useState({})
    const [voting, setVoting] = useState(null)
    const [sortBy, setSortBy] = useState('newest')

    const fetchTips = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase
            .from('tip_offs')
            .select('*')
            .eq('status', 'actioned')
            .order('created_at', { ascending: false })

        setTips(data || [])
        setVotedMap(getVotedTips())
        setLoading(false)
    }, [])

    useEffect(() => { fetchTips() }, [fetchTips])

    async function handleVote(tipId, vote) {
        // vote = 'true' or 'false'
        if (votedMap[tipId]) return // already voted
        setVoting(tipId)

        const column = vote === 'true' ? 'votes_true' : 'votes_false'
        const tip = tips.find(t => t.id === tipId)
        const currentCount = tip?.[column] || 0

        const { error } = await supabase
            .from('tip_offs')
            .update({ [column]: currentCount + 1 })
            .eq('id', tipId)

        if (!error) {
            saveVote(tipId, vote)
            setVotedMap(prev => ({ ...prev, [tipId]: vote }))
            // Update local state immediately
            setTips(prev => prev.map(t =>
                t.id === tipId ? { ...t, [column]: currentCount + 1 } : t
            ))
        }
        setVoting(null)
    }

    // Sort tips
    const sorted = [...tips].sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at)
        if (sortBy === 'most_votes') {
            const totalA = (a.votes_true || 0) + (a.votes_false || 0)
            const totalB = (b.votes_true || 0) + (b.votes_false || 0)
            return totalB - totalA
        }
        if (sortBy === 'most_credible') return (b.votes_true || 0) - (a.votes_true || 0)
        return 0
    })

    const totalVotes = tips.reduce((s, t) => s + (t.votes_true || 0) + (t.votes_false || 0), 0)

    return (
        <div className="space-y-6">

            {/* Header */}
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gold mb-1">Public Accountability</p>
                <h1>🛡️ Community Verified Reports</h1>
                <p className="text-gray-500 text-sm mt-1">
                    These reports have been reviewed and approved by our investigation team.
                    Help verify them — vote whether you believe each report is <strong className="text-safe-dark">True</strong> or{' '}
                    <strong className="text-alert">False</strong> based on your own knowledge.
                </p>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-3 gap-4">
                <div className="card text-center">
                    <p className="text-2xl font-bold text-navy">{tips.length}</p>
                    <p className="text-xs text-gray-500">Verified Reports</p>
                </div>
                <div className="card text-center">
                    <p className="text-2xl font-bold text-safe-dark">{totalVotes}</p>
                    <p className="text-xs text-gray-500">Community Votes</p>
                </div>
                <div className="card text-center">
                    <p className="text-2xl font-bold text-gold">{Object.keys(votedMap).length}</p>
                    <p className="text-xs text-gray-500">Your Votes Cast</p>
                </div>
            </div>

            {/* Sort controls */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-semibold">Sort by:</span>
                {[
                    { key: 'newest', label: '🕐 Newest' },
                    { key: 'most_votes', label: '🔥 Most Votes' },
                    { key: 'most_credible', label: '✅ Most Credible' },
                ].map(s => (
                    <button key={s.key} onClick={() => setSortBy(s.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
              ${sortBy === s.key ? 'bg-navy text-white' : 'bg-white border border-ash-dark text-gray-600 hover:border-navy'}`}>
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Reports */}
            {loading ? (
                <div className="text-center py-16 text-gray-400 animate-pulse">Loading verified reports…</div>
            ) : sorted.length === 0 ? (
                <div className="card text-center py-16 text-gray-400">
                    <div className="text-4xl mb-3">📋</div>
                    <p className="font-semibold text-navy">No verified reports yet</p>
                    <p className="text-sm mt-1">Reports appear here after being reviewed and approved by our investigation team.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sorted.map(tip => {
                        const votesTrue = tip.votes_true || 0
                        const votesFalse = tip.votes_false || 0
                        const totalTipVotes = votesTrue + votesFalse
                        const credPercent = totalTipVotes > 0 ? Math.round((votesTrue / totalTipVotes) * 100) : 0
                        const userVote = votedMap[tip.id]
                        const typeColor = TIP_TYPE_COLORS[tip.tip_type] || TIP_TYPE_COLORS.other
                        const isVoting = voting === tip.id

                        return (
                            <div key={tip.id} className="card overflow-hidden">

                                {/* Top row: badge + reference + date */}
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${typeColor}`}>
                                            {TIP_TYPE_LABELS[tip.tip_type] || tip.tip_type}
                                        </span>
                                        {tip.subject_name && (
                                            <span className="text-sm font-bold text-navy">{tip.subject_name}</span>
                                        )}
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-mono text-xs text-gold font-bold">{tip.reference_code}</p>
                                        <p className="text-xs text-gray-400">{new Date(tip.created_at).toLocaleDateString('en-KE')}</p>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-gray-700 leading-relaxed mb-4">{tip.description}</p>

                                {/* Location + date row */}
                                {(tip.location || tip.incident_date) && (
                                    <div className="flex gap-4 text-xs text-gray-400 mb-4">
                                        {tip.location && <span>📍 {tip.location}</span>}
                                        {tip.incident_date && <span>📅 {new Date(tip.incident_date).toLocaleDateString('en-KE')}</span>}
                                    </div>
                                )}

                                {/* Credibility bar */}
                                {totalTipVotes > 0 && (
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-semibold text-safe-dark">✅ True ({votesTrue})</span>
                                            <span className="text-gray-400">{totalTipVotes} votes</span>
                                            <span className="font-semibold text-alert">❌ False ({votesFalse})</span>
                                        </div>
                                        <div className="w-full h-3 bg-alert/20 rounded-full overflow-hidden">
                                            <div className="h-3 bg-safe rounded-full transition-all duration-500"
                                                style={{ width: `${credPercent}%` }} />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1 text-center">
                                            {credPercent}% of voters believe this report is credible
                                        </p>
                                    </div>
                                )}

                                {/* Vote buttons */}
                                <div className="flex items-center gap-3 pt-3 border-t border-ash-dark">
                                    {userVote ? (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className={`px-4 py-2 rounded-xl font-semibold text-sm
                        ${userVote === 'true'
                                                    ? 'bg-safe/10 text-safe-dark border border-safe/30'
                                                    : 'bg-alert/10 text-alert border border-alert/30'}`}>
                                                {userVote === 'true' ? '✅ You voted True' : '❌ You voted False'}
                                            </span>
                                            <span className="text-xs text-gray-400">Thank you for participating</span>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-xs text-gray-500 font-semibold mr-1">Is this report credible?</p>
                                            <button disabled={isVoting} onClick={() => handleVote(tip.id, 'true')}
                                                className="flex items-center gap-1.5 bg-safe/10 text-safe-dark font-bold text-sm px-5 py-2.5 rounded-xl
                                   border border-safe/30 hover:bg-safe hover:text-white transition-colors disabled:opacity-50">
                                                👍 True
                                                {votesTrue > 0 && <span className="bg-safe/20 text-safe-dark px-1.5 py-0.5 rounded-md text-xs ml-1">{votesTrue}</span>}
                                            </button>
                                            <button disabled={isVoting} onClick={() => handleVote(tip.id, 'false')}
                                                className="flex items-center gap-1.5 bg-alert/10 text-alert font-bold text-sm px-5 py-2.5 rounded-xl
                                   border border-alert/30 hover:bg-alert hover:text-white transition-colors disabled:opacity-50">
                                                👎 False
                                                {votesFalse > 0 && <span className="bg-alert/20 text-alert px-1.5 py-0.5 rounded-md text-xs ml-1">{votesFalse}</span>}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Footer */}
            <div className="card bg-navy text-white">
                <h3 className="text-gold mb-2">🤝 How Community Verification Works</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                    Reports on this page have been reviewed by trained investigators. Community voting adds a layer of
                    public accountability — if you have personal knowledge about a reported violation, your vote helps
                    establish its credibility. Each person can vote once per report. Highly credible reports may be
                    escalated to the relevant authorities for further action.
                </p>
            </div>
        </div>
    )
}
