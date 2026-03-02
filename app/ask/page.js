'use client'
// app/ask/page.js — AI-Powered Public Q&A
// Citizens ask plain English questions, Claude answers using the database data

import { useState, useRef, useEffect } from 'react'
import { supabase, formatKES } from '@/lib/supabase'

const SUGGESTED = [
  'Which candidate has received the most money?',
  'Who has donated the most to any candidate?',
  'Are there any foreign donations?',
  'Which candidate is closest to their spending limit?',
  'How many critical flags are there?',
  'Who are the top 3 biggest spenders on advertising?',
  'Which candidates have anonymous donations?',
  'Compare James Kariuki and Peter Odhiambo\'s funding',
]

async function fetchAllData() {
  const [
    { data: candidates },
    { data: contributions },
    { data: expenditures },
    { data: flags },
    { data: parties },
  ] = await Promise.all([
    supabase.from('candidates').select('*, political_parties(party_name, abbreviation)'),
    supabase.from('contributions').select('*, candidates(full_name)'),
    supabase.from('expenditures').select('*, candidates(full_name)'),
    supabase.from('flags_and_alerts').select('*, candidates(full_name)'),
    supabase.from('political_parties').select('*'),
  ])
  return { candidates, contributions, expenditures, flags, parties }
}

function buildContext(data) {
  const { candidates, contributions, expenditures, flags } = data

  // Spending per candidate
  const spent = {}
  for (const e of expenditures || []) {
    spent[e.candidate_id] = (spent[e.candidate_id] || 0) + e.amount_kes
  }

  const raised = {}
  for (const c of contributions || []) {
    raised[c.candidate_id] = (raised[c.candidate_id] || 0) + c.amount_kes
  }

  const candSummary = (candidates || []).map(c => ({
    name: c.full_name,
    party: c.political_parties?.abbreviation,
    election_type: c.election_type,
    county: c.county,
    spending_limit: c.declared_spending_limit,
    total_raised: raised[c.id] || 0,
    total_spent: spent[c.id] || 0,
    pct_of_limit: Math.round(((spent[c.id] || 0) / c.declared_spending_limit) * 100),
  }))

  const flagSummary = (flags || []).map(f => ({
    candidate: f.candidates?.full_name,
    type: f.flag_type,
    severity: f.severity,
    status: f.resolution_status,
    notes: f.notes,
  }))

  const contribSummary = (contributions || []).map(c => ({
    candidate: c.candidates?.full_name,
    donor: c.donor_name,
    type: c.donor_type,
    amount: c.amount_kes,
    date: c.contribution_date,
    flagged: c.flag_status !== 'clean',
  }))

  return JSON.stringify({ candidates: candSummary, contributions: contribSummary, flags: flagSummary }, null, 2)
}

