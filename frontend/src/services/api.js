import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 15000,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('gp-access-token') || localStorage.getItem('gp-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (import.meta.env.DEV) console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
  return config
})

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gp-access-token')
      localStorage.removeItem('gp-token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// AUTH
export const loginWithFirebase = (firebaseToken, name, phone) =>
  client.post('/auth/login', { firebase_token: firebaseToken, name, phone })

// Named `api` object — used by Login.jsx and OTP.jsx for phone OTP flow
export const api = {
  async sendOTP(phone) {
    const { setupRecaptcha, auth } = await import('./firebase')
    const { signInWithPhoneNumber } = await import('firebase/auth')
    const verifier = setupRecaptcha('recaptcha-container')
    const confirmation = await signInWithPhoneNumber(auth, phone, verifier)
    window.__gpConfirmation = confirmation
    return { success: true }
  },

  async verifyOTP(phone, otp) {
    if (!window.__gpConfirmation) throw new Error('OTP not sent')
    const result = await window.__gpConfirmation.confirm(otp)
    const idToken = await result.user.getIdToken()
    const data = await client.post('/auth/login', {
      firebase_token: idToken,
      phone: result.user.phoneNumber || phone,
    })
    localStorage.setItem('gp-access-token', data.access_token)
    return { success: true, worker: data.worker, token: data.access_token }
  },

  async getWorker(id) {
    return client.get(`/workers/${id}`)
  },
}

// WORKERS
export const getMyProfile = () => client.get('/workers/me')
export const updateMyProfile = (data) => client.put('/workers/me', data)
export const getMyRiskScore = () => client.get('/workers/me/risk-score')
export const updateLastOrder = () => client.post('/workers/me/update-last-order')
export const getMyEarnings = () => client.get('/workers/me/earnings')

// POLICIES
export const getActivePolicy = () => client.get('/policies/my/active')
export const getMyPolicies = () => client.get('/policies/my')

// PAYMENTS
export const createPaymentOrder = (planId, amount) =>
  client.post('/payments/create-order', { plan_id: planId, amount })
export const verifyPayment = (data) => client.post('/payments/verify', data)

// CLAIMS
export const getMyClaims = (status, limit, skip) =>
  client.get('/claims/my', { params: { status, limit, skip } })
export const getClaimDetail = (claimId) => client.get(`/claims/${claimId}`)

// TRIGGERS
export const getActiveTriggers = () => client.get('/triggers/active')
export const getMyZoneTriggers = () => client.get('/triggers/my-zone')

// FORECAST
export const getZoneForecast = () => client.get('/forecast/zones')
export const getMyZoneForecast = () => client.get('/forecast/my-zone')
export const getZoneIntel = (zone) => client.get(`/forecast/zone-intel/${zone}`)

// ADMIN
export const getAdminStats = () => client.get('/admin/stats')
export const getClaimsQueue = (status) =>
  client.get('/admin/claims/queue', { params: { status } })
export const approveClaim = (claimId) => client.patch(`/admin/claims/${claimId}/approve`)
export const rejectClaim = (claimId, reason) =>
  client.patch(`/admin/claims/${claimId}/reject`, null, { params: { reason } })
export const getAnalytics = (days) => client.get('/admin/analytics', { params: { days } })
export const getCommunityStats = () => client.get('/admin/community-stats')
export const simulateTrigger = (city, triggerType) =>
  client.post('/admin/simulate-trigger', { city, trigger_type: triggerType })

export default client
