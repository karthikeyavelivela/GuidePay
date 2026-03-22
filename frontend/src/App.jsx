import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useThemeStore } from './store/themeStore'
import { useWorkerStore } from './store/workerStore'
import LoadingScreen from './components/ui/LoadingScreen'
import WorkerLayout from './components/layout/WorkerLayout'
import { AnimatedBackground } from './components/ui/AnimatedBackground'

import Login from './pages/worker/Login'
import OTP from './pages/worker/OTP'
import ZoneSelect from './pages/worker/ZoneSelect'
import RiskScore from './pages/worker/RiskScore'
import AIForecast from './pages/worker/AIForecast'
import Premium from './pages/worker/Premium'
import Dashboard from './pages/worker/Dashboard'
import ClaimStatus from './pages/worker/ClaimStatus'
import PayoutSuccess from './pages/worker/PayoutSuccess'
import Profile from './pages/worker/Profile'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Maintenance from './pages/Maintenance'

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
  if (!isAuthenticated) return <Navigate to="/" replace />
  return children
}

function PublicRoute({ children }) {
  const isAuthenticated = useWorkerStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/otp" element={<PublicRoute><OTP /></PublicRoute>} />

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
          <Route path="/dashboard"      element={<Dashboard />} />
          <Route path="/claim/:id"      element={<ClaimStatus />} />
          <Route path="/payout-success" element={<PayoutSuccess />} />
          <Route path="/profile"        element={<Profile />} />
          <Route path="/claims"         element={
            <Maintenance
              feature="Claims history"
              eta="Live in Phase 2 — April 2026"
            />
          } />
        </Route>

        {/* Admin routes */}
        <Route path="/admin"           element={<AdminDashboard />} />
        <Route path="/admin/claims"    element={<ClaimsQueue />} />
        <Route path="/admin/analytics" element={<Analytics />} />

        {/* Legal — public */}
        <Route path="/terms"   element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  const [appReady, setAppReady] = useState(false)
  const { isDark } = useThemeStore()
  const setDetectedCity = useWorkerStore((s) => s.setDetectedCity)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  // The LoadingScreen calls onComplete when language scramble finishes
  // We also detect location in the background
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
      <AppRoutes />
    </BrowserRouter>
  )
}
