import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BrainCircuit } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import { getAdminStats, getZoneForecast } from '../../services/api'
import { formatINRShort } from '../../utils/formatters'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
}

const DEMO_STATS = {
  active_policies: 634,
  total_workers: 847,
  weekly_revenue: 47770,
  weekly_payouts: 11700,
  loss_ratio: 0.245,
  claims_by_type: [
    { _id: 'FLOOD',  count: 21, total_amount: 12600 },
    { _id: 'OUTAGE', count: 7,  total_amount: 3150 },
    { _id: 'CURFEW', count: 3,  total_amount: 1800 },
  ],
  active_triggers: [],
}

const DEMO_FORECAST_ROWS = [
  { city: 'Hyderabad', workers: '312', risk: 78, claims: '11', exposure: '₹73,200' },
  { city: 'Mumbai',    workers: '241', risk: 54, claims: '8',  exposure: '₹43,200' },
  { city: 'Bengaluru', workers: '178', risk: 12, claims: '1',  exposure: '₹10,800' },
  { city: 'Chennai',   workers: '116', risk: 35, claims: '3',  exposure: '₹21,600' },
]

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [forecastRows, setForecastRows] = useState(DEMO_FORECAST_ROWS)
  const [simCity, setSimCity] = useState('Hyderabad')
  const [simType, setSimType] = useState('FLOOD')
  const [simulating, setSimulating] = useState(false)
  const [simResult, setSimResult] = useState(null)

  useEffect(() => {
    getAdminStats()
      .then(res => {
        const hasData = (res?.active_policies ?? 0) > 0 || (res?.total_workers ?? 0) > 0
        setData(hasData ? res : DEMO_STATS)
      })
      .catch(() => setData(DEMO_STATS))
      .finally(() => setLoading(false))

    getZoneForecast()
      .then(res => {
        if (res?.forecasts?.length > 0) {
          setForecastRows(res.forecasts.slice(0, 4).map(f => ({
            city: f.city,
            workers: String(f.workers_in_zone || 0),
            risk: Math.round(f.flood_probability_24h * 100),
            claims: String(Math.round(f.workers_in_zone * f.flood_probability_24h * 0.3) || 0),
            exposure: `₹${((f.workers_in_zone || 0) * 600 * f.flood_probability_24h).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
          })))
        }
      })
      .catch(() => {})
  }, [])

  const handleSimulate = async () => {
    setSimulating(true)
    setSimResult(null)
    try {
      const token = localStorage.getItem('gp-admin-auth') ? localStorage.getItem('gp-token') : null
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/admin/simulate-trigger`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({ city: simCity, trigger_type: simType }),
        }
      )
      const json = await res.json().catch(() => ({}))
      setSimResult({ success: true, message: `${simType} trigger fired in ${simCity} — ${json.claims_created ?? 'N'} claims created` })
    } catch {
      setSimResult({ success: true, message: `${simType} trigger simulated in ${simCity} (demo mode)` })
    }
    setSimulating(false)
    setTimeout(() => setSimResult(null), 5000)
  }

  const stats = {
    activePolicies: data?.active_policies ?? 0,
    weeklyRevenue: data?.weekly_revenue ?? 0,
    weeklyPayouts: data?.weekly_payouts ?? 0,
    lossRatio: data?.loss_ratio != null ? Math.round(data.loss_ratio * 100) : 0,
  }
  const claimsQueue = data?.claims_by_type ?? []
  const events = data?.active_triggers ?? []

  const kpis = [
    { label: 'Active Policies', value: stats.activePolicies.toLocaleString('en-IN'), sub: 'Total insured', color: '#12B76A' },
    { label: 'Weekly Revenue',  value: formatINRShort(stats.weeklyRevenue), sub: `₹${stats.weeklyRevenue.toLocaleString('en-IN')} collected`, color: '#D97757' },
    { label: 'Payouts',         value: formatINRShort(stats.weeklyPayouts), sub: 'This week', color: '#F79009' },
    { label: 'Loss Ratio',      value: `${stats.lossRatio}%`, sub: 'Target ≤65%', color: '#12B76A' },
  ]

  return (
    <motion.div
      className="min-h-screen bg-grey-50 pb-8"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >

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

        {/* Simulate Trigger Panel */}
        <div style={{
          margin: '0 16px',
          background: '#1A1A1A',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14, padding: 20,
        }}>
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontFamily: 'Bricolage Grotesque', fontSize: 15, fontWeight: 700, color: 'white', margin: '0 0 3px' }}>
              🎬 Demo: Fire Trigger
            </p>
            <p style={{ fontSize: 12, fontFamily: 'Inter', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              Creates a trigger event → auto-claims for active policy workers in zone
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={simCity} onChange={e => setSimCity(e.target.value)} style={{
              background: '#111', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, padding: '8px 12px', color: 'white',
              fontSize: 13, fontFamily: 'Inter', outline: 'none', cursor: 'pointer',
            }}>
              {['Hyderabad', 'Mumbai', 'Chennai', 'Bengaluru', 'Delhi'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select value={simType} onChange={e => setSimType(e.target.value)} style={{
              background: '#111', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, padding: '8px 12px', color: 'white',
              fontSize: 13, fontFamily: 'Inter', outline: 'none', cursor: 'pointer',
            }}>
              <option value="FLOOD">🌧️ Flood Alert</option>
              <option value="OUTAGE">⚡ Platform Outage</option>
              <option value="CURFEW">🚨 Govt Curfew</option>
            </select>
            <motion.button
              onClick={handleSimulate}
              disabled={simulating}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '9px 20px', borderRadius: 8, border: 'none',
                background: simulating ? '#333' : '#D97757',
                color: simulating ? 'rgba(255,255,255,0.4)' : 'white',
                fontSize: 13, fontWeight: 700, fontFamily: 'Inter',
                cursor: simulating ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {simulating ? (
                <>
                  <div style={{ width: 14, height: 14, border: '2px solid #666', borderTopColor: 'transparent', borderRadius: 999, animation: 'spin 0.8s linear infinite' }} />
                  Simulating...
                </>
              ) : 'Fire Trigger →'}
            </motion.button>
            {simResult && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  background: simResult.success ? 'rgba(18,183,106,0.1)' : 'rgba(240,68,56,0.1)',
                  border: simResult.success ? '1px solid rgba(18,183,106,0.25)' : '1px solid rgba(240,68,56,0.25)',
                  borderRadius: 8, padding: '8px 12px',
                  fontSize: 12, fontFamily: 'Inter',
                  color: simResult.success ? '#12B76A' : '#F04438',
                }}
              >
                {simResult.success ? '✓' : '✗'} {simResult.message}
              </motion.div>
            )}
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
              {loading ? '—' : `${stats.lossRatio}%`}
            </span>
            <Badge variant={stats.lossRatio <= 65 ? 'success' : 'danger'}>
              {stats.lossRatio <= 65 ? 'Healthy' : 'Over target'}
            </Badge>
          </div>
          <div className="h-1.5 bg-grey-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-success rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(stats.lossRatio, 100)}%` }}
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
          {(forecastRows.length > 0 ? forecastRows : [
            { city: 'Hyderabad', workers: '0', risk: 0, claims: '0', exposure: '₹0' },
          ]).map((row) => (
            <div key={row.city} className="px-4 py-3 border-b border-grey-50">
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-semibold font-body text-[#0F0F0F]">{row.city}</p>
                <p className="text-[13px] font-body text-[#6B6B6B]">{row.workers} workers</p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-1 bg-grey-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${row.risk}%`, backgroundColor: row.risk > 60 ? '#F04438' : row.risk > 30 ? '#F79009' : '#12B76A' }}
                  />
                </div>
                <span className="text-[12px] font-body text-[#6B6B6B]">{row.claims} est. claims · {row.exposure}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Active triggers */}
        <div className="mx-4 bg-white rounded-card shadow-card overflow-hidden">
          <div className="px-4 py-3.5 border-b border-grey-100">
            <span className="text-[14px] font-semibold font-body text-[#0F0F0F]">Active triggers</span>
          </div>
          {events.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-[13px] text-[#9B9B9B] font-body">No active triggers</p>
            </div>
          ) : events.map((ev) => (
            <div key={ev._id} className="px-4 py-3 border-b border-grey-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-semibold font-body text-[#0F0F0F]">
                    {ev.city} — {ev.trigger_type}
                  </p>
                  <p className="text-[12px] text-[#6B6B6B] font-body mt-0.5">
                    {ev.claims_count}/{ev.affected_workers} workers · {ev.severity}
                  </p>
                </div>
                <Badge variant="info">{ev.confirmation_status}</Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Claims by type */}
        <div className="mx-4 bg-white rounded-card shadow-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-grey-100">
            <span className="text-[14px] font-semibold font-body text-[#0F0F0F]">Claims by type</span>
            <span className="bg-grey-50 text-grey-500 text-[12px] font-semibold font-body px-2 py-0.5 rounded-full">
              {claimsQueue.length}
            </span>
          </div>
          {claimsQueue.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-[13px] text-[#9B9B9B] font-body">No claims yet</p>
            </div>
          ) : claimsQueue.map((row, i) => (
            <div
              key={row._id}
              className={`flex items-center justify-between px-4 py-3 ${i < claimsQueue.length - 1 ? 'border-b border-grey-50' : ''}`}
            >
              <div>
                <p className="text-[14px] font-semibold font-body text-[#0F0F0F]">{row._id}</p>
                <p className="text-[12px] text-[#6B6B6B] font-body mt-0.5">
                  {row.count} claims · ₹{row.total_amount?.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  )
}
