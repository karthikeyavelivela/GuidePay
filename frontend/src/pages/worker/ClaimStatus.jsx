import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import TopBar from '../../components/ui/TopBar'
import Badge from '../../components/ui/Badge'
import BottomNav from '../../components/ui/BottomNav'
import ChatWidget from '../../components/chat/ChatWidget'
import { useClaimStore } from '../../store/claimStore'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
}

const FRAUD_CHECKS = [
  { label: 'GPS location verified',          result: 'In zone' },
  { label: 'Last active order confirmed',     result: '38 min ago' },
  { label: 'Platform activity checked',       result: 'Zepto active' },
  { label: 'Zone correlation calculated',     result: '84% workers' },
  { label: 'Historical pattern matched',      result: 'Normal' },
  { label: 'Claim frequency checked',         result: '2 in 6 months' },
  { label: 'Device fingerprint verified',     result: 'Consistent' },
]

function TimelineStep({ step, isLast }) {
  return (
    <div className={`relative flex gap-4 ${isLast ? '' : 'pb-5'}`}>
      {/* Vertical line */}
      {!isLast && (
        <div className="absolute left-[8px] top-5 bottom-0 w-px bg-grey-200" />
      )}

      {/* Dot */}
      <div className="flex-shrink-0 mt-0.5">
        {step.status === 'done' ? (
          <div className="w-[18px] h-[18px] rounded-full bg-success flex items-center justify-center">
            <Check size={10} strokeWidth={3} className="text-white" />
          </div>
        ) : step.status === 'active' ? (
          <div className="w-[18px] h-[18px] rounded-full bg-brand flex items-center justify-center">
            <motion.div
              className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : (
          <div className="w-[18px] h-[18px] rounded-full border-[1.5px] border-grey-300 bg-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-[14px] font-semibold font-body ${step.status === 'pending' ? 'text-[#9B9B9B]' : 'text-[#0F0F0F]'}`}>
          {step.label}
        </p>
        <p className="text-[13px] text-[#6B6B6B] font-body mt-0.5">{step.detail}</p>

        {/* Animated dots for active */}
        {step.status === 'active' && (
          <div className="flex gap-1 mt-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-brand"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ClaimStatus() {
  const { id } = useParams()
  const claim = useClaimStore((s) => s.activeClaim)
  const [fraudExpanded, setFraudExpanded] = useState(false)

  const c = claim || {
    refId: 'GP-RZP-20260321-0847',
    type: 'FLOOD',
    amount: 600,
    status: 'PROCESSING',
    triggeredAt: '2026-03-21T14:19:00',
    zone: 'Kondapur, Hyderabad',
    fraudScore: 0.04,
    steps: [
      { id: 1, label: 'Trigger verified',    detail: 'IMD Red Alert confirmed · 2:19 PM',   status: 'done' },
      { id: 2, label: 'You were working',    detail: 'Last order 38 min before trigger',      status: 'done' },
      { id: 3, label: '28 workers confirmed',detail: '84% of your zone affected',             status: 'done' },
      { id: 4, label: 'Fraud check passed',  detail: 'Score 0.04 · All checks clear',        status: 'done' },
      { id: 5, label: 'Payout processing',   detail: 'UPI transfer · Est. 90 minutes',       status: 'active' },
    ],
  }

  const statusBadge = c.status === 'PROCESSING'
    ? <Badge variant="warning">Processing</Badge>
    : <Badge variant="success">Approved</Badge>

  return (
    <motion.div
      className="min-h-screen bg-white pb-24"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <TopBar
        title={`← Claim #GP-0847`}
        showBack
        rightAction={statusBadge}
      />

      <div className="px-4 mt-4 flex flex-col gap-4">
        {/* Amount card */}
        <div className="bg-white rounded-card shadow-card p-5">
          <p className="text-[11px] font-semibold font-body text-[#9B9B9B] tracking-[1px] uppercase">
            {c.type} ALERT — {c.zone?.split(',')[0]?.toUpperCase()}
          </p>
          <div className="font-display font-extrabold text-[56px] text-[#0F0F0F] tracking-[-2px] leading-none mt-1">
            ₹{c.amount}
          </div>
          <p className="text-[13px] text-[#6B6B6B] font-body mt-1">
            {new Date(c.triggeredAt).toLocaleString('en-IN', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>

        {/* Timeline */}
        <div>
          <p className="text-[14px] font-semibold font-body text-[#0F0F0F] mb-4">
            Verification steps
          </p>
          <div className="pl-0">
            {c.steps.map((step, i) => (
              <TimelineStep key={step.id} step={step} isLast={i === c.steps.length - 1} />
            ))}
          </div>
        </div>

        {/* Fraud detail - expandable */}
        <div className="bg-white rounded-card shadow-card overflow-hidden">
          <button
            onClick={() => setFraudExpanded(!fraudExpanded)}
            className="w-full flex items-center justify-between px-4 py-3.5"
          >
            <span className="text-[14px] font-medium font-body text-[#0F0F0F]">
              Fraud verification
            </span>
            {fraudExpanded
              ? <ChevronUp size={16} className="text-grey-400" />
              : <ChevronDown size={16} className="text-grey-400" />
            }
          </button>

          <AnimatePresence>
            {fraudExpanded && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                {FRAUD_CHECKS.map((check, i) => (
                  <div
                    key={check.label}
                    className="flex items-center justify-between px-4 py-2.5 border-t border-grey-50"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-success flex-shrink-0" />
                      <span className="text-[13px] text-[#6B6B6B] font-body">{check.label}</span>
                    </div>
                    <span className="text-[13px] font-body text-[#6B6B6B]">{check.result}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 py-3 border-t border-grey-50">
                  <span className="text-[13px] font-body text-[#6B6B6B]">Fraud score</span>
                  <span className="text-[13px] font-semibold font-body text-success">
                    {c.fraudScore} — Auto approved
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ChatWidget />
      <BottomNav />
    </motion.div>
  )
}
