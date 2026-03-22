import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Info } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useWorkerStore } from '../../store/workerStore'
import { api } from '../../services/api'

const container = {
  animate: { transition: { staggerChildren: 0.08 } },
}
const item = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
}

// Google SVG logo
const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
  </svg>
)

export default function Login() {
  const navigate = useNavigate()
  const { setPhone } = useWorkerStore()
  const [phone, setPhoneLocal] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('phone') // 'phone' | 'google'

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')
    try {
      // Dynamic import to avoid errors if Firebase not configured
      const { signInWithGoogle } = await import('../../services/firebase')
      const user = await signInWithGoogle()
      const { login } = useWorkerStore.getState()
      login({
        name: user.name || 'Ravi Kumar',
        phone: user.phone || '+919876543210',
        email: user.email,
        photo: user.photo,
        zone: 'kondapur-hyderabad',
        riskScore: 0.82,
        riskTier: 'LOW',
        premium: 58,
        coverageCap: 600,
        policyStatus: 'ACTIVE',
      })
      navigate('/dashboard')
    } catch (e) {
      // Firebase not configured — use mock
      const { login } = useWorkerStore.getState()
      login(null)
      navigate('/dashboard')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSendOTP = async () => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }
    setError('')
    setLoading(true)
    try {
      await api.sendOTP(`+91${cleaned}`)
      setPhone(`+91${cleaned}`)
      navigate('/otp')
    } catch {
      setError('Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDisplay = (val) => {
    const d = val.replace(/\D/g, '').slice(0, 10)
    if (d.length > 5) return `${d.slice(0, 5)} ${d.slice(5)}`
    return d
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-primary)' }}
      initial="initial"
      animate="animate"
      variants={container}
    >
      {/* GIF HERO */}
      <div style={{
        width: '100%',
        height: 220,
        overflow: 'hidden',
        position: 'relative',
        borderRadius: '0 0 24px 24px',
        background: '#0F0F0F',
        flexShrink: 0,
      }}>
        <img
          src="https://res.cloudinary.com/dqwm8wgg8/image/upload/v1774181576/yvg6hwnrtbpnaagohbvb.gif"
          alt="Delivery worker"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.85,
          }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: 80,
          background: 'linear-gradient(to bottom, transparent, var(--bg-primary))',
        }} />
        {/* Logo overlay */}
        <div style={{
          position: 'absolute',
          top: 16, left: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            borderRadius: 10,
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}>
            <ShieldCheck size={18} color="white" />
            <span style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: 16,
              fontWeight: 800,
              color: 'white',
            }}>GuidePay</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pt-6 pb-4">
        <motion.h1
          variants={item}
          className="font-display font-bold text-[28px] leading-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Income protection for delivery workers.
        </motion.h1>

        <motion.p
          variants={item}
          className="font-body text-[14px] leading-relaxed mt-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          Auto-pays when floods, outages, or curfews stop you from working.
        </motion.p>

        {/* Trust chips */}
        <motion.div variants={item} className="flex flex-wrap gap-2 mt-4">
          {['🌊 Flood cover', '📱 Outage pay', '🚫 Curfew pay'].map((chip) => (
            <span
              key={chip}
              className="rounded-pill px-3 py-1.5 text-[12px] font-medium font-body"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              {chip}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Auth card */}
      <motion.div
        variants={item}
        className="mx-4 mb-4 rounded-card p-5"
        style={{ background: 'var(--bg-primary)', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-light)' }}
      >
        {/* Google Sign-In (primary) */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 h-[52px] rounded-input font-semibold text-[15px] font-body transition-colors"
          style={{
            background: 'var(--bg-primary)',
            border: '1.5px solid var(--border)',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-sm)',
            opacity: googleLoading ? 0.7 : 1,
          }}
        >
          {googleLoading ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <GoogleLogo />
          )}
          Continue with Google
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-[13px] font-body" style={{ color: 'var(--text-tertiary)' }}>or</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        {/* Phone input */}
        <label className="block text-[13px] font-medium font-body mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          Mobile number
        </label>
        <div
          className="flex items-center rounded-input overflow-hidden h-[52px] transition-all"
          style={{
            border: error ? '1.5px solid var(--danger)' : '1.5px solid var(--border)',
          }}
        >
          <div
            className="flex items-center justify-center px-3.5 h-full text-[15px] font-semibold font-body flex-shrink-0"
            style={{ background: 'var(--bg-secondary)', borderRight: '1.5px solid var(--border)', color: 'var(--text-primary)' }}
          >
            +91
          </div>
          <input
            type="tel"
            inputMode="numeric"
            placeholder="98765 43210"
            value={formatDisplay(phone)}
            onChange={(e) => { setPhoneLocal(e.target.value); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
            className="flex-1 h-full px-4 text-[15px] font-body outline-none"
            style={{ background: 'transparent', color: 'var(--text-primary)' }}
          />
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[12px] mt-1.5 font-body"
              style={{ color: 'var(--danger)' }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {!error && (
          <div className="flex items-center gap-1.5 mt-2">
            <Info size={12} style={{ color: 'var(--text-tertiary)' }} />
            <span className="text-[12px] font-body" style={{ color: 'var(--text-tertiary)' }}>OTP sent via SMS</span>
          </div>
        )}

        <div className="mt-3">
          <Button onClick={handleSendOTP} loading={loading} fullWidth>
            Send OTP
          </Button>
        </div>
      </motion.div>

      <motion.p
        variants={item}
        className="px-6 pb-6 text-center text-[12px] font-body"
        style={{ color: 'var(--text-tertiary)' }}
      >
        By continuing, you agree to our{' '}
        <span style={{ color: 'var(--brand)' }}>Terms &amp; Privacy Policy</span>
      </motion.p>
    </motion.div>
  )
}
