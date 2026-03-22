import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, AlertTriangle, X } from 'lucide-react'
import BottomNav from '../../components/ui/BottomNav'
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
  const payouts = useClaimStore((s) => s.payouts)
  const w = worker || {
    name: 'Ravi Kumar', riskScore: 0.82, riskTier: 'LOW',
    premium: 58, coverageCap: 600, weekStart: '2026-03-21', weekEnd: '2026-03-27',
    policyStatus: 'ACTIVE',
  }

  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    // Show alert banner for high risk — simulate forecast check
    const timer = setTimeout(() => setShowAlert(true), 800)
    return () => clearTimeout(timer)
  }, [])

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
          <div className="flex items-center gap-3">
            <button className="relative w-10 h-10 flex items-center justify-center">
              <Bell size={22} style={{ color: 'var(--text-primary)' }} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center">
              <span className="font-display font-bold text-[13px] text-white">
                {firstName[0]}{w.name?.split(' ')[1]?.[0] || 'K'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <motion.div variants={stagger} animate="animate" className="px-4 mt-3 flex flex-col gap-3">
        {/* Policy card */}
        <motion.div variants={fadeUp}>
          <div className="rounded-card p-5" style={{ background: 'var(--bg-card)', boxShadow: '0 10px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)' }}>
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
          <div className="rounded-card shadow-card overflow-hidden" style={{ background: 'var(--bg-card)' }}>
            {[
              { icon: '🌊', label: 'Flood alert',  badge: 'Clear',      variant: 'success' },
              { icon: '📱', label: 'Zepto',         badge: 'Normal',     variant: 'success' },
              { icon: '🚫', label: 'Curfew',        badge: 'None',       variant: 'success' },
              { icon: '🤖', label: 'Tomorrow',      badge: '78% risk',   variant: 'warning' },
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
            <button className="text-[13px] text-brand font-semibold font-body">See all</button>
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

      <ChatWidget />
      <BottomNav />
    </motion.div>
  )
}
