// app/candidates/page.js — Candidates List (Server Component)
import { supabase } from '@/lib/supabase'
import CandidateCard from '@/components/CandidateCard'
import CountyFilter from '@/components/CountyFilter'

export default async function CandidatesPage({ searchParams }) {
    const params = await searchParams
    const typeFilter = params?.type || 'all'
    const countyFilter = params?.county || 'all'

    // Fetch candidates with their party info
    let query = supabase
        .from('candidates')
        .select('*, political_parties(abbreviation, party_name)')
        .order('election_type')

    if (typeFilter !== 'all') query = query.eq('election_type', typeFilter)
    if (countyFilter !== 'all') query = query.eq('county', countyFilter)

    const { data: candidates } = await query

    // Fetch totals per candidate
    const { data: expenditures } = await supabase
        .from('expenditures').select('candidate_id, amount_kes')
    const { data: flags } = await supabase
        .from('flags_and_alerts').select('candidate_id, severity')

    // Build lookup maps
    const spentMap = {}
    for (const e of expenditures || []) {
        spentMap[e.candidate_id] = (spentMap[e.candidate_id] || 0) + e.amount_kes
    }
    const flagMap = {}
    for (const f of flags || []) {
        flagMap[f.candidate_id] = (flagMap[f.candidate_id] || 0) + 1
    }

    const types = ['all', 'presidential', 'gubernatorial', 'parliamentary']
    const counties = ['all', ...new Set((candidates || []).map(c => c.county).filter(Boolean))]

    return (
        <div className="space-y-6">
            <div>
                <p className="section-title">Candidate Registry</p>
                <h1>All Tracked Candidates</h1>
                <p className="text-gray-500 text-sm mt-1">
                    {(candidates || []).length} candidates registered with IEBC for the 2027 General Election
                </p>
            </div>

            {/* Filters */}
            <div className="card flex flex-wrap gap-4 items-center">
                <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">Election Type</label>
                    <div className="flex gap-2 flex-wrap">
                        {types.map(t => (
                            <a key={t} href={`?type=${t}&county=${countyFilter}`}
                                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors
                  ${typeFilter === t
                                        ? 'bg-navy text-white border-navy'
                                        : 'border-gray-300 text-gray-600 hover:border-navy hover:text-navy'}`}>
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </a>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="text-xs font-semibold text-gray-500 block mb-1">County</label>
                    <CountyFilter counties={counties} typeFilter={typeFilter} countyFilter={countyFilter} />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {(candidates || []).map(c => (
                    <CandidateCard key={c.id} candidate={c}
                        totalSpent={spentMap[c.id] || 0}
                        flagCount={flagMap[c.id] || 0} />
                ))}
                {(candidates || []).length === 0 && (
                    <p className="col-span-full text-gray-400 text-center py-12">
                        No candidates match the selected filters.
                    </p>
                )}
            </div>
        </div>
    )
}
