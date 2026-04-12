import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, Clock, ShieldCheck } from 'lucide-react'
import Button from '../../components/ui/Button'
import ChatWidget from '../../components/chat/ChatWidget'
import IndiaCalendar from '../../components/forecast/IndiaCalendar'
import { getMyZoneForecast, getTriggerTypes, getZoneForecast, getFeatureImportance, USE_MOCK } from '../../services/api'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
}

const riskColor = (pct) => (pct > 60 ? '#F04438' : pct >= 30 ? '#F79009' : '#12B76A')

export default function AIForecast() {
  const navigate = useNavigate()
  const [forecasts, setForecasts] = useState([])
  const [myForecast, setMyForecast] = useState(null)
  const [triggerTypes, setTriggerTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [featureImportance, setFeatureImportance] = useState(null)

  useEffect(() => {
    const loadForecastData = async () => {
      setLoading(true)
      try {
        if (!USE_MOCK) {
          const [zonesRes, myRes, typesRes, fiRes] = await Promise.allSettled([
            getZoneForecast(),
            getMyZoneForecast(),
            getTriggerTypes(),
            getFeatureImportance(),
          ])

          if (zonesRes.status === 'fulfilled') {
            setForecasts(zonesRes.value.forecasts || [])
          }
          if (myRes.status === 'fulfilled') {
            setMyForecast(myRes.value)
          }
          if (typesRes.status === 'fulfilled') {
            setTriggerTypes(typesRes.value.triggers || [])
          }
          if (fiRes.status === 'fulfilled') {
            setFeatureImportance(fiRes.value)
          }
        }
      } catch (e) {
        console.error('Forecast error:', e)
      } finally {
        setLoading(false)
      }
    }

    loadForecastData()
  }, [])

  const topZone = forecasts[0]
  const myProbability = myForecast?.prediction?.probability_percent || 0
  const scrollingAlerts = forecasts.flatMap((item) => ([
    {
      key: `${item.zone}-rain`,
      category: 'Rain',
      color: '#2E90FA',
      text: `${item.city}: ${item.rainfall_forecast_mm || 0}mm rain outlook in the next 24 hours`,
    },
    {
      key: `${item.zone}-aqi`,
      category: 'AQI',
      color: '#F79009',
      text: `${item.city}: AQI watch active for delivery workers in dense traffic corridors`,
    },
    {
      key: `${item.zone}-curfew`,
      category: 'Curfew',
      color: '#F04438',
      text: `${item.city}: curfew and restriction monitoring remains active across sensitive zones`,
    },
    {
      key: `${item.zone}-virus`,
      category: 'Virus',
      color: '#7A5AF8',
      text: `${item.city}: viral fever advisory watch for rider safety and route planning`,
    },
  ]))

  return (
    <motion.div className="min-h-screen pb-28" style={{ background: 'var(--bg-secondary)' }} variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="px-4 mt-3">
        {scrollingAlerts.length > 0 && (
          <div style={{ overflow: 'hidden', marginBottom: 16, borderRadius: 14, border: '1px solid var(--border-light)', background: 'var(--bg-card)' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Inter', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Live city alerts
              </span>
            </div>
            <div style={{ overflow: 'hidden', width: '100%' }}>
              <motion.div
                style={{ display: 'flex', gap: 12, width: 'max-content', padding: '12px 14px' }}
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
              >
                {[...scrollingAlerts, ...scrollingAlerts].map((item, index) => (
                  <div key={`${item.key}-${index}`} style={{ width: 260, flexShrink: 0, borderRadius: 12, padding: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'Inter', color: item.color, background: `${item.color}18`, padding: '3px 8px', borderRadius: 999, display: 'inline-block', marginBottom: 8 }}>
                      {item.category}
                    </span>
                    <p style={{ fontSize: 12, lineHeight: 1.45, color: 'var(--text-primary)', fontFamily: 'Inter', margin: 0 }}>
                      {item.text}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        )}

        {myProbability > 60 && (
          <div style={{ background: 'var(--warning-light)', borderLeft: '3px solid var(--warning)', borderRadius: '0 12px 12px 0', padding: '12px 14px', marginBottom: 16 }}>
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} style={{ color: 'var(--warning)', flexShrink: 0 }} />
              <p className="text-[14px] font-semibold font-body" style={{ color: 'var(--warning)' }}>
                High flood risk tomorrow - {myProbability}%
              </p>
            </div>
            <p className="text-[13px] font-body mt-1 pl-6" style={{ color: 'var(--text-secondary)' }}>
              {myForecast?.zone || 'Your zone'} · {myForecast?.auto_cover_extended ? 'Coverage auto-extended' : 'Monitor actively'}
            </p>
          </div>
        )}

        <div className="rounded-card overflow-hidden mb-3" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid var(--border-light)' }}>
            <span className="text-[14px] font-semibold font-body" style={{ color: 'var(--text-primary)' }}>Next 24 hours</span>
            <div className="flex items-center gap-1.5">
              <Clock size={14} style={{ color: 'var(--text-tertiary)' }} />
              <span className="text-[12px] font-body" style={{ color: 'var(--text-tertiary)' }}>
                {loading ? 'Loading' : 'Live backend'}
              </span>
            </div>
          </div>

          {forecasts.map((item, index) => (
            <div key={item.zone} className="px-4 py-3.5" style={{ borderBottom: index < forecasts.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[15px] font-semibold font-body" style={{ color: 'var(--text-primary)' }}>{item.city}</p>
                  <p className="text-[12px] font-body mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{item.zone}</p>
                </div>
                <p className="font-display font-bold text-[22px]" style={{ color: riskColor(item.flood_probability_percent || 0) }}>
                  {item.flood_probability_percent || item.probability_percent || 0}%
                </p>
              </div>

              <motion.div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.div className="h-full rounded-full" style={{ backgroundColor: riskColor(item.flood_probability_percent || 0) }} initial={{ width: 0 }} animate={{ width: `${item.flood_probability_percent || 0}%` }} transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.2 + index * 0.1 }} />
              </motion.div>

              <p className="text-[11px] font-body mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
                {item.rainfall_forecast_mm || 0}mm · {item.risk_level} · {item.workers_in_zone || 0} workers protected
              </p>
            </div>
          ))}

          {!loading && forecasts.length === 0 && (
            <div className="px-4 py-6 text-center">
              <p className="text-[13px] font-body" style={{ color: 'var(--text-tertiary)' }}>No forecast data available yet.</p>
            </div>
          )}
        </div>

        {myForecast?.prediction && (
          <div className="rounded-card overflow-hidden mb-3" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
            <div className="px-4 py-3.5" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <span className="text-[14px] font-semibold font-body" style={{ color: 'var(--text-primary)' }}>What our AI analysed</span>
            </div>
            {[
              { label: 'Rainfall Forecast', value: `${myForecast.prediction.rainfall_mm}mm / 24h` },
              { label: 'Elevation', value: `${myForecast.prediction.inputs?.elevation_m || '-'}m` },
              { label: 'Flood Events (5yr)', value: `${myForecast.prediction.inputs?.flood_events_5yr || '-'} events` },
              { label: 'Monsoon Intensity', value: `${myForecast.prediction.inputs?.monsoon_intensity || 0}` },
            ].map((row, index, rows) => (
              <div key={row.label} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: index < rows.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                <span className="text-[13px] font-body" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                <span className="text-[13px] font-semibold font-body" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-card overflow-hidden mb-3" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
          <div className="px-4 py-3.5" style={{ borderBottom: '1px solid var(--border-light)' }}>
            <span className="text-[14px] font-semibold font-body" style={{ color: 'var(--text-primary)' }}>5 automated triggers</span>
          </div>
          {triggerTypes.map((trigger, index) => (
            <div key={trigger.id} className="px-4 py-3" style={{ borderBottom: index < triggerTypes.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-semibold font-body" style={{ color: 'var(--text-primary)' }}>{trigger.name}</p>
                  <p className="text-[12px] font-body mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{trigger.description}</p>
                </div>
                <span className="text-[12px] font-semibold font-body" style={{ color: '#D97757' }}>{Math.round((trigger.payout_percentage || 0) * 100)}%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="inline-flex items-center gap-2 rounded-pill px-3.5 py-2 mb-4" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
          <ShieldCheck size={14} style={{ color: 'var(--brand)' }} />
          <span className="text-[13px] font-medium font-body" style={{ color: 'var(--text-primary)' }}>
            {myForecast?.auto_cover_extended ? 'Coverage auto-extended for tomorrow' : 'Live zone monitoring active'}
          </span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            India holiday & flood calendar
          </p>
          <IndiaCalendar />
        </div>

        {/* Feature Importance — Model Transparency */}
        {featureImportance && (
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 18, border: '1px solid var(--border-light)', marginBottom: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Inter', color: 'var(--text-tertiary)', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 4px' }}>
              Model Transparency
            </p>
            <p style={{ fontFamily: 'Bricolage Grotesque', fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
              How Your Premium Is Calculated
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'Inter', margin: '0 0 14px' }}>
              {featureImportance.model} · R² {featureImportance.model_r2} · {featureImportance.training_records?.toLocaleString()} training records
            </p>
            {featureImportance.features?.map((f) => (
              <div key={f.name} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontFamily: 'Inter', color: 'var(--text-secondary)' }}>
                    #{f.rank} {f.name.replace(/_/g, ' ')}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Inter', color: 'var(--text-primary)' }}>
                    {(f.importance * 100).toFixed(1)}%
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--border-light)', borderRadius: 99, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${f.importance * 100}%`,
                      background: f.rank === 1 ? '#D97757' : f.rank === 2 ? '#2E90FA' : f.rank <= 4 ? '#12B76A' : '#9CA3AF',
                      borderRadius: 99,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-16 left-0 right-0 lg:left-[240px] px-4 py-3 z-40" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-light)' }}>
        <Button onClick={() => navigate('/premium')} fullWidth>
          View Your Premium
        </Button>
      </div>

      <ChatWidget />
    </motion.div>
  )
}
