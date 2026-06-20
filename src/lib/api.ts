import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('signup_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('signup_token')
    window.location.href = '/login'
  }
  return Promise.reject(err)
})

const w = <T,>(p: Promise<{ data: { data: T } }>) => p.then(r => r.data.data)

// ── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (d: { username: string; password: string }) => api.post('/api/v1/auth/login', d).then(r => r.data.data),
  changePassword: (d: { currentPassword: string; newPassword: string }) => api.post('/api/v1/auth/change-password', d),
  me: () => api.get('/api/v1/auth/me').then(r => r.data.data),
}

// ── Business Auth ───────────────────────────────────────────────────────────
export const businessApi = {
  signup: (d: { businessName: string; ownerEmail: string; ownerPhone?: string; password: string }) =>
    api.post('/api/v1/business/signup', d).then(r => r.data.data),
  verifyOtp: (d: { email: string; otpCode: string }) => api.post('/api/v1/business/verify-otp', d).then(r => r.data.data),
  resendOtp: (d: { email: string }) => api.post('/api/v1/business/resend-otp', d).then(r => r.data.data),
  login: (d: { email: string; password: string }) => api.post('/api/v1/business/login', d).then(r => r.data.data),
}

// ── Subscription ────────────────────────────────────────────────────────────
export const subscriptionApi = {
  plans: () => api.get('/api/v1/subscriptions/plans').then(r => r.data.data),
  selectPlan: (d: { plan: string }) => api.post('/api/v1/subscriptions/select-plan', d).then(r => r.data.data),
  status: () => api.get('/api/v1/subscriptions/status').then(r => r.data.data),
}

// ── Products ────────────────────────────────────────────────────────────────
export const productsApi = {
  list: (p?: { itemType?: string; categoryId?: number; include_deleted?: boolean }) =>
    w(api.get('/api/v1/products', { params: p })),
  get: (id: number) => w(api.get(`/api/v1/products/${id}`)),
  create: (d: Record<string, unknown>) => w(api.post('/api/v1/products', d)),
  update: (id: number, d: Record<string, unknown>) => w(api.patch(`/api/v1/products/${id}`, d)),
  delete: (id: number) => api.delete(`/api/v1/products/${id}`),
  generateSku: (itemType?: string) => w(api.get('/api/v1/products/generate-sku', { params: itemType ? { itemType } : {} })),
}

// ── Categories ──────────────────────────────────────────────────────────────
export const categoriesApi = {
  list: (p?: { include_inactive?: boolean }) => w(api.get('/api/v1/categories', { params: p })),
  create: (d: { name: string; parentId?: number }) => w(api.post('/api/v1/categories', d)),
  update: (id: number, d: Record<string, unknown>) => w(api.patch(`/api/v1/categories/${id}`, d)),
  delete: (id: number) => api.delete(`/api/v1/categories/${id}`),
}

// ── Allocations ─────────────────────────────────────────────────────────────
export const allocationsApi = {
  list: (p?: { low_stock?: boolean }) => w(api.get('/api/v1/allocations', { params: p })),
  create: (d: { productId: number; shopId: number; qty: number; shopPrice?: number }) =>
    w(api.post('/api/v1/allocations', d)),
}

// ── Sales ────────────────────────────────────────────────────────────────────
export const salesApi = {
  list: (p?: { from?: string; to?: string }) => w(api.get('/api/v1/sales', { params: p })),
  get: (id: number) => w(api.get(`/api/v1/sales/${id}`)),
}

// ── Reports ─────────────────────────────────────────────────────────────────
export const reportsApi = {
  sales: (p: { from: string; to: string; shopId?: number }) => w(api.get('/api/v1/reports/sales', { params: p })),
  chart: (p: { period: string }) => w(api.get('/api/v1/reports/chart', { params: p })),
  allocations: () => w(api.get('/api/v1/reports/allocations')),
}

