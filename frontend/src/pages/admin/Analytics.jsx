import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import TopBar from '../../components/ui/TopBar'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
}

const ADMIN_TABS = [
  { id: 'overview',  label: 'Overview',  path: '/admin' },
  { id: 'claims',    label: 'Claims',    path: '/admin/claims' },
  { id: 'analytics', label: 'Analytics', path: '/admin/analytics' },
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
            className={`flex-1 flex items-center justify-center text-[13px] font-semibold font-body transition-colors ${active === tab.id ? 'text-brand border-t-2 border-brand' : 'text-grey-400'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

const tooltipStyle = {
  contentStyle: {
    background: '#fff',
    border: '1px solid #E4E4E7',
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    fontFamily: 'Inter',
    fontSize: 13,
  },
}

const axisStyle = {
  tick: { fill: '#9B9B9B', fontSize: 11, fontFamily: 'Inter' },
  stroke: '#E4E4E7',
}

const PREMIUM_PAYOUT_DATA = [
  { week: 'W1', premium: 54321, payout: 19200 },
  { week: 'W2', premium: 51200, payout: 22400 },
  { week: 'W3', premium: 58000, payout: 15600 },
  { week: 'W4', premium: 54321, payout: 33000 },
]

const LOSS_RATIO_DATA = [
  { week: 'W1', ratio: 35, target: 65 },
  { week: 'W2', ratio: 44, target: 65 },
  { week: 'W3', ratio: 27, target: 65 },
  { week: 'W4', ratio: 61, target: 65 },
]

const ZONE_RISK_DATA = [
  { city: 'Hyderabad', risk: 78 },
  { city: 'Mumbai',    risk: 54 },
  { city: 'Bengaluru', risk: 12 },
  { city: 'Delhi',     risk: 35 },
]

const PAYOUT_FREQ_DATA = [
  { day: 'Mon', payouts: 2 },
  { day: 'Tue', payouts: 5 },
  { day: 'Wed', payouts: 1 },
  { day: 'Thu', payouts: 8 },
  { day: 'Fri', payouts: 3 },
  { day: 'Sat', payouts: 12 },
  { day: 'Sun', payouts: 6 },
]

function ChartCard({ title, children }) {
  return (
    <div className="mx-4 bg-white rounded-card shadow-card p-4">
      <p className="text-[14px] font-semibold font-body text-[#0F0F0F] mb-4">{title}</p>
      {children}
    </div>
  )
}

export default function Analytics() {
  return (
    <motion.div
      className="min-h-screen bg-grey-50 pb-24"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <TopBar title="Analytics" bgClass="bg-grey-50" />

      <div className="mt-3 flex flex-col gap-3">
        {/* Chart 1: Premium vs Payouts */}
        <ChartCard title="Premium vs Payouts">
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={PREMIUM_PAYOUT_DATA} barGap={4}>
              <CartesianGrid stroke="#F0F0F2" strokeDasharray="none" vertical={false} />
              <XAxis dataKey="week" {...axisStyle} axisLine={false} tickLine={false} />
              <YAxis {...axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip {...tooltipStyle} formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, '']} />
              <Bar dataKey="premium" fill="#D97757" radius={[4, 4, 0, 0]} name="Premium" />
              <Bar dataKey="payout"  fill="#E4E4E7" radius={[4, 4, 0, 0]} name="Payouts" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 2: Loss ratio trend */}
        <ChartCard title="Loss Ratio Trend">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={LOSS_RATIO_DATA}>
              <CartesianGrid stroke="#F0F0F2" strokeDasharray="none" vertical={false} />
              <XAxis dataKey="week" {...axisStyle} axisLine={false} tickLine={false} />
              <YAxis {...axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip {...tooltipStyle} formatter={(v) => [`${v}%`, '']} />
              <Line
                type="monotone"
                dataKey="ratio"
                stroke="#D97757"
                strokeWidth={2}
                dot={{ fill: '#D97757', r: 4 }}
                name="Loss Ratio"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#C4C4C4"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 3: Zone risk */}
        <ChartCard title="Zone Risk">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={ZONE_RISK_DATA} layout="vertical" barSize={20}>
              <CartesianGrid stroke="#F0F0F2" strokeDasharray="none" horizontal={false} />
              <XAxis type="number" {...axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="city" {...axisStyle} axisLine={false} tickLine={false} width={70} />
              <Tooltip {...tooltipStyle} formatter={(v) => [`${v}%`, 'Risk']} />
              <Bar dataKey="risk" fill="#D97757" radius={[0, 4, 4, 0]} name="Risk %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Chart 4: Payout frequency */}
        <ChartCard title="Payout Frequency">
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={PAYOUT_FREQ_DATA}>
              <defs>
                <linearGradient id="payoutGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#D97757" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#D97757" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#F0F0F2" strokeDasharray="none" vertical={false} />
              <XAxis dataKey="day" {...axisStyle} axisLine={false} tickLine={false} />
              <YAxis {...axisStyle} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Area
                type="monotone"
                dataKey="payouts"
                stroke="#D97757"
                strokeWidth={1.5}
                fill="url(#payoutGrad)"
                name="Payouts"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <AdminBottomNav active="analytics" />
    </motion.div>
  )
}
