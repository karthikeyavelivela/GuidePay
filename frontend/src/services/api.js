import axios from 'axios'

const rawApiUrl = import.meta.env.VITE_API_URL
const isPlaceholderUrl =
  !rawApiUrl ||
  rawApiUrl.includes('your-railway-app') ||
  rawApiUrl.includes('your-app.onrender.com') ||
  rawApiUrl.includes('your-render-url.onrender.com')

const BASE_URL = isPlaceholderUrl ? 'http://localhost:8000' : rawApiUrl.replace(/\/$/, '')
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const http = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

const isTimeoutError = (error) =>
  error?.code === 'ECONNABORTED' || error?.name === 'AbortError' || /timeout/i.test(error?.message || '')

const requestWithRetry = async (requestFn, retries = 1) => {
  let lastError
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await requestFn()
    } catch (error) {
      lastError = error
      if (attempt === retries || !isTimeoutError(error)) {
        throw error
      }
    }
  }
  throw lastError
}

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('gp-token') || localStorage.getItem('gp-access-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('gp-token')
      localStorage.removeItem('gp-access-token')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error.response?.data || error)
  }
)

export const loginWithFirebase = (token, name, phone) =>
  http.post('/auth/login', { firebase_token: token, name, phone })

export const api = {
  async getWorker(id) {
    return http.get(`/workers/${id}`)
  },
}

export const getMyProfile = () => requestWithRetry(() => http.get('/workers/me'))
export const updateMyProfile = (data) => http.put('/workers/me', data)
export const getMyRiskScore = () => http.get('/workers/me/risk-score')
export const getMyPremiumBreakdown = (zone) =>
  http.get('/workers/me/premium-breakdown', { params: { zone } })
export const getZonePremiumCompare = () => http.get('/workers/premium-compare')
export const getMyEarnings = () => http.get('/workers/me/earnings')
export const getCommunityStats = () => http.get('/admin/community-stats')
export const updateLastOrder = () => http.post('/workers/me/update-last-order')

export const getActivePolicy = () => http.get('/policies/my/active')
export const getMyPolicies = () => http.get('/policies/my')

export const createPaymentOrder = (planId, amount = 0) =>
  http.post('/payments/create-order', { plan_id: planId, amount })
export const verifyPayment = (data) => http.post('/payments/verify', data)

export const getMyClaims = (status, limit = 20, skip = 0) =>
  http.get('/claims/my', { params: { status, limit, skip } })
export const getClaimDetail = (id) => http.get(`/claims/${id}`)

export const getActiveTriggers = () => http.get('/triggers/active')
export const getMyZoneTriggers = () => http.get('/triggers/my-zone')
export const getTriggerTypes = () => http.get('/triggers/types')

export const getZoneForecast = () => http.get('/forecast/zones')
export const getMyZoneForecast = () => http.get('/forecast/my-zone')
export const getZoneIntel = (zone) => http.get(`/forecast/zone-intel/${zone}`)

export const getMyNotifications = () => http.get('/notifications/me')
export const markNotificationRead = (id) => http.patch(`/notifications/me/${id}/read`)
export const markAllNotificationsRead = () => http.patch('/notifications/me/read-all')

export const getMySupportTickets = () => http.get('/support/my')
export const createSupportTicket = (data) => http.post('/support/my', data)
export const getSupportTicket = (ticketId) => http.get(`/support/my/${ticketId}`)
export const sendSupportMessage = (ticketId, text) =>
  http.post(`/support/my/${ticketId}/messages`, { text })

export const getAdminStats = () => http.get('/admin/stats')
export const getClaimsQueue = (status = 'ALL') =>
  http.get('/admin/claims/queue', { params: { status } })
export const getAdminAnalytics = (days = 30) =>
  http.get('/admin/analytics', { params: { days } })
export const getAnalytics = getAdminAnalytics
export const approveClaim = (id) => http.patch(`/admin/claims/${id}/approve`)
export const rejectClaim = (id, reason) =>
  http.patch(`/admin/claims/${id}/reject`, null, { params: { reason } })
export const simulateTrigger = (city, type) =>
  http.post('/admin/simulate-trigger', { city, trigger_type: type })
export const getAdminSupportTickets = (status = 'all') =>
  http.get('/support/admin/tickets', { params: { status } })
export const sendAdminSupportMessage = (ticketId, text) =>
  http.post(`/support/admin/tickets/${ticketId}/messages`, { text })
export const updateAdminSupportStatus = (ticketId, status) =>
  http.patch(`/support/admin/tickets/${ticketId}/status`, { status })

export default http
