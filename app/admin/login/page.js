'use client'
// app/admin/login/page.js — Admin Login Page
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabaseAdmin'

export default function AdminLoginPage() {
    const router = useRouter()
    const supabase = createBrowserClient()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleLogin(e) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }

        // Update last_login timestamp
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            await supabase.from('admin_users').update({ last_login: new Date().toISOString() }).eq('id', user.id)
        }

        router.push('/admin')
    }

    return (
        <div className="min-h-screen bg-navy flex items-center justify-center px-4">
            <div className="w-full max-w-md">

                {/* Header */}
                <div className="text-center mb-8">
                    <p className="text-gold font-bold text-2xl">CampaignWatch Kenya 🇰🇪</p>
                    <p className="text-gray-400 text-sm mt-1">Admin Panel — Restricted Access</p>
                </div>

                {/* Login card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-navy font-bold text-xl mb-1">Sign In</h2>
                    <p className="text-gray-400 text-sm mb-6">
                        Only authorised TI Kenya staff can access this panel.
                    </p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="admin@tikenya.org"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy
                           transition-all" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
                            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy
                           transition-all" />
                        </div>

                        {error && (
                            <div className="bg-alert/10 border border-alert/20 text-alert text-sm rounded-xl px-4 py-3">
                                ⚠️ {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading}
                            className="w-full bg-navy text-white font-semibold py-3 rounded-xl
                         hover:bg-navy-light transition-colors disabled:opacity-50
                         disabled:cursor-not-allowed mt-2">
                            {loading ? 'Signing in…' : 'Sign In to Admin Panel'}
                        </button>
                    </form>
                </div>

                {/* Warning */}
                <p className="text-center text-xs text-gray-500 mt-6">
                    🔒 All admin actions are logged and audited.
                    Unauthorised access attempts are recorded.
                </p>

                <div className="text-center mt-4">
                    <a href="/" className="text-xs text-gray-500 hover:text-gold transition-colors">
                        ← Back to public site
                    </a>
                </div>
            </div>
        </div>
    )
}
