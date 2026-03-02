'use client'
// app/admin/upload/page.js — CSV Data Upload Page
import { useState, useRef } from 'react'
import { createBrowserClient, parseCSV, writeAuditLog, formatKES } from '@/lib/supabaseAdmin'

// ── Expected columns for each upload type ────────────────────
const TEMPLATES = {
    contributions: {
        label: 'Contributions',
        icon: '💰',
        description: 'Donor name, amount, date, and recipient candidate from IEBC filings.',
        required: ['candidate_id', 'donor_name', 'donor_type', 'amount_kes', 'contribution_date'],
        optional: ['party_id', 'source_document', 'flag_status'],
        donorTypes: ['individual', 'corporate', 'foreign', 'anonymous'],
        sampleRows: [
            'candidate_id,donor_name,donor_type,amount_kes,contribution_date,source_document',
            'b1000000-0000-0000-0000-000000000001,Savanna Holdings Ltd,corporate,450000000,2026-07-15,IEBC/CF/2026/0041',
            'b1000000-0000-0000-0000-000000000002,Mary Otieno,individual,15000000,2026-09-05,IEBC/CF/2026/0067',
        ],
    },
    expenditures: {
        label: 'Expenditures',
        icon: '📊',
        description: 'Spending records — category, vendor, amount, and date.',
        required: ['candidate_id', 'category', 'amount_kes', 'expenditure_date'],
        optional: ['vendor_name', 'description', 'flag_status'],
        categories: ['advertising', 'rallies', 'transport', 'staff', 'printing', 'other'],
        sampleRows: [
            'candidate_id,category,vendor_name,amount_kes,expenditure_date,description',
            'b1000000-0000-0000-0000-000000000001,advertising,Mediamax Network,320000000,2026-08-01,TV and radio campaign ads',
            'b1000000-0000-0000-0000-000000000002,rallies,Azimio Events Ltd,350000000,2026-09-08,County rallies',
        ],
    },
    candidates: {
        label: 'Candidates',
        icon: '🏛️',
        description: 'Candidate registration details from IEBC.',
        required: ['full_name', 'election_type', 'declared_spending_limit'],
        optional: ['party_id', 'constituency', 'county', 'registration_date'],
        sampleRows: [
            'full_name,election_type,constituency,county,declared_spending_limit,registration_date',
            'James Kariuki,presidential,Nationwide,Nationwide,4409007000,2026-06-01',
            'Grace Mutua,gubernatorial,Nairobi County,Nairobi,265500000,2026-06-05',
        ],
    },
}

// ── Run flag engine on a contribution row ─────────────────────
function detectFlags(row) {
    const flags = []
    const amount = Number(row.amount_kes)
    if (row.donor_type === 'anonymous' && amount > 1_000_000) {
        flags.push({
            type: 'anonymous_donor', severity: 'critical',
            note: `Anonymous donation of ${formatKES(amount)} exceeds KES 1M threshold`
        })
    }
    if (row.donor_type === 'foreign') {
        flags.push({
            type: 'foreign_funding', severity: 'critical',
            note: `Foreign donor contribution of ${formatKES(amount)} — prohibited under Elections Act Section 22(1)`
        })
    }
    return flags
}

