import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bell, AlertTriangle } from 'lucide-react'
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
      <div className="px-4 pt-12 pb-0 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-body text-[#6B6B6B]">{greeting()} 👋</p>
            <h1 className="font-display font-bold text-[24px] text-[#0F0F0F] mt-0.5">{firstName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-10 h-10 flex items-center justify-center">
              <Bell size={22} className="text-[#0F0F0F]" />
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
          <div className="bg-white rounded-card p-5" style={{ boxShadow: '0 10px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <LiveDot status="active" />
                <span className="text-[10px] font-bold font-body text-[#9B9B9B] tracking-[1px] uppercase">
                  Active
                </span>
              </div>
              <span className="text-[12px] text-[#9B9B9B] font-body">Mar 21 – 27</span>
            </div>
            <div className="font-display font-extrabold text-[44px] text-[#0F0F0F] tracking-[-2px] leading-none mt-1">
              ₹600
            </div>
            <p className="text-[13px] text-[#6B6B6B] font-body">coverage this week</p>
            <div className="h-px bg-grey-100 my-3.5" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] text-[#6B6B6B] font-body">Next premium</p>
                <p className="text-[13px] font-semibold font-body text-[#0F0F0F] mt-0.5">
                  Mar 27 · ₹{w.premium}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-[#6B6B6B] font-body">Risk score</p>
                <p className="text-[13px] font-semibold font-body text-success mt-0.5">
                  {w.riskScore} LOW
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Alert card */}
        <motion.div variants={fadeUp}>
          <div className="bg-warning-light border-l-[3px] border-warning rounded-r-card p-3.5">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-warning flex-shrink-0" />
              <p className="text-[14px] font-semibold font-body text-[#0F0F0F]">
                78% flood risk tomorrow
              </p>
            </div>
            <p className="text-[13px] text-[#6B6B6B] font-body mt-1 pl-6">
              Your coverage auto-extends. No action needed.
            </p>
          </div>
        </motion.div>

        {/* Stats grid */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 gap-2">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-card shadow-card p-3.5">
              <p className="text-[11px] font-medium font-body text-[#9B9B9B] tracking-[0.5px] uppercase">
                {stat.label}
              </p>
              <p
                className="font-display font-bold text-[22px] mt-1 leading-tight"
                style={{ color: stat.valueColor }}
              >
                {stat.value}
              </p>
              <p className="text-[12px] text-[#6B6B6B] font-body mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </motion.div>

        {/* Zone status */}
        <motion.div variants={fadeUp}>
          <p className="text-[14px] font-semibold font-body text-[#0F0F0F] mb-2">Zone status</p>
          <div className="bg-white rounded-card shadow-card overflow-hidden">
            {[
              { icon: '🌊', label: 'Flood alert',  badge: 'Clear',      variant: 'success' },
              { icon: '📱', label: 'Zepto',         badge: 'Normal',     variant: 'success' },
              { icon: '🚫', label: 'Curfew',        badge: 'None',       variant: 'success' },
              { icon: '🤖', label: 'Tomorrow',      badge: '78% risk',   variant: 'warning' },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                className={`flex items-center justify-between px-4 py-3 ${i < arr.length - 1 ? 'border-b border-grey-50' : ''}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[16px]">{row.icon}</span>
                  <span className="text-[14px] font-body text-[#0F0F0F]">{row.label}</span>
                </div>
                <Badge variant={row.variant}>{row.badge}</Badge>
              </div>
            ))}
            <div className="flex items-center gap-2 px-4 py-2.5">
              <LiveDot status="active" />
              <span className="text-[12px] text-[#9B9B9B] font-body">
                847 checks done · Last 3 min ago
              </span>
            </div>
          </div>
        </motion.div>

        {/* Recent payouts */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[14px] font-semibold font-body text-[#0F0F0F]">Recent payouts</p>
            <button className="text-[13px] text-brand font-semibold font-body">See all</button>
          </div>
          <div className="bg-white rounded-card shadow-card overflow-hidden">
            {payouts.slice(0, 2).map((payout, i) => (
              <motion.button
                key={payout.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/claim/cl-001')}
                className={`w-full flex items-center justify-between px-4 py-3.5 text-left ${i < 1 ? 'border-b border-grey-50' : ''}`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[16px]">
                      {payout.type === 'FLOOD' ? '🌊' : '📱'}
                    </span>
                    <p className="text-[14px] font-medium font-body text-[#0F0F0F]">
                      {payout.event}
                    </p>
                  </div>
                  <p className="text-[12px] text-[#6B6B6B] font-body mt-0.5 pl-7">
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
