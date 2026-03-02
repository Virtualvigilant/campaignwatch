'use client'
import { useState } from 'react'
import Link from 'next/link'

const CATEGORIES = [
    { id: 'gov_vehicle', icon: '🚗', label: 'Govt vehicle misuse' },
    { id: 'public_office', icon: '🏢', label: 'Office campaigning' },
    { id: 'cash_handout', icon: '💰', label: 'Cash handout' },
    { id: 'unreported_rally', icon: '📢', label: 'Secret rally' },
    { id: 'billboard', icon: '🪧', label: 'Unreported ad' },
    { id: 'other', icon: '📝', label: 'Other violation' },
]

const COUNTIES = [
    "Nairobi City", "Mombasa", "Kwale", "Kilifi", "Tana River", "Lamu", "Taita/Taveta", "Garissa", "Wajir", "Mandera", "Marsabit", "Isiolo", "Meru", "Tharaka-Nithi", "Embu", "Kitui", "Machakos", "Makueni", "Nyandarua", "Nyeri", "Kirinyaga", "Murang'a", "Kiambu", "Turkana", "West Pokot", "Samburu", "Trans Nzoia", "Uasin Gishu", "Elgeyo/Marakwet", "Nandi", "Baringo", "Laikipia", "Nakuru", "Narok", "Kajiado", "Kericho", "Bomet", "Kakamega", "Vihiga", "Bungoma", "Busia", "Siaya", "Kisumu", "Homa Bay", "Migori", "Kisii", "Nyamira"
]

