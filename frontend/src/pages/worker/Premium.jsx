import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import TopBar from '../../components/ui/TopBar'
import Button from '../../components/ui/Button'
import { useWorkerStore } from '../../store/workerStore'
import { getBreakdown } from '../../utils/premium'
import { useCountUp } from '../../hooks/useCountUp'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
}

export default function Premium() {
  const navigate = useNavigate()
  const worker = useWorkerStore((s) => s.worker)
  const zone = worker?.zone || 'kondapur-hyderabad'
  const score = worker?.riskScore || 0.82
  const bd = getBreakdown(zone, score)
  const animatedTotal = useCountUp(bd.total, 1000)

  const handleActivate = () => {
    // Razorpay integration
    if (window.Razorpay) {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_demo',
        amount: bd.total * 100,
        currency: 'INR',
        name: 'GuidePay',
        description: 'Weekly Income Protection',
        handler: () => navigate('/dashboard'),
        prefill: { contact: worker?.phone || '9876543210' },
        theme: { color: '#D97757' },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <motion.div
      className="min-h-screen bg-white pb-36"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <TopBar title="Your weekly premium" showBack />

      {/* Hero */}
      <div className="px-6 py-8 text-center">
        <p className="text-[11px] font-semibold font-body text-[#9B9B9B] tracking-[1.5px] uppercase mb-2">
          Weekly Premium
        </p>
        <div className="font-display font-extrabold text-[72px] text-[#0F0F0F] tracking-[-3px] leading-none">
          ₹{animatedTotal}
        </div>
        <p className="text-[14px] text-[#6B6B6B] font-body mt-2">
          per week · auto-renews Sundays
        </p>
        <div className="inline-block mt-3 bg-success-light rounded-pill px-3 py-1">
          <span className="text-[10px] font-semibold font-body text-success tracking-[1px] uppercase">
            Low Risk Discount Applied
          </span>
        </div>
      </div>

      <div className="px-4">
        {/* Breakdown card */}
        <div className="bg-white rounded-card shadow-card overflow-hidden mb-3">
          <div className="px-4 py-3.5 border-b border-grey-100">
            <p className="text-[14px] font-semibold font-body text-[#0F0F0F]">
              How it's calculated
            </p>
          </div>
          {[
            { label: 'Base premium',       value: `₹${bd.base}`,  color: '#0F0F0F' },
            { label: 'Flood zone',         value: `+₹${bd.zone}`, color: '#F04438' },
            { label: 'Zone adjustment',    value: '+₹2',          color: '#F79009' },
            { label: 'Risk score discount',value: `−₹${Math.abs(bd.worker)}`, color: '#12B76A' },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              className={`flex items-center justify-between px-4 py-3 ${i < arr.length - 1 ? 'border-b border-grey-50' : ''}`}
            >
              <span className="text-[14px] font-body text-[#0F0F0F]">{row.label}</span>
              <span
                className="font-display text-[14px] font-semibold"
                style={{ color: row.color }}
              >
                {row.value}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-3.5 bg-grey-50">
            <span className="text-[14px] font-semibold font-body text-[#0F0F0F]">Total / week</span>
            <span className="font-display text-[20px] font-bold text-[#0F0F0F]">₹{bd.total}</span>
          </div>
        </div>

        {/* Coverage card */}
        <div className="bg-white rounded-card shadow-card p-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] text-[#6B6B6B] font-body">Covered up to</span>
            <span className="font-display text-[18px] font-bold text-brand">₹600 / week</span>
          </div>
          <div className="h-px bg-grey-100 mb-3" />
          {[
            { icon: '🌊', label: 'Flood alerts',      payout: '₹600', pct: '100%', color: '#12B76A' },
            { icon: '📱', label: 'Platform outages',  payout: '₹450', pct: '75%',  color: '#6B6B6B' },
            { icon: '🚫', label: 'Curfews',           payout: '₹600', pct: '100%', color: '#12B76A' },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={16} className="text-brand" />
                <span className="text-[14px] font-body text-[#0F0F0F]">{row.label}</span>
              </div>
              <div className="text-right">
                <span className="text-[13px] font-semibold font-body" style={{ color: row.color }}>
                  {row.pct} ({row.payout})
                </span>
              </div>
            </div>
          ))}
          <p className="text-[12px] text-[#9B9B9B] font-body mt-3">
            Health, vehicle repairs and accidents not covered
          </p>
        </div>
      </div>

      {/* Sticky bottom */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-grey-100 px-4 py-4 z-40">
        <Button onClick={handleActivate} fullWidth>
          Activate for ₹{bd.total}/week →
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate('/zone')}
          fullWidth
          className="mt-2"
        >
          ← Change my zone
        </Button>
      </div>
    </motion.div>
  )
}
