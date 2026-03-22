import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, ArrowLeft, ArrowRight, User, Calendar } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useWorkerStore } from '../../store/workerStore'

const PLATFORMS = [
  { id: 'swiggy',   label: 'Swiggy',  emoji: '🍔' },
  { id: 'zomato',   label: 'Zomato',  emoji: '🍕' },
  { id: 'zepto',    label: 'Zepto',   emoji: '⚡' },
  { id: 'blinkit',  label: 'Blinkit', emoji: '🛒' },
]

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const YEARS = Array.from({ length: 6 }, (_, i) => (2024 - i).toString())

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.15 } },
}

export default function Register() {
  const navigate = useNavigate()
  const { login } = useWorkerStore()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [platforms, setPlatforms] = useState([])
  const [month, setMonth] = useState('')
  const [year, setYear] = useState('')
  const [errors, setErrors] = useState({})

  const togglePlatform = (id) => {
    setPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const validateStep1 = () => {
    const e = {}
    if (!name.trim() || name.trim().length < 2) e.name = 'Enter your full name'
    if (platforms.length === 0) e.platforms = 'Select at least one platform'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2)
  }

  const handleFinish = () => {
    login({
      name: name.trim(),
      phone: '+919876543210',
      zone: 'kondapur-hyderabad',
      riskScore: 0.82,
      riskTier: 'LOW',
      premium: 58,
      coverageCap: 600,
      policyStatus: 'ACTIVE',
      platforms,
    })
    navigate('/risk-score')
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg-primary)' }}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '16px 20px', borderBottom: '1px solid var(--border-light)',
      }}>
        <button
          onClick={() => step === 1 ? navigate('/login') : setStep(1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}
        >
          <ArrowLeft size={20} style={{ color: 'var(--text-primary)' }} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={20} style={{ color: 'var(--brand)' }} />
          <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 17, color: 'var(--text-primary)' }}>
            GuidePay
          </span>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-tertiary)', fontFamily: 'Inter, sans-serif' }}>
          Step {step} of 2
        </div>
      </div>

      {/* Progress */}
      <div style={{ height: 3, background: 'var(--bg-tertiary)' }}>
        <motion.div
          style={{ height: '100%', background: 'var(--brand)', borderRadius: 999 }}
          animate={{ width: step === 1 ? '50%' : '100%' }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        />
      </div>

      <div style={{ flex: 1, padding: '32px 20px 24px' }}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                Your details
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', marginBottom: 28, lineHeight: 1.5 }}>
                Tell us a bit about yourself to set up your coverage.
              </p>

              {/* Name */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', marginBottom: 6 }}>
                  Full name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input
                    type="text"
                    placeholder="Ravi Kumar"
                    value={name}
                    onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })) }}
                    style={{
                      width: '100%', height: 52, paddingLeft: 44, paddingRight: 16,
                      borderRadius: 12, border: errors.name ? '1.5px solid var(--danger)' : '1.5px solid var(--border)',
                      background: 'var(--bg-primary)', color: 'var(--text-primary)',
                      fontSize: 15, fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
                {errors.name && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>{errors.name}</p>}
              </div>

              {/* Platforms */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', marginBottom: 10 }}>
                  Which platforms do you deliver for?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {PLATFORMS.map(p => {
                    const active = platforms.includes(p.id)
                    return (
                      <motion.button
                        key={p.id}
                        onClick={() => togglePlatform(p.id)}
                        whileTap={{ scale: 0.96 }}
                        style={{
                          height: 56, borderRadius: 12, border: active ? '2px solid var(--brand)' : '1.5px solid var(--border)',
                          background: active ? 'var(--brand-light)' : 'var(--bg-primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          cursor: 'pointer', fontSize: 15, fontFamily: 'Inter, sans-serif',
                          fontWeight: active ? 600 : 400, color: active ? 'var(--brand)' : 'var(--text-primary)',
                          transition: 'all 0.15s',
                        }}
                      >
                        <span>{p.emoji}</span> {p.label}
                      </motion.button>
                    )
                  })}
                </div>
                {errors.platforms && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>{errors.platforms}</p>}
              </div>

              {/* Start date */}
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', marginBottom: 6 }}>
                  When did you start delivering? (optional)
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <select value={month} onChange={e => setMonth(e.target.value)}
                    style={{ flex: 1, height: 48, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-primary)', color: month ? 'var(--text-primary)' : 'var(--text-tertiary)', fontSize: 14, fontFamily: 'Inter, sans-serif', padding: '0 12px', outline: 'none' }}>
                    <option value="">Month</option>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select value={year} onChange={e => setYear(e.target.value)}
                    style={{ flex: 1, height: 48, borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-primary)', color: year ? 'var(--text-primary)' : 'var(--text-tertiary)', fontSize: 14, fontFamily: 'Inter, sans-serif', padding: '0 12px', outline: 'none' }}>
                    <option value="">Year</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <Button onClick={handleNext} fullWidth>
                Next — Set your zone <ArrowRight size={16} />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <h1 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                Your delivery zone
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', marginBottom: 28, lineHeight: 1.5 }}>
                We'll monitor this area for flood alerts and outages.
              </p>

              {/* Zone placeholder — ZoneSelect logic embedded here */}
              <div style={{
                height: 180, borderRadius: 16, background: 'var(--bg-secondary)',
                border: '1.5px solid var(--border)', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24,
              }}>
                <span style={{ fontSize: 32 }}>📍</span>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', margin: 0, fontWeight: 500 }}>
                  Kondapur, Hyderabad
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'Inter, sans-serif', margin: 0 }}>
                  Auto-detected · 5km coverage radius
                </p>
              </div>

              <div style={{
                background: 'var(--success-light)', borderRadius: 12, padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28,
                border: '1px solid rgba(18,183,106,0.2)',
              }}>
                <ShieldCheck size={18} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)', fontFamily: 'Inter, sans-serif', margin: 0 }}>Zone confirmed</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', margin: 0 }}>Weekly premium from ₹58 · Flood + Outage + Curfew covered</p>
                </div>
              </div>

              <Button onClick={handleFinish} fullWidth>
                Get my risk score →
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)', fontFamily: 'Inter, sans-serif', marginTop: 20 }}>
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} style={{ color: 'var(--brand)', fontWeight: 600, cursor: 'pointer' }}>
            Sign in
          </span>
        </p>
      </div>
    </motion.div>
  )
}
