import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useThemeStore } from './store/themeStore'
import { useWorkerStore } from './store/workerStore'
import LoadingScreen from './components/ui/LoadingScreen'
import WorkerLayout from './components/layout/WorkerLayout'
import { AnimatedBackground } from './components/ui/AnimatedBackground'

import Landing from './pages/Landing'
import Login from './pages/worker/Login'
import Register from './pages/worker/Register'
import Onboarding from './pages/Onboarding'
import PaymentSuccess from './pages/worker/PaymentSuccess'
import OTP from './pages/worker/OTP'
import ZoneSelect from './pages/worker/ZoneSelect'
import RiskScore from './pages/worker/RiskScore'
import AIForecast from './pages/worker/AIForecast'
import Premium from './pages/worker/Premium'
import Coverage from './pages/worker/Coverage'
import Dashboard from './pages/worker/Dashboard'
import ClaimStatus from './pages/worker/ClaimStatus'
import PayoutSuccess from './pages/worker/PayoutSuccess'
import Profile from './pages/worker/Profile'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Maintenance from './pages/Maintenance'

import ClaimsList from './pages/worker/ClaimsList'
import NotificationsPage from './pages/worker/NotificationsPage'

import AdminDashboard from './pages/admin/AdminDashboard'
import ClaimsQueue from './pages/admin/ClaimsQueue'
import Analytics from './pages/admin/Analytics'

const CITIES = [
  { name: 'Hyderabad', lat: 17.385, lng: 78.4867, zone: 'kondapur-hyderabad' },
  { name: 'Mumbai',    lat: 19.076, lng: 72.8777, zone: 'kurla-mumbai' },
  { name: 'Chennai',   lat: 13.083, lng: 80.2707, zone: 'tnagar-chennai' },
  { name: 'Bengaluru', lat: 12.972, lng: 77.5946, zone: 'koramangala-bengaluru' },
]

function getNearestCity(lat, lng) {
  let nearest = CITIES[0]
  let minDist = Infinity
  CITIES.forEach((c) => {
    const d = Math.hypot(c.lat - lat, c.lng - lng)
    if (d < minDist) { minDist = d; nearest = c }
  })
  return nearest
}

function ProtectedRoute({ children }) {
  const isAuthenticated = useWorkerStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const isAuthenticated = useWorkerStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/otp" element={<PublicRoute><OTP /></PublicRoute>} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Legal — accessible always */}
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* Protected worker routes — nested under WorkerLayout */}
        <Route
          element={
            <ProtectedRoute>
              <WorkerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/zone"           element={<ZoneSelect />} />
          <Route path="/risk-score"     element={<RiskScore />} />
          <Route path="/forecast"       element={<AIForecast />} />
          <Route path="/premium"        element={<Premium />} />
          <Route path="/coverage"       element={<Coverage />} />
          <Route path="/dashboard"      element={<Dashboard />} />
          <Route path="/claim/:id"      element={<ClaimStatus />} />
          <Route path="/payout-success" element={<PayoutSuccess />} />
          <Route path="/profile"        element={<Profile />} />
          <Route path="/claims"         element={<ClaimsList />} />
          <Route path="/notifications"  element={<NotificationsPage />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin"           element={<AdminDashboard />} />
        <Route path="/admin/claims"    element={<ClaimsQueue />} />
        <Route path="/admin/analytics" element={<Analytics />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  )
}

export default function App() {
  const [appReady, setAppReady] = useState(false)
  const { isDark } = useThemeStore()
  const setDetectedCity = useWorkerStore((s) => s.setDetectedCity)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        const city = getNearestCity(lat, lng)
        setDetectedCity({ lat, lng, city: city.name, zone: city.zone })
      },
      () => {},
      { timeout: 5000 }
    )
  }, [])

  if (!appReady) {
    return <LoadingScreen onComplete={() => setAppReady(true)} />
  }

  return (
    <BrowserRouter>
      <AnimatedBackground />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <AppRoutes />
    </BrowserRouter>
  )
}
