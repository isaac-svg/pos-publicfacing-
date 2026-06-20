import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ businessName: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }

    setLoading(true)
    try {
      await api.post('/api/v1/business/signup', {
        businessName: form.businessName,
        ownerEmail: form.email,
        ownerPhone: form.phone || undefined,
        password: form.password,
      })
      navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Signup failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Get started with Shepherd POS</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Business name</label>
            <input value={form.businessName} onChange={set('businessName')} required className="w-full h-10 rounded-md border px-3 text-sm" placeholder="Kofi's Provision Shop" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input type="email" value={form.email} onChange={set('email')} required className="w-full h-10 rounded-md border px-3 text-sm" placeholder="kofi@example.com" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="tel" value={form.phone} onChange={set('phone')} className="w-full h-10 rounded-md border px-3 text-sm" placeholder="024XXXXXXX" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <input type="password" value={form.password} onChange={set('password')} required className="w-full h-10 rounded-md border px-3 text-sm" placeholder="Minimum 8 characters" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Confirm password</label>
            <input type="password" value={form.confirm} onChange={set('confirm')} required className="w-full h-10 rounded-md border px-3 text-sm" />
          </div>
          <button type="submit" disabled={loading} className="w-full h-10 rounded-md bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}
