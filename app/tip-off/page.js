'use client'
// app/tip-off/page.js — Anonymous Citizen Tip-Off Form
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const TIP_TYPES = [
  { value: 'undeclared_donation',  label: '💰 Undeclared donation to a candidate or party' },
  { value: 'cash_distribution',   label: '💵 Cash or goods distributed to voters'           },
  { value: 'foreign_funding',     label: '🌍 Foreign money funding a campaign'               },
  { value: 'vote_buying',         label: '🗳️ Vote buying or voter bribery'                  },
  { value: 'spending_violation',  label: '📊 Candidate spending beyond legal limit'          },
  { value: 'other',               label: '📋 Other campaign finance violation'               },
]

function generateReference() {
  const year = new Date().getFullYear()
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `TIP-${year}-${rand}`
}

const STEPS = ['Details', 'Evidence', 'Contact', 'Submit']

export default function TipOffPage() {
  const [step,        setStep]        = useState(0)
  const [submitting,  setSubmitting]  = useState(false)
  const [submitted,   setSubmitted]   = useState(null)   // reference code on success
  const [form, setForm] = useState({
    subject_name:         '',
    tip_type:             '',
    description:          '',
    incident_date:        '',
    location:             '',
    evidence_description: '',
    contact_method:       'none',
    contact_detail:       '',
  })

  function update(key, value) {
    setForm(p => ({ ...p, [key]: value }))
  }

  function canProceed() {
    if (step === 0) return form.tip_type && form.description.length >= 30
    if (step === 1) return true   // evidence is optional
    if (step === 2) return true   // contact is optional
    return true
  }

  async function handleSubmit() {
    setSubmitting(true)
    const reference_code = generateReference()

    const { error } = await supabase.from('tip_offs').insert({
      reference_code,
      subject_name:         form.subject_name         || null,
      tip_type:             form.tip_type,
      description:          form.description,
      incident_date:        form.incident_date         || null,
      location:             form.location              || null,
      evidence_description: form.evidence_description  || null,
      contact_method:       form.contact_method,
      contact_detail:       form.contact_method !== 'none' ? form.contact_detail : null,
      status:               'received',
    })

    if (error) {
      alert('Submission failed. Please try again.')
      setSubmitting(false)
      return
    }

    setSubmitted(reference_code)
    setSubmitting(false)
  }

  // ── SUCCESS SCREEN ────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🛡️</div>
          <h1 className="text-2xl font-bold text-navy mb-2">Tip Received — Thank You</h1>
          <p className="text-gray-500 mb-6">
            Your submission has been securely received by Transparency International Kenya.
            A trained investigator will review it confidentially.
          </p>

          <div className="bg-navy rounded-2xl px-8 py-6 mb-6 inline-block">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Your Reference Code</p>
            <p className="text-gold font-mono text-3xl font-bold tracking-widest">{submitted}</p>
            <p className="text-gray-400 text-xs mt-2">Save this code to check your tip's status later</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mb-8">
            {[
              { icon: '🔒', title: 'Your identity is protected', desc: 'We do not log IP addresses or identify anonymous submitters.' },
              { icon: '📋', title: 'Every tip is reviewed', desc: 'A TI Kenya investigator reads every submission within 48 hours.' },
              { icon: '⚖️', title: 'Verified tips become public', desc: 'Confirmed violations are added to the public Watch List.' },
            ].map(c => (
              <div key={c.title} className="bg-ash rounded-xl p-4">
                <p className="text-2xl mb-2">{c.icon}</p>
                <p className="font-semibold text-navy text-sm">{c.title}</p>
                <p className="text-xs text-gray-500 mt-1">{c.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/tip-off/check" className="btn-outline text-sm">
              Check Tip Status →
            </Link>
            <Link href="/" className="btn-primary text-sm">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <p className="section-title">Citizen Accountability</p>
        <h1>Submit an Anonymous Tip</h1>
        <p className="text-gray-500 text-sm mt-1">
          Witnessed a campaign finance violation? Report it safely and confidentially.
          Your identity is never recorded unless you choose to share it.
        </p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors
              ${i < step ? 'bg-safe text-white' : i === step ? 'bg-navy text-white' : 'bg-ash-dark text-gray-400'}`}>
              {i < step ? '✓' : i + 1}
            </div>
            <span className={`text-xs font-medium ml-1.5 ${i === step ? 'text-navy' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-3 ${i < step ? 'bg-safe' : 'bg-ash-dark'}`} />}
          </div>
        ))}
      </div>

      {/* Form card */}
      <div className="card">

        {/* ── STEP 0: VIOLATION DETAILS ───────────────────────── */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="mb-1">What did you witness?</h2>
              <p className="text-gray-400 text-sm">Tell us what happened. Be as specific as possible.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Type of Violation <span className="text-alert">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {TIP_TYPES.map(t => (
                  <label key={t.value}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                      ${form.tip_type === t.value ? 'border-navy bg-navy/5' : 'border-ash-dark hover:border-navy/30'}`}>
                    <input type="radio" name="tip_type" value={t.value}
                      checked={form.tip_type === t.value}
                      onChange={e => update('tip_type', e.target.value)}
                      className="text-navy" />
                    <span className="text-sm">{t.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Name of Candidate or Party Involved
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <input type="text" value={form.subject_name}
                onChange={e => update('subject_name', e.target.value)}
                placeholder="e.g. James Kariuki, UDA Party"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Describe what happened <span className="text-alert">*</span>
              </label>
              <textarea rows={5} value={form.description}
                onChange={e => update('description', e.target.value)}
                placeholder="Describe the violation in as much detail as possible. Include dates, people involved, amounts if known, and what you observed..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none
                           focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy" />
              <p className={`text-xs mt-1 ${form.description.length < 30 ? 'text-gray-400' : 'text-safe'}`}>
                {form.description.length} characters {form.description.length < 30 ? `(minimum 30)` : '✓'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  When did this happen?
                  <span className="text-gray-400 font-normal ml-1">(approx.)</span>
                </label>
                <input type="date" value={form.incident_date}
                  onChange={e => update('incident_date', e.target.value)}
                  max={new Date().toISOString().slice(0,10)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-navy/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Where did this happen?
                  <span className="text-gray-400 font-normal ml-1">(optional)</span>
                </label>
                <input type="text" value={form.location}
                  onChange={e => update('location', e.target.value)}
                  placeholder="e.g. Nakuru Town, Westlands"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-navy/20" />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 1: EVIDENCE ────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="mb-1">Do you have evidence?</h2>
              <p className="text-gray-400 text-sm">
                Describe any evidence you have. For your safety, do not upload files here — 
                our investigators will contact you through your chosen method if needed.
              </p>
            </div>

            <div className="bg-gold/5 border border-gold/20 rounded-xl p-4">
              <p className="text-sm font-semibold text-gold-dark mb-1">🔒 Why no file uploads?</p>
              <p className="text-xs text-gray-600">
                File uploads can contain metadata that identifies you. 
                Describe your evidence in text instead — our team will securely arrange 
                how to receive physical evidence if your tip is verified.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Describe your evidence
                <span className="text-gray-400 font-normal ml-1">(optional but helpful)</span>
              </label>
              <textarea rows={6} value={form.evidence_description}
                onChange={e => update('evidence_description', e.target.value)}
                placeholder="e.g. I have photos of cash being distributed at a rally on [date]. I have bank transfer receipts showing foreign funds. I witnessed a meeting where donors were promised government contracts..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none
                           focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy" />
            </div>

            <div className="bg-ash rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">Types of evidence that are most useful:</p>
              <ul className="text-xs text-gray-500 space-y-1">
                {[
                  'Bank statements or transfer records showing amounts and dates',
                  'Video or photos of cash distributions at events',
                  'Witness statements from others who observed the same events',
                  'Communications (texts, emails) referencing donations or payments',
                  'Official documents like IEBC filings with incorrect information',
                ].map((e, i) => <li key={i}>• {e}</li>)}
              </ul>
            </div>
          </div>
        )}

        {/* ── STEP 2: CONTACT ─────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="mb-1">How should we reach you?</h2>
              <p className="text-gray-400 text-sm">
                Completely optional. If you stay anonymous, you can still track your tip using your reference code.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { value: 'none',  label: 'Stay completely anonymous', desc: 'No contact details — track using reference code only', icon: '🛡️' },
                { value: 'email', label: 'Email (secure)',             desc: 'We\'ll only email if we need clarification',            icon: '📧' },
                { value: 'phone', label: 'Phone / WhatsApp',           desc: 'We\'ll only call if we need clarification',             icon: '📱' },
              ].map(opt => (
                <label key={opt.value}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                    ${form.contact_method === opt.value ? 'border-navy bg-navy/5' : 'border-ash-dark hover:border-navy/30'}`}>
                  <input type="radio" name="contact_method" value={opt.value}
                    checked={form.contact_method === opt.value}
                    onChange={e => update('contact_method', e.target.value)}
                    className="mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">{opt.icon} {opt.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {form.contact_method !== 'none' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  {form.contact_method === 'email' ? 'Email Address' : 'Phone / WhatsApp Number'}
                </label>
                <input
                  type={form.contact_method === 'email' ? 'email' : 'tel'}
                  value={form.contact_detail}
                  onChange={e => update('contact_detail', e.target.value)}
                  placeholder={form.contact_method === 'email' ? 'your@email.com' : '+254 7XX XXX XXX'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy" />
                <p className="text-xs text-gray-400 mt-1">
                  Your contact details are stored securely and only seen by TI Kenya investigators.
                </p>
              </div>
            )}

            <div className="bg-navy rounded-xl p-4 text-white text-sm">
              <p className="font-bold text-gold mb-1">🔒 Privacy Guarantee</p>
              <p className="text-gray-300 text-xs leading-relaxed">
                Transparency International Kenya does not share tip-off information with police,
                government agencies, or any third party without your explicit consent, unless 
                required by a court order. All submissions are handled under our Whistleblower
                Protection Policy.
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 3: REVIEW & SUBMIT ──────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="mb-1">Review Your Submission</h2>
              <p className="text-gray-400 text-sm">Check your information before submitting.</p>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Violation Type',  value: TIP_TYPES.find(t => t.value === form.tip_type)?.label },
                { label: 'Subject',         value: form.subject_name       || 'Not specified' },
                { label: 'Location',        value: form.location            || 'Not specified' },
                { label: 'Incident Date',   value: form.incident_date       || 'Not specified' },
                { label: 'Has Evidence',    value: form.evidence_description ? 'Yes — described' : 'None described' },
                { label: 'Contact',         value: form.contact_method === 'none' ? 'Anonymous' : `Via ${form.contact_method}` },
              ].map(row => (
                <div key={row.label} className="flex items-start gap-4 py-2 border-b border-ash-dark last:border-0">
                  <span className="text-xs font-semibold text-gray-400 w-32 flex-shrink-0 pt-0.5">{row.label}</span>
                  <span className="text-sm text-navy">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="bg-ash rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 mb-1">Your description:</p>
              <p className="text-sm text-gray-700 leading-relaxed">{form.description}</p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" required className="mt-0.5 text-navy" />
              <span className="text-xs text-gray-600">
                I confirm that the information I have provided is true to the best of my knowledge.
                I understand that false reports undermine accountability efforts and may have legal consequences.
              </span>
            </label>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6 pt-5 border-t border-ash-dark">
          {step > 0
            ? <button onClick={() => setStep(s => s - 1)} className="btn-outline text-sm">← Back</button>
            : <Link href="/" className="text-sm text-gray-400 hover:text-navy">Cancel</Link>}

          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
              className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              Continue →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="bg-alert text-white font-bold px-6 py-2.5 rounded-xl text-sm
                         hover:bg-alert-dark transition-colors disabled:opacity-50 flex items-center gap-2">
              {submitting ? '⏳ Submitting…' : '🛡️ Submit Tip Confidentially'}
            </button>
          )}
        </div>
      </div>

      {/* Legal footer */}
      <p className="text-xs text-gray-400 text-center">
        Transparency International Kenya · KISP Programme · FCDO Supported<br/>
        For emergencies or urgent tips, contact TI Kenya directly:{' '}
        <a href="tel:+254203750329" className="text-gold hover:underline">+254 20 375 0329</a>
      </p>
    </div>
  )
}
