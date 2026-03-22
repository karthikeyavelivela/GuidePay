import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import TopBar from '../../components/ui/TopBar'
import Button from '../../components/ui/Button'
import { useWorkerStore } from '../../store/workerStore'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
}

const SCORE_ROWS = [
  { label: 'Delivery Activity', value: 0.88, color: '#12B76A' },
  { label: 'Claim History',     value: 0.90, color: '#12B76A' },
  { label: 'Fraud Risk',        value: 0.78, color: '#0F0F0F' },
  { label: 'Active Hours',      value: 0.72, color: '#F79009' },
]

function RingScore({ score }) {
  const radius = 54
  const circ = 2 * Math.PI * radius
  const offset = circ - (score * circ)

  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      <circle cx="80" cy="80" r={radius} fill="none" stroke="#F0F0F2" strokeWidth="10" />
      <motion.circle
        cx="80" cy="80" r={radius}
        fill="none"
        stroke="#12B76A"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ}
        animate={{ strokeDashoffset: offset }}
        transition={{ type: 'spring', stiffness: 60, damping: 15, delay: 0.3 }}
        transform="rotate(-90 80 80)"
      />
      <text x="80" y="74" textAnchor="middle" fontFamily="Bricolage Grotesque" fontSize="34" fontWeight="700" fill="#0F0F0F">
        {score}
      </text>
      <text x="80" y="92" textAnchor="middle" fontFamily="Inter" fontSize="10" fontWeight="600" fill="#12B76A" letterSpacing="1">
        LOW RISK
      </text>
    </svg>
  )
}

export default function RiskScore() {
  const navigate = useNavigate()
  const worker = useWorkerStore((s) => s.worker)
  const score = worker?.riskScore || 0.82

  return (
    <motion.div
      className="min-h-screen bg-white pb-28"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <TopBar title="Your risk score" showBack />

      {/* Progress */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <div className="flex-1 h-[3px] bg-grey-200 rounded-full overflow-hidden mr-3">
          <div className="h-full bg-brand rounded-full" style={{ width: '66%' }} />
        </div>
        <span className="text-[11px] text-[#9B9B9B] font-body flex-shrink-0">Step 2 of 3</span>
      </div>

      <div className="px-4 mt-4">
        {/* Hero ring card */}
        <div className="bg-white rounded-card shadow-card p-6 text-center">
          <div className="flex justify-center">
            <RingScore score={score} />
          </div>
          <h2 className="font-display font-bold text-[18px] text-[#0F0F0F] mt-2">
            Low Risk Worker
          </h2>
          <p className="font-body text-[14px] text-[#6B6B6B] mt-1">
            Your consistent activity earns you a ₹7/week discount
          </p>

          {/* Score breakdown */}
          <div className="mt-5 text-left">
            <p className="text-[13px] font-semibold font-body text-[#0F0F0F] mb-3">
              Score breakdown
            </p>
            <div className="flex flex-col gap-3">
              {SCORE_ROWS.map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="text-[14px] font-body text-[#0F0F0F] w-36 flex-shrink-0">
                    {row.label}
                  </span>
                  <div className="flex-1 h-1 bg-grey-100 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: row.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${row.value * 100}%` }}
                      transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.4 }}
                    />
                  </div>
                  <span
                    className="text-[13px] font-semibold font-body w-10 text-right flex-shrink-0"
                    style={{ color: row.color }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Signal card */}
        <div className="mt-4 border-l-[3px] border-success bg-success-light rounded-r-card px-3.5 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-success flex-shrink-0" />
            <p className="text-[14px] font-semibold font-body text-[#0F0F0F]">
              4 months of consistent activity
            </p>
          </div>
          <p className="text-[13px] text-[#6B6B6B] font-body mt-1 pl-6">
            2 claims in 6 months · No fraud flags
          </p>
        </div>
      </div>

      {/* Sticky bottom */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-grey-100 px-4 py-3 z-40">
        <Button onClick={() => navigate('/forecast')} fullWidth>
          See AI Disruption Forecast →
        </Button>
      </div>
    </motion.div>
  )
}