export default function UploadPage() {
    const supabase = createBrowserClient()
    const fileRef = useRef()

    const [uploadType, setUploadType] = useState('contributions')
    const [file, setFile] = useState(null)
    const [parsed, setParsed] = useState(null)   // raw CSV rows
    const [errors, setErrors] = useState([])     // validation errors
    const [preview, setPreview] = useState(null)   // first 5 rows
    const [uploading, setUploading] = useState(false)
    const [result, setResult] = useState(null)   // success summary
    const [dragOver, setDragOver] = useState(false)
    const [step, setStep] = useState(1)      // 1=select, 2=preview, 3=done

    const template = TEMPLATES[uploadType]

    // ── Handle file selection / drop ─────────────────────────────
    function handleFile(f) {
        if (!f) return
        setFile(f)
        setResult(null)
        setErrors([])
        setParsed(null)
        setPreview(null)

        const reader = new FileReader()
        reader.onload = e => {
            const rows = parseCSV(e.target.result)
            const errs = []

            // Validate required columns exist
            if (rows.length > 0) {
                const headers = Object.keys(rows[0])
                template.required.forEach(col => {
                    if (!headers.includes(col))
                        errs.push(`Missing required column: "${col}"`)
                })
            }

            // Validate each row
            rows.forEach((row, i) => {
                template.required.forEach(col => {
                    if (!row[col] || row[col].trim() === '')
                        errs.push(`Row ${i + 2}: "${col}" is empty`)
                })
                if (uploadType === 'contributions' && row.donor_type) {
                    if (!['individual', 'corporate', 'foreign', 'anonymous'].includes(row.donor_type))
                        errs.push(`Row ${i + 2}: Invalid donor_type "${row.donor_type}"`)
                }
                if (uploadType === 'expenditures' && row.category) {
                    if (!['advertising', 'rallies', 'transport', 'staff', 'printing', 'other'].includes(row.category))
                        errs.push(`Row ${i + 2}: Invalid category "${row.category}"`)
                }
            })

            setParsed(rows)
            setErrors(errs)
            setPreview(rows.slice(0, 5))
            setStep(2)
        }
        reader.readAsText(f)
    }

    function handleDrop(e) {
        e.preventDefault()
        setDragOver(false)
        const f = e.dataTransfer.files[0]
        if (f && f.name.endsWith('.csv')) handleFile(f)
    }

    // ── Download sample CSV ───────────────────────────────────────
    function downloadSample() {
        const csv = template.sampleRows.join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `sample_${uploadType}.csv`; a.click()
        URL.revokeObjectURL(url)
    }

    // ── Submit upload to Supabase ─────────────────────────────────
    async function handleSubmit() {
        if (!parsed || errors.length > 0) return
        setUploading(true)

        let inserted = 0, flagged = 0, failed = 0
        const autoFlags = []

        for (const row of parsed) {
            try {
                // Clean numeric fields
                if (row.amount_kes) row.amount_kes = Number(row.amount_kes)
                if (row.declared_spending_limit) row.declared_spending_limit = Number(row.declared_spending_limit)

                const { data, error } = await supabase.from(uploadType).insert(row).select().single()

                if (error) { failed++; continue }
                inserted++

                // Auto-flag contributions
                if (uploadType === 'contributions') {
                    const flags = detectFlags(row)
                    for (const flag of flags) {
                        await supabase.from('flags_and_alerts').insert({
                            contribution_id: data.id,
                            candidate_id: row.candidate_id,
                            flag_type: flag.type,
                            severity: flag.severity,
                            notes: flag.note,
                        })
                        flagged++
                    }
                    autoFlags.push(...flags.map(f => ({ ...f, donor: row.donor_name })))
                }
            } catch { failed++ }
        }

        // Write audit log
        await writeAuditLog(supabase, {
            action: 'UPLOAD',
            table_name: uploadType,
            details: { filename: file.name, rows: parsed.length, inserted, failed, flagged },
        })

        setResult({ inserted, failed, flagged, autoFlags })
        setStep(3)
        setUploading(false)
    }

    function reset() {
        setFile(null); setParsed(null); setPreview(null)
        setErrors([]); setResult(null); setStep(1)
        if (fileRef.current) fileRef.current.value = ''
    }

    return (
        <div className="space-y-6 max-w-4xl">

            {/* Header */}
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Data Management</p>
                <h1>Upload IEBC Data</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Import official IEBC filings in CSV format. All records are validated before saving.
                    Contributions are automatically checked against Kenya's campaign finance laws.
                </p>
            </div>

            {/* Progress steps */}
            <div className="flex items-center gap-2">
                {[
                    { n: 1, label: 'Select & Upload' },
                    { n: 2, label: 'Preview & Validate' },
                    { n: 3, label: 'Confirm & Save' },
                ].map((s, i, arr) => (
                    <div key={s.n} className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
              ${step >= s.n ? 'bg-navy text-white' : 'bg-ash-dark text-gray-400'}`}>
                            {step > s.n ? '✓' : s.n}
                        </div>
                        <span className={`text-xs font-medium ${step >= s.n ? 'text-navy' : 'text-gray-400'}`}>
                            {s.label}
                        </span>
                        {i < arr.length - 1 && <div className={`flex-1 h-px mx-2 ${step > s.n ? 'bg-navy' : 'bg-ash-dark'}`} style={{ width: '40px' }} />}
                    </div>
                ))}
            </div>

            {/* ── STEP 1: TYPE + DROP ZONE ─────────────────────────── */}
            {step === 1 && (
                <div className="space-y-5">

                    {/* Upload type selector */}
                    <div className="bg-white rounded-2xl border border-ash-dark p-6">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                            Step 1 — Select Data Type
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {Object.entries(TEMPLATES).map(([key, t]) => (
                                <button key={key} onClick={() => setUploadType(key)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all
                    ${uploadType === key ? 'border-navy bg-navy/5' : 'border-ash-dark hover:border-navy/30'}`}>
                                    <p className="text-2xl mb-1">{t.icon}</p>
                                    <p className={`font-bold text-sm ${uploadType === key ? 'text-navy' : 'text-gray-700'}`}>{t.label}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{t.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Required columns reference */}
                    <div className="bg-white rounded-2xl border border-ash-dark p-6">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                                Required Columns for {template.label}
                            </p>
                            <button onClick={downloadSample}
                                className="text-xs text-gold hover:underline font-semibold">
                                ⬇ Download Sample CSV
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {template.required.map(col => (
                                <span key={col} className="bg-navy/10 text-navy text-xs font-mono font-semibold px-2 py-1 rounded-lg">
                                    {col} *
                                </span>
                            ))}
                            {template.optional.map(col => (
                                <span key={col} className="bg-ash text-gray-500 text-xs font-mono px-2 py-1 rounded-lg">
                                    {col}
                                </span>
                            ))}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">* Required &nbsp;·&nbsp; Grey = optional</p>
                    </div>

                    {/* Drop zone */}
                    <div
                        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => fileRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
              ${dragOver ? 'border-navy bg-navy/5' : 'border-gray-300 hover:border-navy/40 hover:bg-ash'}`}>
                        <input ref={fileRef} type="file" accept=".csv" className="hidden"
                            onChange={e => handleFile(e.target.files[0])} />
                        <div className="text-4xl mb-3">📂</div>
                        <p className="font-semibold text-navy">Drag & drop your CSV file here</p>
                        <p className="text-sm text-gray-400 mt-1">or click to browse files</p>
                        <p className="text-xs text-gray-300 mt-3">Accepts .csv files only · Max 10MB</p>
                    </div>
                </div>
            )}

            {/* ── STEP 2: PREVIEW + VALIDATE ───────────────────────── */}
            {step === 2 && parsed && (
                <div className="space-y-5">
                    {/* File info */}
                    <div className="bg-white rounded-2xl border border-ash-dark p-5 flex items-center gap-4">
                        <span className="text-3xl">📄</span>
                        <div className="flex-1">
                            <p className="font-bold text-navy">{file?.name}</p>
                            <p className="text-sm text-gray-500">{parsed.length} rows detected · {template.label} upload</p>
                        </div>
                        <button onClick={reset} className="text-xs text-gray-400 hover:text-alert transition-colors">
                            Remove ✕
                        </button>
                    </div>

                    {/* Validation results */}
                    {errors.length > 0 ? (
                        <div className="bg-alert/5 border border-alert/20 rounded-2xl p-5">
                            <p className="font-bold text-alert mb-3">
                                ⚠️ {errors.length} Validation Error{errors.length > 1 ? 's' : ''} — Fix before uploading
                            </p>
                            <ul className="space-y-1">
                                {errors.map((e, i) => (
                                    <li key={i} className="text-sm text-alert-dark flex items-start gap-2">
                                        <span>•</span>{e}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="bg-safe/5 border border-safe/20 rounded-2xl p-4 flex items-center gap-3">
                            <span className="text-2xl">✅</span>
                            <div>
                                <p className="font-bold text-safe-dark">All {parsed.length} rows passed validation</p>
                                <p className="text-sm text-gray-500">Ready to upload. Preview the first 5 rows below.</p>
                            </div>
                        </div>
                    )}

                    {/* Preview table */}
                    {preview && (
                        <div className="bg-white rounded-2xl border border-ash-dark p-5 overflow-x-auto">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                                Data Preview (first 5 rows of {parsed.length})
                            </p>
                            <table className="w-full text-xs">
                                <thead>
                                    <tr>
                                        {Object.keys(preview[0] || {}).map(h => (
                                            <th key={h} className={`table-header text-xs ${template.required.includes(h) ? '' : 'opacity-60'}`}>
                                                {h}{template.required.includes(h) ? ' *' : ''}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.map((row, i) => (
                                        <tr key={i} className="hover:bg-ash">
                                            {Object.values(row).map((v, j) => (
                                                <td key={j} className="table-cell font-mono text-xs">{v || <span className="text-gray-300">—</span>}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Auto-flag notice for contributions */}
                    {uploadType === 'contributions' && errors.length === 0 && (
                        <div className="bg-gold/5 border border-gold/20 rounded-2xl p-4">
                            <p className="font-semibold text-gold-dark text-sm">
                                🔍 Automatic Flag Check Enabled
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Each contribution will be automatically checked against Kenya's Elections Campaign Financing Act 2013.
                                Anonymous donations above KES 1M and foreign contributions will be instantly flagged.
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button onClick={reset} className="btn-outline text-sm">← Start Over</button>
                        <button onClick={handleSubmit} disabled={uploading || errors.length > 0}
                            className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            {uploading
                                ? <><span className="animate-spin">⏳</span> Uploading…</>
                                : `✓ Confirm & Upload ${parsed.length} Records`}
                        </button>
                    </div>
                </div>
            )}

            {/* ── STEP 3: RESULT ───────────────────────────────────── */}
            {step === 3 && result && (
                <div className="space-y-5">
                    <div className="bg-white rounded-2xl border border-ash-dark p-8 text-center">
                        <div className="text-5xl mb-4">{result.failed === 0 ? '✅' : '⚠️'}</div>
                        <h2 className="text-navy">Upload Complete</h2>
                        <p className="text-gray-500 text-sm mt-1">
                            {file?.name} has been processed and saved to the database.
                        </p>

                        <div className="grid grid-cols-3 gap-4 mt-6">
                            <div className="bg-safe/10 rounded-xl p-4">
                                <p className="text-2xl font-bold text-safe-dark">{result.inserted}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Records Saved</p>
                            </div>
                            <div className="bg-alert/10 rounded-xl p-4">
                                <p className="text-2xl font-bold text-alert">{result.flagged}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Auto-Flagged</p>
                            </div>
                            <div className={`${result.failed > 0 ? 'bg-alert/10' : 'bg-ash'} rounded-xl p-4`}>
                                <p className={`text-2xl font-bold ${result.failed > 0 ? 'text-alert' : 'text-gray-400'}`}>{result.failed}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Failed</p>
                            </div>
                        </div>

                        {result.autoFlags.length > 0 && (
                            <div className="mt-5 text-left bg-alert/5 border border-alert/20 rounded-xl p-4">
                                <p className="text-sm font-bold text-alert mb-2">
                                    🚩 {result.autoFlags.length} Automatic Flag{result.autoFlags.length > 1 ? 's' : ''} Raised
                                </p>
                                {result.autoFlags.map((f, i) => (
                                    <p key={i} className="text-xs text-gray-600 mb-1">• {f.note}</p>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-3 mt-6">
                            <button onClick={reset} className="btn-outline text-sm">Upload Another File</button>
                            <a href="/admin/flags" className="btn-primary text-sm">Review Flags →</a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