export default function ReportPage() {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        category: '',
        location: 'Nairobi City', // Mock auto-detect snippet
        incident_date: new Date().toISOString().slice(0, 10),
        notes: ''
    })
    const [status, setStatus] = useState('idle') // idle, submitting, success, error
    const [trackingId, setTrackingId] = useState('')

    const handleNext = () => setStep(s => Math.min(s + 1, 3))
    const handlePrev = () => setStep(s => Math.max(s - 1, 1))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus('submitting')
        try {
            const res = await fetch('/api/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const result = await res.json()

            if (res.ok && result.success) {
                setTrackingId(result.id)
                setStatus('success')
                setStep(4)
            } else {
                setStatus('error')
            }
        } catch (err) {
            console.error(err)
            setStatus('error')
        }
    }

    // --- Render Steps ---

    const renderStep1 = () => (
        <div className="space-y-4 animate-fadeIn">
            <h2 className="text-xl font-bold">What did you see?</h2>
            <p className="text-sm text-text-secondary">Select the type of violation you observed.</p>
            <div className="grid grid-cols-2 gap-3 mt-4">
                {CATEGORIES.map(c => (
                    <button
                        key={c.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: c.label })}
                        className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-center items-center text-center ${formData.category === c.label
                            ? 'border-accent-kenya bg-green-50 ring-1 ring-accent-kenya shadow-sm transform scale-[1.02]'
                            : 'border-border-subtle bg-white hover:border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        <div className="text-3xl mb-2">{c.icon}</div>
                        <div className="font-semibold text-sm text-text-primary">{c.label}</div>
                    </button>
                ))}
            </div>
            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleNext}
                    disabled={!formData.category}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next Step →
                </button>
            </div>
        </div>
    )

    const renderStep2 = () => (
        <div className="space-y-4 animate-slideUp">
            <h2 className="text-xl font-bold">Where & When?</h2>
            <p className="text-sm text-text-secondary">Provide details about the incident location and time.</p>

            <div className="space-y-4 mt-4">
                <div className="p-3 bg-gray-50 border border-border-subtle rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">📍</span>
                        <span className="text-sm font-semibold text-text-primary">Auto-detecting...</span>
                    </div>
                    <span className="text-sm bg-white border border-border-subtle px-2 py-1 rounded text-accent-kenya font-medium flex items-center gap-1">
                        {formData.location} <span className="text-xs">✓</span>
                    </span>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1">Or pick manually:</label>
                    <select
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-border-subtle focus:ring-2 focus:ring-accent-kenya focus:border-accent-kenya outline-none bg-white transition-all appearance-none"
                        required
                    >
                        <option value="" disabled>Select County</option>
                        {COUNTIES.sort().map(c => (
                            <option key={c} value={c}>{c} County</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1">Date of Incident *</label>
                    <input
                        type="date"
                        value={formData.incident_date}
                        onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-border-subtle focus:ring-2 focus:ring-accent-kenya focus:border-accent-kenya outline-none bg-white transition-all"
                        required
                    />
                </div>
            </div>

            <div className="mt-8 flex justify-between">
                <button onClick={handlePrev} className="text-text-secondary hover:text-text-primary font-semibold px-4 py-2">
                    ← Back
                </button>
                <button
                    onClick={handleNext}
                    disabled={!formData.location || !formData.incident_date}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next Step →
                </button>
            </div>
        </div>
    )

    const renderStep3 = () => (
        <div className="space-y-4 animate-slideUp">
            <h2 className="text-xl font-bold">Evidence & Notes</h2>
            <p className="text-sm text-text-secondary">Provide context safely. We strip all metadata from uploads.</p>

            <div className="space-y-4 mt-4">
                <button type="button" className="w-full p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-center py-6 flex flex-col items-center justify-center hover:bg-gray-100 transition-colors">
                    <span className="text-3xl mb-2 block">📷</span>
                    <span className="text-sm font-semibold text-text-primary">Take photo</span>
                    <p className="text-xs text-text-secondary mt-1">Blurs faces · Auto-strips EXIF metadata</p>
                </button>

                <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1">Or describe details:</label>
                    <textarea
                        rows="3"
                        maxLength="140"
                        placeholder="e.g. Black Prado KCU 123X at rally in Kibera"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-border-subtle focus:ring-2 focus:ring-accent-kenya focus:border-accent-kenya outline-none bg-white transition-all resize-none"
                    />
                    <div className="text-right text-xs text-text-secondary mt-1">
                        {formData.notes.length}/140
                    </div>
                </div>
            </div>

            {/* Security Indicators from Spec */}
            <div className="bg-green-50 rounded-lg p-3 text-xs text-text-secondary space-y-2 border border-green-100">
                <div className="flex items-center gap-2"><span className="text-base text-accent-kenya">🔒</span> End-to-end encrypted</div>
                <div className="flex items-center gap-2"><span className="text-base text-accent-kenya">👤</span> Anonymous submission</div>
                <div className="flex items-center gap-2"><span className="text-base text-accent-kenya">🕐</span> Auto-deletes in 90 days</div>
            </div>

            {status === 'error' && (
                <div className="p-3 bg-red-50 text-risk-high text-sm rounded-lg border border-red-200">
                    Something went wrong. Please try again.
                </div>
            )}

            <div className="mt-8 gap-4 flex flex-col-reverse md:flex-row md:justify-between">
                <button type="button" onClick={handlePrev} disabled={status === 'submitting'} className="text-text-secondary hover:text-text-primary font-semibold px-4 py-3 bg-gray-100 rounded-lg md:bg-transparent md:px-0">
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={status === 'submitting'}
                    className="btn-primary py-3 md:py-2 flex items-center justify-center gap-2"
                >
                    {status === 'submitting' ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Encrypting & Submitting...
                        </>
                    ) : 'Submit Report'}
                </button>
            </div>
        </div>
    )

    const renderSuccess = () => (
        <div className="text-center py-6 animate-fadeIn">
            <div className="w-16 h-16 bg-green-100 text-risk-low rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-green-200">
                ✅
            </div>
            <h2 className="text-xl font-bold mb-2">Sent Successfully!</h2>

            <div className="bg-gray-50 border border-border-subtle rounded-xl p-6 inline-block w-full max-w-sm mb-6 mt-4">
                <p className="text-xs text-text-secondary uppercase tracking-wider mb-2 font-semibold">Your Tracking Code</p>
                <div className="flex items-center justify-center gap-2">
                    <p className="text-2xl font-mono font-bold text-text-primary tracking-widest">{trackingId}</p>
                    <button className="p-2 bg-white rounded border border-border-subtle hover:bg-gray-50 active:scale-95 transition-transform" onClick={() => navigator.clipboard.writeText(trackingId)} title="Copy Code">
                        📋
                    </button>
                </div>
            </div>

            <div className="space-y-2 mb-8 text-sm text-text-secondary">
                <p>We review all submissions within 24 hours.</p>
                <p>You can check the status of your report anytime from the Me tab.</p>
            </div>

            <div className="flex flex-col gap-3">
                <button onClick={() => { setStep(1); setFormData({ category: '', location: 'Nairobi City', incident_date: new Date().toISOString().slice(0, 10), notes: '' }); setStatus('idle'); }} className="btn-outline w-full py-3">
                    Report Another
                </button>
                <Link href="/" className="btn-primary w-full py-3">
                    Done
                </Link>
            </div>
        </div>
    )

    return (
        <div className="max-w-xl mx-auto py-2">

            <div className="mb-6 flex items-center justify-center flex-col text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold tracking-wide uppercase mb-3 border border-blue-200">
                    <span className="text-sm">🛡️</span> Report Safely · No Personal Info
                </div>
            </div>

            <div className="card shadow-sm border border-border-subtle bg-white relative overflow-hidden px-4 md:px-6">

                {/* Progress Bar (Header) */}
                {step < 4 && (
                    <div className="absolute top-0 left-0 w-full flex">
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                className={`h-1.5 flex-1 transition-all duration-300 ${i <= step ? 'bg-accent-kenya' : 'bg-gray-100'
                                    }`}
                            />
                        ))}
                    </div>
                )}

                <div className="pt-4">
                    {/* Step Indicator */}
                    {step < 4 && (
                        <div className="flex items-center gap-1.5 mb-6">
                            {[1, 2, 3].map(i => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? 'bg-accent-kenya w-4' : i < step ? 'bg-green-200' : 'bg-gray-200'
                                        }`}
                                />
                            ))}
                            <span className="text-xs font-semibold text-text-secondary ml-2 tracking-wide">
                                STEP {step} OF 3
                            </span>
                        </div>
                    )}

                    {/* Form Area */}
                    <form onSubmit={(e) => e.preventDefault()}>
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                        {step === 4 && renderSuccess()}
                    </form>
                </div>
            </div>
        </div>
    )
}
