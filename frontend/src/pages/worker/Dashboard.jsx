import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import LiveDot from '../../components/ui/LiveDot'
import ChatWidget from '../../components/chat/ChatWidget'
import { useWorkerStore } from '../../store/workerStore'
import { useClaimStore } from '../../store/claimStore'
import { formatINR } from '../../utils/formatters'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
}

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
}
const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } },
}

export default function Dashboard() {
  const navigate = useNavigate()
  const worker = useWorkerStore((s) => s.worker)
  const activePolicy = useWorkerStore((s) => s.activePolicy)
  const onboarded = useWorkerStore((s) => s.onboarded)
  const setOnboarded = useWorkerStore((s) => s.setOnboarded)
  const setShowTour = useWorkerStore((s) => s.setShowTour)
  const payouts = useClaimStore((s) => s.payouts)
  const w = worker || {
    name: 'Ravi Kumar', riskScore: 0.82, riskTier: 'LOW',
    premium: 58, coverageCap: 600, weekStart: '2026-03-21', weekEnd: '2026-03-27',
    policyStatus: 'ACTIVE',
  }

  const [showAlert, setShowAlert] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowAlert(true), 800)
    return () => clearTimeout(timer)
  }, [])

  // Show welcome modal for first-time users
  useEffect(() => {
    if (!onboarded) {
      const t = setTimeout(() => setShowWelcome(true), 500)
      return () => clearTimeout(t)
    }
  }, [onboarded])

  useEffect(() => {
    if (showAlert && Notification.permission === 'granted') {
      new Notification('GuidePay Alert', {
        body: '78% flood risk tomorrow in your zone. Coverage auto-extended.',
        icon: '/favicon.ico',
      })
    }
  }, [showAlert])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const firstName = w.name?.split(' ')[0] || 'Ravi'

  const stats = [
    { label: 'PROTECTED', value: '₹1,200', sub: '2 events this month', valueColor: '#D97757' },
    { label: 'PREMIUMS PAID', value: '₹232', sub: 'Since Mar 4', valueColor: '#0F0F0F' },
    { label: 'RISK SCORE', value: `${w.riskScore}`, sub: `Low · ₹7 discount`, valueColor: '#12B76A' },
    { label: 'NEXT RENEWAL', value: 'Mar 27', sub: '₹58 due', valueColor: '#0F0F0F' },
  ]

  return (
    <motion.div
      className="min-h-screen pb-24"
      style={{ background: 'var(--bg-primary)' }}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <div className="px-4 pt-12 pb-0" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-body" style={{ color: 'var(--text-secondary)' }}>{greeting()} 👋</p>
            <h1 className="font-display font-bold text-[24px] mt-0.5" style={{ color: 'var(--text-primary)' }}>{firstName}</h1>
          </div>
          <div
            className="w-9 h-9 rounded-full bg-brand flex items-center justify-center cursor-pointer"
            onClick={() => navigate('/profile')}
          >
            <span className="font-display font-bold text-[13px] text-white">
              {firstName[0]}{w.name?.split(' ')[1]?.[0] || 'K'}
            </span>
          </div>
        </div>
      </div>

      <motion.div variants={stagger} animate="animate" className="px-4 mt-3 flex flex-col gap-3">
        {/* Buy coverage CTA */}
        {!activePolicy && (
          <motion.div variants={fadeUp}>
            <div
              className="rounded-card p-5"
              style={{
                background: 'linear-gradient(135deg, #D97757, #B85C3A)',
                boxShadow: '0 8px 32px rgba(217,119,87,0.35)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span style={{ fontSize: 24 }}>🛡️</span>
                <p style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.8)', letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0 }}>
                  No active coverage
                </p>
              </div>
              <h2 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 26, fontWeight: 800, color: 'white', margin: '0 0 8px', letterSpacing: -0.5 }}>
                Get protected for ₹49/week
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif', margin: '0 0 18px', lineHeight: 1.5 }}>
                Floods, outages, curfews — auto-paid to your UPI in under 2 hours.
              </p>
              <motion.button
                onClick={() => navigate('/coverage')}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                  background: 'white', color: '#D97757',
                  fontSize: 15, fontWeight: 700, fontFamily: 'Inter, sans-serif',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                View coverage plans →
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Policy card */}
        <motion.div variants={fadeUp}>
          <div id="policy-hero-card" className="rounded-card p-5" style={{ background: 'var(--bg-card)', boxShadow: '0 10px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <LiveDot status="active" />
                <span className="text-[10px] font-bold font-body tracking-[1px] uppercase" style={{ color: 'var(--text-tertiary)' }}>
                  Active
                </span>
              </div>
              <span className="text-[12px] font-body" style={{ color: 'var(--text-tertiary)' }}>Mar 21 – 27</span>
            </div>
            <div className="font-display font-extrabold text-[44px] tracking-[-2px] leading-none mt-1" style={{ color: 'var(--text-primary)' }}>
              ₹600
            </div>
            <p className="text-[13px] font-body" style={{ color: 'var(--text-secondary)' }}>coverage this week</p>
            <div className="h-px my-3.5" style={{ background: 'var(--border-light)' }} />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] font-body" style={{ color: 'var(--text-secondary)' }}>Next premium</p>
                <p className="text-[13px] font-semibold font-body mt-0.5" style={{ color: 'var(--text-primary)' }}>
                  Mar 27 · ₹{w.premium}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[12px] font-body" style={{ color: 'var(--text-secondary)' }}>Risk score</p>
                <p className="text-[13px] font-semibold font-body text-success mt-0.5">
                  {w.riskScore} LOW
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Animated alert banner */}
        <AnimatePresence>
          {showAlert && (
            <motion.div
              id="alert-banner"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ background: 'linear-gradient(135deg, #F79009, #D97757)', overflow: 'hidden', borderRadius: 14 }}
            >
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>⚠️</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Inter, sans-serif', color: 'white', margin: '0 0 2px' }}>
                    78% flood risk tomorrow
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter, sans-serif', margin: 0 }}>
                    Kondapur zone · Coverage auto-extended
                  </p>
                </div>
                <button
                  onClick={() => setShowAlert(false)}
                  style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 999, width: 28, height: 28, cursor: 'pointer', color: 'white', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={14} color="white" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats grid */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-card shadow-card p-3.5" style={{ background: 'var(--bg-card)' }}>
              <p className="text-[11px] font-medium font-body tracking-[0.5px] uppercase" style={{ color: 'var(--text-tertiary)' }}>
                {stat.label}
              </p>
              <p
                className="font-display font-bold text-[22px] mt-1 leading-tight"
                style={{ color: stat.valueColor === '#0F0F0F' ? 'var(--text-primary)' : stat.valueColor }}
              >
                {stat.value}
              </p>
              <p className="text-[12px] font-body mt-0.5" style={{ color: 'var(--text-secondary)' }}>{stat.sub}</p>
            </div>
          ))}
        </motion.div>

        {/* Zone status */}
        <motion.div variants={fadeUp}>
          <p className="text-[14px] font-semibold font-body mb-2" style={{ color: 'var(--text-primary)' }}>Zone status</p>
          <div id="zone-status-card" className="rounded-card shadow-card overflow-hidden" style={{ background: 'var(--bg-card)' }}>
            {[
              { icon: '🌊', label: 'Flood alert', badge: 'Clear', variant: 'success' },
              { icon: '📱', label: 'Zepto', badge: 'Normal', variant: 'success' },
              { icon: '🚫', label: 'Curfew', badge: 'None', variant: 'success' },
              { icon: '🤖', label: 'Tomorrow', badge: '78% risk', variant: 'warning' },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border-light)' : 'none' }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[16px]">{row.icon}</span>
                  <span className="text-[14px] font-body" style={{ color: 'var(--text-primary)' }}>{row.label}</span>
                </div>
                <Badge variant={row.variant}>{row.badge}</Badge>
              </div>
            ))}
            <div className="flex items-center gap-2 px-4 py-2.5">
              <LiveDot status="active" />
              <span className="text-[12px] font-body" style={{ color: 'var(--text-tertiary)' }}>
                847 checks done · Last 3 min ago
              </span>
            </div>
          </div>
        </motion.div>

        {/* Recent payouts */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[14px] font-semibold font-body" style={{ color: 'var(--text-primary)' }}>Recent payouts</p>
            <button className="text-[13px] text-brand font-semibold font-body" onClick={() => navigate('/claims')}>See all</button>
          </div>
          <div className="rounded-card shadow-card overflow-hidden" style={{ background: 'var(--bg-card)' }}>
            {payouts.slice(0, 2).map((payout, i) => (
              <motion.button
                key={payout.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/claim/cl-001')}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                style={{ borderBottom: i < 1 ? '1px solid var(--border-light)' : 'none' }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[16px]">
                      {payout.type === 'FLOOD' ? '🌊' : '📱'}
                    </span>
                    <p className="text-[14px] font-medium font-body" style={{ color: 'var(--text-primary)' }}>
                      {payout.event}
                    </p>
                  </div>
                  <p className="text-[12px] font-body mt-0.5 pl-7" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(payout.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display font-bold text-[16px] text-success">
                    +{formatINR(payout.amount)}
                  </p>
                  <Badge variant="success">Paid</Badge>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Tour button — floating above chat button */}
      <motion.button
        id="tour-btn"
        onClick={() => setShowTour(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        style={{
          position: 'fixed',
          bottom: 148,
          right: 16,
          zIndex: 90,
          width: 44, height: 44,
          borderRadius: 999,
          background: '#0F0F0F',
          border: '2px solid rgba(255,255,255,0.1)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}
        title="Take app tour"
      >
        <span style={{ fontSize: 18 }}>🗺️</span>
      </motion.button>

      <ChatWidget />

      {/* Welcome modal for first-time users */}
      <AnimatePresence>
        {showWelcome && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowWelcome(false); setOnboarded(true) }}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 9000,
                backdropFilter: 'blur(4px)',
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed',
                zIndex: 9001,
                bottom: 24, left: 16, right: 16,
                maxWidth: 380,
                margin: '0 auto',
                background: 'white',
                borderRadius: 20,
                padding: 24,
                boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>🛡️</div>
              <h2 style={{
                fontFamily: 'Bricolage Grotesque',
                fontSize: 22, fontWeight: 800,
                color: '#0F0F0F', margin: '0 0 8px',
              }}>
                Welcome to GuidePay!
              </h2>
              <p style={{
                fontSize: 14, fontFamily: 'Inter',
                color: '#6B6B6B', lineHeight: 1.6,
                margin: '0 0 6px',
              }}>
                Hey {firstName} 👋 You're all set up!
              </p>
              <p style={{
                fontSize: 13, fontFamily: 'Inter',
                color: '#9B9B9B', lineHeight: 1.5,
                margin: '0 0 20px',
              }}>
                Income protection for floods, outages, and curfews. Get covered for as low as ₹49/week.
              </p>

              <div style={{
                display: 'flex', flexDirection: 'column', gap: 8,
              }}>
                <motion.button
                  onClick={() => {
                    setShowWelcome(false)
                    setOnboarded(true)
                    navigate('/coverage')
                  }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: '100%', padding: '13px',
                    borderRadius: 12, border: 'none',
                    background: 'linear-gradient(135deg, #D97757, #B85C3A)',
                    color: 'white', fontSize: 15,
                    fontWeight: 700, fontFamily: 'Inter',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(217,119,87,0.35)',
                  }}
                >
                  View coverage plans →
                </motion.button>
                <motion.button
                  onClick={() => {
                    setShowWelcome(false)
                    setOnboarded(true)
                    setShowTour(true)
                  }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: '100%', padding: '12px',
                    borderRadius: 12,
                    border: '1px solid #E4E4E7',
                    background: 'white',
                    color: '#0F0F0F', fontSize: 14,
                    fontWeight: 600, fontFamily: 'Inter',
                    cursor: 'pointer',
                  }}
                >
                  Take a quick tour 🗺️
                </motion.button>
                <button
                  onClick={() => { setShowWelcome(false); setOnboarded(true) }}
                  style={{
                    background: 'none', border: 'none',
                    color: '#9B9B9B', fontSize: 13,
                    fontFamily: 'Inter', cursor: 'pointer',
                    padding: '6px',
                  }}
                >
                  Skip for now
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