export default function AskPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [dbData, setDbData] = useState(null)
  const inputRef = useRef()
  const bottomRef = useRef()

  useEffect(() => {
    fetchAllData().then(setDbData)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(question) {
    const q = question || input.trim()
    if (!q || loading) return
    setInput('')
    setLoading(true)

    const userMsg = { role: 'user', content: q }
    setMessages(prev => [...prev, userMsg])

    try {
      const context = dbData ? buildContext(dbData) : 'Database not loaded'

      const history = messages.map(m => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are The Samaritan AI, a public transparency assistant for Kenya's 2027 General Election campaign finance monitoring platform, built by Transparency International Kenya.

You have access to real-time data from The Samaritan Kenya database. Here is the current data:

${context}

Answer questions about campaign finance in plain, accessible English that any Kenyan citizen can understand.
Format amounts in KES (e.g. "KES 450 million" not "450000000").
Be factual, neutral, and cite specific candidates and amounts when relevant.
If something looks suspicious based on the data, note it clearly.
Keep answers concise — 2–4 sentences for simple questions, a short structured list for complex ones.
Always remind users they can visit the Watch List or a candidate's profile to see full details.
Do not make up information not present in the data.`,
          messages: [...history, userMsg],
        }),
      })

      const data = await response.json()
      const answer = data.content?.find(b => b.type === 'text')?.text || 'Sorry, I could not generate a response.'

      setMessages(prev => [...prev, { role: 'assistant', content: answer }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        error: true,
      }])
    }
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-[calc(100vh-160px)] md:pb-10">

      {/* Header - Simplified for mobile */}
      <div className="mb-4 md:mb-6 px-4 md:px-0">
        <p className="section-title text-[10px] md:text-sm">AI Transparency Assistant</p>
        <h1 className="text-xl md:text-3xl">Ask About Campaign Finance</h1>
        <p className="text-gray-500 text-[11px] md:text-sm mt-1">
          Powered by Claude AI and live The Samaritan data.
        </p>
      </div>

      {/* Chat Window Container */}
      <div className="flex-1 flex flex-col md:bg-white md:border md:border-slate-200 md:rounded-2xl overflow-hidden md:shadow-sm">

        {/* Messages area - Responsive height */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 pb-40 md:pb-10 min-h-[300px]">

          {/* Welcome message */}
          {messages.length === 0 && (
            <div className="text-center py-6 md:py-10">
              <div className="text-4xl md:text-5xl mb-3">🤖</div>
              <h3 className="text-navy mb-1 text-lg">The Samaritan AI</h3>
              <p className="text-gray-400 text-xs md:text-sm mb-6 px-6">
                Ask me about Kenya 2027 campaign finances.
              </p>

              {/* Suggested questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left max-w-xl mx-auto px-4">
                {SUGGESTED.map(q => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="text-[11px] md:text-xs text-left bg-ash hover:bg-navy/5 border border-ash-dark
                                hover:border-navy/30 rounded-xl px-3 py-2.5 transition-all text-gray-600 hover:text-navy">
                    💬 {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 md:w-7 md:h-7 bg-navy rounded-full flex items-center justify-center text-xs md:text-sm mr-2 flex-shrink-0 mt-0.5">
                  🤖
                </div>
              )}
              <div className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                ${msg.role === 'user'
                  ? 'bg-navy text-white rounded-tr-sm'
                  : msg.error
                    ? 'bg-alert/10 text-alert-dark rounded-tl-sm'
                    : 'bg-ash text-gray-800 rounded-tl-sm'}`}>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Loading icon */}
          {loading && (
            <div className="flex justify-start">
              <div className="w-6 h-6 md:w-7 md:h-7 bg-navy rounded-full flex items-center justify-center text-xs md:text-sm mr-2 flex-shrink-0">
                🤖
              </div>
              <div className="bg-ash rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 bg-navy/40 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area - FIXED on mobile, STICKY on desktop */}
        <div className="fixed md:sticky bottom-[72px] md:bottom-0 left-0 right-0 md:relative bg-white md:bg-slate-50/50 border-t border-slate-100 p-3 md:p-4 z-40">
          <div className="max-w-3xl mx-auto">
            {/* Show suggestions after first message */}
            {messages.length > 0 && messages.length < 3 && (
              <div className="flex overflow-x-auto gap-1.5 mb-2 no-scrollbar pb-1">
                {SUGGESTED.slice(0, 4).map(q => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="whitespace-nowrap text-[10px] md:text-xs bg-white hover:bg-navy/5 border border-slate-200 rounded-full px-2.5 py-1 text-gray-500 hover:text-navy transition-colors shrink-0">
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask about finances…"
                disabled={loading || !dbData}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy
                           disabled:opacity-50 shadow-inner md:shadow-none bg-slate-50 md:bg-white"
              />
              <button onClick={() => sendMessage()} disabled={!input.trim() || loading || !dbData}
                className="bg-navy text-white px-5 rounded-xl font-semibold text-sm
                           hover:bg-navy-light transition-colors disabled:opacity-40">
                {loading ? '⏳' : '→'}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center md:text-left">
              {!dbData ? '⏳ Loading database…' : '🔒 Verified IEBC Data · Powered by Claude AI'}
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer - Hidden on mobile viewport to save space */}
      <div className="hidden md:flex bg-slate-50 border border-slate-200 rounded-xl p-4 gap-3 text-sm text-slate-500 mt-6">
        <div className="w-5 h-5 rounded-full border-2 border-slate-400 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-slate-500 font-bold text-[10px]">!</span>
        </div>
        <div className="leading-relaxed">
          <strong className="text-navy">About this tool:</strong> The Samaritan AI answers questions using data
          declared to the IEBC. It can only report what has been officially filed.
          For violations, <a href="/tip-off" className="text-gold font-bold hover:underline">submit a tip</a>.
        </div>
      </div>
    </div>
  )
}
