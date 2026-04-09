import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import TopBar from '../../components/ui/TopBar'
import { getAdminAnalytics } from '../../services/api'

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

const DEMO_PREMIUM_PAYOUT = [
  { week: 'W1', premium: 54321, payout: 19200 },
  { week: 'W2', premium: 51200, payout: 22400 },
  { week: 'W3', premium: 58000, payout: 15600 },
  { week: 'W4', premium: 54321, payout: 33000 },
]

const DEMO_LOSS_RATIO = [
  { week: 'W1', ratio: 35, target: 65 },
  { week: 'W2', ratio: 44, target: 65 },
  { week: 'W3', ratio: 27, target: 65 },
  { week: 'W4', ratio: 61, target: 65 },
]

const DEMO_ZONE_RISK = [
  { city: 'Hyderabad', risk: 78 },
  { city: 'Mumbai',    risk: 54 },
  { city: 'Bengaluru', risk: 12 },
  { city: 'Delhi',     risk: 35 },
]

const DEMO_PAYOUT_FREQ = [
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
  const [premiumPayoutData, setPremiumPayoutData] = useState(DEMO_PREMIUM_PAYOUT)
  const [lossRatioData, setLossRatioData] = useState(DEMO_LOSS_RATIO)
  const [zoneRiskData, setZoneRiskData] = useState(DEMO_ZONE_RISK)
  const [payoutFreqData, setPayoutFreqData] = useState(DEMO_PAYOUT_FREQ)
  const [usingDemo, setUsingDemo] = useState(true)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState(30)

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const json = await getAdminAnalytics(period)

      const hasRealRevenue = json.daily_revenue?.some(d => d.amount > 0)
      const hasRealPayouts = json.daily_payouts?.some(d => d.amount > 0)

      if (hasRealRevenue || hasRealPayouts) {
        // Group daily_revenue by week index (4 buckets)
        const revByWeek = [0, 0, 0, 0]
        const payByWeek = [0, 0, 0, 0]
        json.daily_revenue?.forEach((d, i) => { revByWeek[Math.min(3, Math.floor(i / 7))] += d.amount })
        json.daily_payouts?.forEach((d, i) => { payByWeek[Math.min(3, Math.floor(i / 7))] += d.amount })
        setPremiumPayoutData([
          { week: 'W1', premium: revByWeek[0], payout: payByWeek[0] },
          { week: 'W2', premium: revByWeek[1], payout: payByWeek[1] },
          { week: 'W3', premium: revByWeek[2], payout: payByWeek[2] },
          { week: 'W4', premium: revByWeek[3], payout: payByWeek[3] },
        ])

        // Loss ratio by week
        const lossData = [0, 1, 2, 3].map(i => {
          const rev = revByWeek[i]
          const pay = payByWeek[i]
          return {
            week: `W${i + 1}`,
            ratio: rev > 0 ? Math.round((pay / rev) * 100) : 0,
            target: 65,
          }
        })
        setLossRatioData(lossData)

        // Payout frequency by day-of-week
        const freqMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 }
        json.daily_payouts?.forEach(d => {
          const dayIdx = new Date(d._id).getDay()
          const dayLabel = DAY_LABELS[dayIdx]
          if (freqMap[dayLabel] !== undefined) freqMap[dayLabel] += d.count
        })
        setPayoutFreqData(Object.entries(freqMap).map(([day, payouts]) => ({ day, payouts })))

        setUsingDemo(false)
      } else {
        // No real data — keep demo data, set flag
        setUsingDemo(true)
      }

      // Plan breakdown → zone risk proxy (use plan names as "zones")
      if (json.plan_breakdown?.length > 0) {
        const total = json.plan_breakdown.reduce((s, p) => s + p.count, 0)
        setZoneRiskData(json.plan_breakdown.map(p => ({
          city: p.label || p._id,
          risk: total > 0 ? Math.round((p.count / total) * 100) : 0,
        })))
      }
    } catch (e) {
      console.error('[Analytics] fetch failed, using demo data:', e.message)
      setUsingDemo(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="min-h-screen bg-grey-50 pb-24"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <TopBar title="Analytics" bgClass="bg-grey-50" />

      {/* Demo badge + period selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 4px' }}>
        {usingDemo ? (
          <span style={{
            fontSize: 11, fontWeight: 700, fontFamily: 'Inter',
            color: '#F79009', background: 'rgba(247,144,9,0.1)',
            padding: '3px 10px', borderRadius: 999,
            border: '1px solid rgba(247,144,9,0.2)',
          }}>
            DEMO DATA — No real transactions yet
          </span>
        ) : <span />}
        <div style={{ display: 'flex', gap: 6 }}>
          {[7, 14, 30].map(d => (
            <button
              key={d}
              onClick={() => setPeriod(d)}
              style={{
                padding: '4px 12px', borderRadius: 8,
                border: '1px solid #E4E4E7',
                background: period === d ? '#D97757' : 'white',
                color: period === d ? 'white' : '#6B6B6B',
                fontSize: 11, fontWeight: 700, fontFamily: 'Inter',
                cursor: 'pointer',
              }}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{
            width: 28, height: 28,
            border: '3px solid #E4E4E7',
            borderTopColor: '#D97757',
            borderRadius: 999,
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {/* Chart 1: Premium vs Payouts */}
          <ChartCard title="Premium vs Payouts">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={premiumPayoutData} barGap={4}>
                <CartesianGrid stroke="#F0F0F2" strokeDasharray="none" vertical={false} />
                <XAxis dataKey="week" {...axisStyle} axisLine={false} tickLine={false} />
                <YAxis {...axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip {...tooltipStyle} formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, '']} />
                <Bar dataKey="premium" fill="#D97757" radius={[4, 4, 0, 0]} name="Premium" />
                <Bar dataKey="payout"  fill="#2E90FA" radius={[4, 4, 0, 0]} name="Payouts" />
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 10 }}>
              {[
                { color: '#D97757', label: 'Premium collected' },
                { color: '#2E90FA', label: 'Payouts made' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 3, background: l.color, borderRadius: 2 }} />
                  <span style={{ fontSize: 11, fontFamily: 'Inter', color: '#9B9B9B' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Chart 2: Loss ratio trend */}
          <ChartCard title="Loss Ratio Trend">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={lossRatioData}>
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

          {/* Chart 3: Zone risk / plan distribution */}
          <ChartCard title={usingDemo ? 'Zone Risk' : 'Plan Distribution'}>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={zoneRiskData} layout="vertical" barSize={20}>
                <CartesianGrid stroke="#F0F0F2" strokeDasharray="none" horizontal={false} />
                <XAxis type="number" {...axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="city" {...axisStyle} axisLine={false} tickLine={false} width={70} />
                <Tooltip {...tooltipStyle} formatter={(v) => [`${v}%`, usingDemo ? 'Risk' : 'Share']} />
                <Bar dataKey="risk" fill="#D97757" radius={[0, 4, 4, 0]} name={usingDemo ? 'Risk %' : 'Share %'} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Chart 4: Payout frequency */}
          <ChartCard title="Payout Frequency">
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={payoutFreqData}>
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
      )}

      <AdminBottomNav active="analytics" />
    </motion.div>
  )
}
