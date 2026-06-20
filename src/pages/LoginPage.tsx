import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuthStore } from '../store/auth'

export default function LoginPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const verified = params.get('verified') === '1'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await api.post('/api/v1/business/login', { email, password })
      const { token, business, subscription } = res.data.data
      login(token, business, subscription)

      switch (subscription.status) {
        case 'no_plan_selected': navigate('/select-plan'); break
        case 'pending_payment':  navigate('/pending'); break
        case 'active':           navigate('/dashboard'); break
        default:                 navigate('/pending'); break
      }
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-sm border p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Log in to manage your subscription</p>
        </div>

        {verified && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-md px-3 py-2">Email verified! You can now log in.</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-3 py-2">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full h-10 rounded-md border px-3 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full h-10 rounded-md border px-3 text-sm" />
          </div>
          <button type="submit" disabled={loading} className="w-full h-10 rounded-md bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
