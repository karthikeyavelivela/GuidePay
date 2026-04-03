import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BrainCircuit } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import { getAdminStats, getZoneForecast, simulateTrigger } from '../../services/api'
import { formatINRShort } from '../../utils/formatters'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [forecastRows, setForecastRows] = useState([])
  const [simCity, setSimCity] = useState('Hyderabad')
  const [simType, setSimType] = useState('FLOOD')
  const [simulating, setSimulating] = useState(false)
  const [simResult, setSimResult] = useState(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getAdminStats()
        setStats(data)
      } catch {
        setStats(null)
      } finally {
        setLoading(false)
      }
    }

    const loadForecast = async () => {
      try {
        const data = await getZoneForecast()
        setForecastRows(data?.forecasts || [])
      } catch {}
    }

    loadStats()
    loadForecast()
  }, [])

  const handleSimulate = async () => {
    setSimulating(true)
    setSimResult(null)
    try {
      const result = await simulateTrigger(simCity, simType)
      setSimResult({
        success: true,
        message: result?.message || `${simType} trigger fired in ${simCity}`,
      })
      const refreshedStats = await getAdminStats().catch(() => null)
      if (refreshedStats) setStats(refreshedStats)
    } catch (error) {
      setSimResult({
        success: false,
        message: error?.detail || error?.message || 'Trigger simulation failed',
      })
    } finally {
      setSimulating(false)
      setTimeout(() => setSimResult(null), 5000)
    }
  }

  const kpis = [
    { label: 'Active Policies', value: (stats?.active_policies || 0).toLocaleString('en-IN'), sub: 'Total insured', color: '#12B76A' },
    { label: 'Weekly Revenue', value: formatINRShort(stats?.weekly_revenue || 0), sub: `Rs${(stats?.weekly_revenue || 0).toLocaleString('en-IN')} collected`, color: '#D97757' },
    { label: 'Payouts', value: formatINRShort(stats?.weekly_payouts || 0), sub: 'This week', color: '#F79009' },
    { label: 'Loss Ratio', value: `${Math.round((stats?.loss_ratio || 0) * 100)}%`, sub: 'Target up to 65%', color: '#12B76A' },
  ]

  return (
    <motion.div className="min-h-screen bg-grey-50 pb-8" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="mt-3 flex flex-col gap-3">
        <div className="px-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="flex-shrink-0 bg-white rounded-card shadow-card p-3.5" style={{ minWidth: 140 }}>
                <p className="text-[11px] font-medium font-body text-[#9B9B9B] uppercase tracking-[1px]">{kpi.label}</p>
                <p className="font-display font-bold text-[26px] mt-1 leading-tight" style={{ color: kpi.color }}>{loading ? '...' : kpi.value}</p>
                <p className="text-[12px] text-[#6B6B6B] font-body mt-0.5">{kpi.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ margin: '0 16px', background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 20 }}>
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontFamily: 'Bricolage Grotesque', fontSize: 15, fontWeight: 700, color: 'white', margin: '0 0 3px' }}>Fire trigger</p>
            <p style={{ fontSize: 12, fontFamily: 'Inter', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              Creates a trigger event and processes real backend claims for active policies.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={simCity} onChange={(e) => setSimCity(e.target.value)} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 12px', color: 'white', fontSize: 13, fontFamily: 'Inter', outline: 'none', cursor: 'pointer' }}>
              {['Hyderabad', 'Mumbai', 'Chennai', 'Bengaluru', 'Delhi'].map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
            <select value={simType} onChange={(e) => setSimType(e.target.value)} style={{ background: '#111', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '8px 12px', color: 'white', fontSize: 13, fontFamily: 'Inter', outline: 'none', cursor: 'pointer' }}>
              <option value="FLOOD">Flood Alert</option>
              <option value="OUTAGE">Platform Outage</option>
              <option value="CURFEW">Government Curfew</option>
            </select>
            <motion.button onClick={handleSimulate} disabled={simulating} whileTap={{ scale: 0.97 }} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: simulating ? '#333' : '#D97757', color: simulating ? 'rgba(255,255,255,0.4)' : 'white', fontSize: 13, fontWeight: 700, fontFamily: 'Inter', cursor: simulating ? 'not-allowed' : 'pointer' }}>
              {simulating ? 'Simulating...' : 'Fire Trigger'}
            </motion.button>
            {simResult && (
              <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} style={{ background: simResult.success ? 'rgba(18,183,106,0.1)' : 'rgba(240,68,56,0.1)', border: simResult.success ? '1px solid rgba(18,183,106,0.25)' : '1px solid rgba(240,68,56,0.25)', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontFamily: 'Inter', color: simResult.success ? '#12B76A' : '#F04438' }}>
                {simResult.message}
              </motion.div>
            )}
          </div>
        </div>

        <div className="mx-4 bg-white rounded-card shadow-card p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[14px] font-semibold font-body text-[#0F0F0F]">Loss ratio</span>
            <span className="text-[12px] text-[#9B9B9B] font-body">Target up to 65%</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-display font-extrabold text-[40px] text-success leading-none">{loading ? '...' : `${Math.round((stats?.loss_ratio || 0) * 100)}%`}</span>
            <Badge variant={(stats?.loss_ratio || 0) <= 0.65 ? 'success' : 'danger'}>
              {(stats?.loss_ratio || 0) <= 0.65 ? 'Healthy' : 'Over target'}
            </Badge>
          </div>
          <div className="h-1.5 bg-grey-100 rounded-full overflow-hidden">
            <motion.div className="h-full bg-success rounded-full" initial={{ width: 0 }} animate={{ width: `${Math.min(Math.round((stats?.loss_ratio || 0) * 100), 100)}%` }} transition={{ type: 'spring', stiffness: 60, damping: 15, delay: 0.3 }} />
          </div>
        </div>

        <div className="mx-4 bg-white rounded-card shadow-card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3.5 border-b border-grey-100">
            <BrainCircuit size={16} className="text-brand" />
            <span className="text-[14px] font-semibold font-body text-[#0F0F0F]">7-Day AI Forecast</span>
          </div>
          {forecastRows.map((row) => {
            const risk = row.flood_probability_percent || 0
            const exposure = ((row.workers_in_zone || 0) * 600 * ((row.flood_probability_24h || 0))).toLocaleString('en-IN', { maximumFractionDigits: 0 })
            return (
              <div key={row.zone} className="px-4 py-3 border-b border-grey-50">
                <div className="flex items-center justify-between">
                  <p className="text-[15px] font-semibold font-body text-[#0F0F0F]">{row.city}</p>
                  <p className="text-[13px] font-body text-[#6B6B6B]">{row.workers_in_zone || 0} workers</p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1 bg-grey-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${risk}%`, backgroundColor: risk > 60 ? '#F04438' : risk > 30 ? '#F79009' : '#12B76A' }} />
                  </div>
                  <span className="text-[12px] font-body text-[#6B6B6B]">{risk}% risk · Rs{exposure} exposure</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mx-4 bg-white rounded-card shadow-card overflow-hidden">
          <div className="px-4 py-3.5 border-b border-grey-100">
            <span className="text-[14px] font-semibold font-body text-[#0F0F0F]">Active triggers</span>
          </div>
          {stats?.active_triggers?.length ? stats.active_triggers.map((event) => (
            <div key={event._id} className="px-4 py-3 border-b border-grey-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-semibold font-body text-[#0F0F0F]">{event.city} - {event.trigger_type}</p>
                  <p className="text-[12px] text-[#6B6B6B] font-body mt-0.5">{event.claims_count || 0}/{event.affected_workers || 0} workers · {event.severity}</p>
                </div>
                <Badge variant="info">{event.confirmation_status || 'ACTIVE'}</Badge>
              </div>
            </div>
          )) : (
            <div className="px-4 py-6 text-center">
              <p className="text-[13px] text-[#9B9B9B] font-body">No active triggers</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
