import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Settings, BrainCircuit } from 'lucide-react'
import TopBar from '../../components/ui/TopBar'
import Badge from '../../components/ui/Badge'
import { MOCK_ADMIN } from '../../services/mockData'
import { formatINRShort } from '../../utils/formatters'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
}

const ADMIN_TABS = [
  { id: 'overview',   label: 'Overview',   path: '/admin' },
  { id: 'claims',     label: 'Claims',     path: '/admin/claims' },
  { id: 'analytics',  label: 'Analytics',  path: '/admin/analytics' },
]

function AdminBottomNav({ active }) {
  const navigate = useNavigate()
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white border-t border-grey-200">
      <div className="flex h-14">
        {ADMIN_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`
              flex-1 flex items-center justify-center text-[13px] font-semibold font-body transition-colors
              ${active === tab.id ? 'text-brand border-t-2 border-brand' : 'text-grey-400'}
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { stats, claimsQueue, events } = MOCK_ADMIN

  const kpis = [
    { label: 'Active Policies', value: stats.activePolicies.toLocaleString('en-IN'), sub: '+12 today', color: '#12B76A' },
    { label: 'Weekly Revenue',  value: formatINRShort(stats.weeklyRevenue), sub: `₹${stats.weeklyRevenue.toLocaleString('en-IN')} collected`, color: '#D97757' },
    { label: 'Payouts',         value: formatINRShort(stats.activePayouts), sub: '18 claims active', color: '#F79009' },
    { label: 'Loss Ratio',      value: `${stats.lossRatio}%`, sub: 'Target ≤65%', color: '#12B76A' },
  ]

  return (
    <motion.div
      className="min-h-screen bg-grey-50 pb-20"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <TopBar
        title="Admin · SentinelX"
        bgClass="bg-grey-50"
        rightAction={
          <button className="w-10 h-10 flex items-center justify-center">
            <Settings size={22} className="text-[#0F0F0F]" />
          </button>
        }
      />

      <div className="mt-3 flex flex-col gap-3">
        {/* KPI cards - horizontal scroll */}
        <div className="px-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {kpis.map((kpi) => (
              <div
                key={kpi.label}
                className="flex-shrink-0 bg-white rounded-card shadow-card p-3.5"
                style={{ minWidth: 140 }}
              >
                <p className="text-[11px] font-medium font-body text-[#9B9B9B] uppercase tracking-[1px]">
                  {kpi.label}
                </p>
                <p
                  className="font-display font-bold text-[26px] mt-1 leading-tight"
                  style={{ color: kpi.color }}
                >
                  {kpi.value}
                </p>
                <p className="text-[12px] text-[#6B6B6B] font-body mt-0.5">{kpi.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Loss ratio card */}
        <div className="mx-4 bg-white rounded-card shadow-card p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[14px] font-semibold font-body text-[#0F0F0F]">Loss ratio</span>
            <span className="text-[12px] text-[#9B9B9B] font-body">Target ≤65%</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-display font-extrabold text-[40px] text-success leading-none">
              {stats.lossRatio}%
            </span>
            <Badge variant="success">Healthy</Badge>
          </div>
          <div className="h-1.5 bg-grey-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-success rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${stats.lossRatio}%` }}
              transition={{ type: 'spring', stiffness: 60, damping: 15, delay: 0.3 }}
            />
          </div>
        </div>

        {/* AI forecast card */}
        <div className="mx-4 bg-white rounded-card shadow-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3.5 border-b border-grey-100">
            <BrainCircuit size={16} className="text-brand" />
            <span className="text-[14px] font-semibold font-body text-[#0F0F0F]">7-Day AI Forecast</span>
          </div>
          {[
            { city: 'Hyderabad', workers: '1,247', risk: 78,  claims: '18', exposure: '₹10,800' },
            { city: 'Mumbai',    workers: '843',   risk: 54,  claims: '11', exposure: '₹6,600' },
          ].map((row) => (
            <div key={row.city} className="px-4 py-3 border-b border-grey-50">
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-semibold font-body text-[#0F0F0F]">{row.city}</p>
                <p className="text-[13px] font-body text-[#6B6B6B]">{row.workers} workers</p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1 bg-grey-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${row.risk}%`, backgroundColor: row.risk > 60 ? '#F04438' : '#F79009' }}
                  />
                </div>
                <span className="text-[12px] font-body text-[#6B6B6B]">{row.claims} est. claims · {row.exposure}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Correlation card */}
        <div className="mx-4 bg-white rounded-card shadow-card overflow-hidden">
          <div className="px-4 py-3.5 border-b border-grey-100">
            <span className="text-[14px] font-semibold font-body text-[#0F0F0F]">Today's events</span>
          </div>
          {events.map((ev) => {
            const isAnomaly = ev.status === 'ANOMALY'
            return (
              <div
                key={ev.city}
                className={`px-4 py-3 border-b border-grey-50 ${isAnomaly ? 'bg-danger-light' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-semibold font-body text-[#0F0F0F]">
                      {ev.city} {ev.type}
                    </p>
                    <p className="text-[12px] text-[#6B6B6B] font-body mt-0.5">
                      {ev.claimed}/{ev.total} workers · {ev.correlation}% corr
                    </p>
                  </div>
                  <Badge variant={isAnomaly ? 'danger' : 'info'}>
                    {isAnomaly ? 'Anomaly' : 'Confirmed'}
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>

        {/* Claims queue preview */}
        <div className="mx-4 bg-white rounded-card shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-grey-100">
            <span className="text-[14px] font-semibold font-body text-[#0F0F0F]">Claims queue</span>
            <span className="bg-grey-50 text-grey-500 text-[12px] font-semibold font-body px-2 py-0.5 rounded-full">
              {claimsQueue.length}
            </span>
          </div>
          {claimsQueue.map((claim, i) => (
            <div
              key={claim.id}
              className={`flex items-center justify-between px-4 py-3 ${i < claimsQueue.length - 1 ? 'border-b border-grey-50' : ''}`}
            >
              <div>
                <p className="text-[14px] font-semibold font-body text-[#0F0F0F]">{claim.name}</p>
                <p className="text-[12px] text-[#6B6B6B] font-body mt-0.5">
                  {claim.type} · ₹{claim.amount}
                </p>
                {claim.flag && (
                  <p className="text-[11px] text-danger font-body mt-0.5">{claim.flag}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-[16px] text-[#0F0F0F]">
                  {claim.fraudScore}
                </p>
                <Badge variant={claim.status === 'AUTO_APPROVED' ? 'success' : 'danger'}>
                  {claim.status === 'AUTO_APPROVED' ? 'Auto' : 'Review'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AdminBottomNav active="overview" />
    </motion.div>
  )
}