// ── Credit ──────────────────────────────────────────────────────────────────
export const creditApi = {
  policy: { get: () => w(api.get('/api/v1/credit/policy')), update: (d: Record<string, unknown>) => w(api.patch('/api/v1/credit/policy', d)) },
  customers: {
    list: (p?: { q?: string }) => w(api.get('/api/v1/credit/customers', { params: p })),
    get: (id: number) => w(api.get(`/api/v1/credit/customers/${id}`)),
    create: (d: Record<string, unknown>) => w(api.post('/api/v1/credit/customers', d)),
    update: (id: number, d: Record<string, unknown>) => w(api.patch(`/api/v1/credit/customers/${id}`, d)),
  },
  accounts: {
    list: (p?: { status?: string }) => w(api.get('/api/v1/credit/accounts', { params: p })),
    get: (id: number) => w(api.get(`/api/v1/credit/accounts/${id}`)),
    create: (d: Record<string, unknown>) => w(api.post('/api/v1/credit/accounts', d)),
    payments: (id: number) => w(api.get(`/api/v1/credit/accounts/${id}/payments`)),
  },
  payments: { cash: (d: Record<string, unknown>) => w(api.post('/api/v1/credit/payments/cash', d)) },
  dashboard: {
    summary: () => w(api.get('/api/v1/credit/dashboard/summary')),
    upcoming: () => w(api.get('/api/v1/credit/dashboard/upcoming')),
    overdue: () => w(api.get('/api/v1/credit/dashboard/overdue')),
  },
  reports: {
    collections: (p: { from: string; to: string }) => w(api.get('/api/v1/credit/reports/collections', { params: p })),
    customers: () => w(api.get('/api/v1/credit/reports/customers')),
  },
}

// ── Users ────────────────────────────────────────────────────────────────────
export const usersApi = {
  list: () => w(api.get('/api/v1/users')),
  create: (d: Record<string, unknown>) => w(api.post('/api/v1/users', d)),
  update: (id: number, d: Record<string, unknown>) => w(api.patch(`/api/v1/users/${id}`, d)),
}

// ── Roles ────────────────────────────────────────────────────────────────────
export const rolesApi = {
  list: () => w(api.get('/api/v1/roles')),
  get: (id: number) => w(api.get(`/api/v1/roles/${id}`)),
  create: (d: Record<string, unknown>) => w(api.post('/api/v1/roles', d)),
  update: (id: number, d: Record<string, unknown>) => w(api.patch(`/api/v1/roles/${id}`, d)),
  delete: (id: number) => api.delete(`/api/v1/roles/${id}`),
}

// ── Shops ────────────────────────────────────────────────────────────────────
export const shopsApi = {
  list: () => w(api.get('/api/v1/shops')),
  create: (d: { name: string; address?: string }) => w(api.post('/api/v1/shops', d)),
  update: (id: number, d: Record<string, unknown>) => w(api.patch(`/api/v1/shops/${id}`, d)),
}

// ── Settings ────────────────────────────────────────────────────────────────
export const settingsApi = {
  get: () => w(api.get('/api/v1/settings')),
  update: (d: Record<string, unknown>) => w(api.patch('/api/v1/settings', d)),
  receiptConfig: { get: () => w(api.get('/api/v1/receipt-config')), update: (d: Record<string, unknown>) => w(api.patch('/api/v1/receipt-config', d)) },
  taxes: { list: () => w(api.get('/api/v1/taxes')), create: (d: Record<string, unknown>) => w(api.post('/api/v1/taxes', d)), update: (id: number, d: Record<string, unknown>) => w(api.patch(`/api/v1/taxes/${id}`, d)), delete: (id: number) => api.delete(`/api/v1/taxes/${id}`) },
  hubtel: { status: () => w(api.get('/api/v1/settings/hubtel/status')), get: () => w(api.get('/api/v1/settings/hubtel')), update: (d: Record<string, unknown>) => w(api.patch('/api/v1/settings/hubtel', d)) },
}
