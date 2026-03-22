import axios from 'axios'
import { MOCK_WORKER, MOCK_FORECAST, MOCK_CLAIM, MOCK_PAYOUTS, MOCK_ADMIN } from './mockData'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('gp-token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (import.meta.env.DEV) console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
  return config
})

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

export const api = {
  async sendOTP(phone) {
    if (USE_MOCK) { await delay(800); return { success: true } }
    return client.post('/auth/otp', { phone })
  },

  async verifyOTP(phone, otp) {
    if (USE_MOCK) {
      await delay(1000)
      if (otp === '1234') return { success: true, worker: MOCK_WORKER, token: 'mock-token' }
      throw new Error('Invalid OTP')
    }
    return client.post('/auth/verify', { phone, otp })
  },

  async getWorker(id) {
    if (USE_MOCK) { await delay(300); return MOCK_WORKER }
    return client.get(`/workers/${id}`)
  },

  async getForecast(zone) {
    if (USE_MOCK) { await delay(500); return MOCK_FORECAST }
    return client.get(`/forecast/${zone}`)
  },

  async getClaim(id) {
    if (USE_MOCK) { await delay(300); return MOCK_CLAIM }
    return client.get(`/claims/${id}`)
  },

  async getPayouts() {
    if (USE_MOCK) { await delay(300); return MOCK_PAYOUTS }
    return client.get('/payouts')
  },

  async getAdminStats() {
    if (USE_MOCK) { await delay(400); return MOCK_ADMIN }
    return client.get('/admin/stats')
  },
}
