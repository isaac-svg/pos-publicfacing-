import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { Loader2, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await api.post('/api/v1/business/forgot-password', { phone: phone.trim() })
      setDone(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message
      if (!msg || err === null) { setDone(true); return } // rate limit — still show success
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: '"Geist Variable", "Geist", system-ui, sans-serif' }}>
      <header className="h-14 flex items-center px-6 border-b border-slate-100">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">S</span>
          </div>
          <span className="text-slate-900 font-semibold text-sm">Shepherd</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">
          {done ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-xl">📱</div>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-900">Check your SMS</h1>
                <p className="text-sm text-slate-500">
                  If <strong className="text-slate-700">{phone}</strong> is registered with us, you'll receive a reset link shortly. It expires in 30 minutes.
                </p>
              </div>
              <p className="text-xs text-slate-400">Didn't receive it? Double-check the number is correct and try again.</p>
              <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 font-medium hover:text-indigo-700">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-900">Forgot password?</h1>
                <p className="text-sm text-slate-500">Enter the phone number you registered with. We'll send a reset link by SMS.</p>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Phone number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                    placeholder="e.g. 024 123 4567"
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !phone.trim()}
                  className="w-full h-10 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>

              <Link to="/login" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to login
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
