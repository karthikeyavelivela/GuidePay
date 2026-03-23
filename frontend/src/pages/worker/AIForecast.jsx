import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, Clock, ShieldCheck } from 'lucide-react'
import TopBar from '../../components/ui/TopBar'
import Button from '../../components/ui/Button'
import BottomNav from '../../components/ui/BottomNav'
import ChatWidget from '../../components/chat/ChatWidget'
import { MOCK_FORECAST } from '../../services/mockData'
import IndiaCalendar from '../../components/forecast/IndiaCalendar'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
}

const riskColor = (pct) =>
  pct > 60 ? '#F04438' : pct >= 30 ? '#F79009' : '#12B76A'

// ─── RISK ZONES for map/list ─────────────────────────
const RISK_ZONES = [
  { name: 'Kondapur, Hyderabad', risk: 78, level: 'HIGH',   color: '#F04438', workers: 32, exposure: 19200 },
  { name: 'Kurla, Mumbai',       risk: 54, level: 'MEDIUM', color: '#F79009', workers: 18, exposure: 10800 },
  { name: 'T.Nagar, Chennai',    risk: 38, level: 'MEDIUM', color: '#F79009', workers: 14, exposure: 6300  },
  { name: 'Koramangala, Bengaluru', risk: 12, level: 'LOW', color: '#12B76A', workers: 41, exposure: 0    },
  { name: 'Dwarka, Delhi',       risk: 8,  level: 'LOW',   color: '#12B76A', workers: 28, exposure: 0    },
]

// ─── RISK MAP (list fallback — works without Google Maps key) ────────────────
const RiskMap = () => {
  const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_KEY

  // If no key or placeholder, show styled list
  if (!mapsKey || mapsKey === 'your_google_maps_key_here' || mapsKey.length < 10) {
    return (
      <div style={{
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid var(--border)',
        background: 'var(--bg-card)',
      }}>
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)' }}>
            Zone risk levels
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'Inter, sans-serif' }}>
            Live · 5 zones
          </span>
        </div>
        {RISK_ZONES.map((zone, i) => (
          <div key={zone.name} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderBottom: i < RISK_ZONES.length - 1 ? '1px solid var(--border-light)' : 'none',
          }}>
            {/* Risk indicator */}
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              background: `${zone.color}18`,
              border: `1.5px solid ${zone.color}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'Bricolage Grotesque, sans-serif', color: zone.color }}>
                {zone.risk}
              </span>
            </div>
            {/* Zone info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', margin: 0, marginBottom: 2 }}>
                {zone.name}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'Inter, sans-serif', margin: 0 }}>
                {zone.workers} workers · {zone.exposure > 0 ? `₹${zone.exposure.toLocaleString('en-IN')} exposure` : 'No exposure'}
              </p>
            </div>
            {/* Level badge */}
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              color: zone.color,
              background: `${zone.color}15`,
              padding: '3px 8px',
              borderRadius: 999,
              flexShrink: 0,
            }}>
              {zone.level}
            </span>
          </div>
        ))}
      </div>
    )
  }

  // With Google Maps key — lazy load
  const GoogleRiskMap = () => {
    const [selected, setSelected] = useState(null)
    // Dynamic import to avoid breaking build when Maps not configured
    try {
      const { GoogleMap, useLoadScript, Circle, Marker, InfoWindow } = require('@react-google-maps/api')
      const { isLoaded } = useLoadScript({ googleMapsApiKey: mapsKey })
      if (!isLoaded) return (
        <div style={{ height: 280, borderRadius: 16, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)', fontFamily: 'Inter, sans-serif' }}>Loading map...</p>
        </div>
      )
      return (
        <div style={{ borderRadius: 16, overflow: 'hidden', height: 280, border: '1px solid var(--border)' }}>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={{ lat: 17.0, lng: 78.0 }}
            zoom={5}
            options={{ disableDefaultUI: true, zoomControl: true }}
          >
            {RISK_ZONES.map((zone, i) => zone.lat && (
              <Marker key={i} position={{ lat: zone.lat, lng: zone.lng }} onClick={() => setSelected(zone)} />
            ))}
          </GoogleMap>
        </div>
      )
    } catch {
      return null
    }
  }
  return <GoogleRiskMap />
}

// ─── NEWS CAROUSEL ────────────────────────────────────
const NEWS_ITEMS = [
  { tag: 'Flood Alert', tagColor: '#2E90FA', title: 'IMD issues Red Alert for Hyderabad — 8 districts affected', source: 'Times of India', time: '2h ago' },
  { tag: 'Outage', tagColor: '#F79009', title: 'Zepto app down for 3 hours across Mumbai', source: 'Inc42', time: '5h ago' },
  { tag: 'Climate', tagColor: '#F04438', title: 'India records 147% excess rainfall in 2024 season', source: 'IMD Bulletin', time: '1 day ago' },
  { tag: 'Policy', tagColor: '#12B76A', title: 'IRDAI sandbox opens for parametric micro-insurance', source: 'Financial Express', time: '1 day ago' },
  { tag: 'Gig Economy', tagColor: '#D97757', title: '12M delivery workers face income risk every monsoon', source: 'NASSCOM', time: '3 days ago' },
]

const NewsCarousel = () => (
  <div style={{ overflow: 'hidden', width: '100%' }}>
    <motion.div
      style={{ display: 'flex', gap: 12, width: 'max-content' }}
      animate={{ x: ['0%', '-50%'] }}
      transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
    >
      {[...NEWS_ITEMS, ...NEWS_ITEMS].map((item, i) => (
        <div key={i} style={{
          width: 220,
          flexShrink: 0,
          background: 'var(--bg-card)',
          borderRadius: 12,
          padding: 12,
          border: '1px solid var(--border-light)',
        }}>
          <span style={{
            fontSize: 9, fontWeight: 700, fontFamily: 'Inter, sans-serif',
            color: item.tagColor, background: `${item.tagColor}18`,
            padding: '2px 7px', borderRadius: 999, display: 'inline-block', marginBottom: 6,
          }}>{item.tag}</span>
          <p style={{ fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)', lineHeight: 1.35, margin: '0 0 6px' }}>
            {item.title}
          </p>
          <p style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'Inter, sans-serif', margin: 0 }}>
            {item.source} · {item.time}
          </p>
        </div>
      ))}
    </motion.div>
  </div>
)

export default function AIForecast() {
  const navigate = useNavigate()
  const forecast = MOCK_FORECAST
  const topZone = forecast[0]

  return (
    <motion.div
      className="min-h-screen pb-28"
      style={{ background: 'var(--bg-secondary)' }}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <TopBar title="AI Forecast" showBack />

      {/* Progress */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <div className="flex-1 h-[3px] rounded-full overflow-hidden mr-3" style={{ background: 'var(--bg-tertiary)' }}>
          <div className="h-full rounded-full" style={{ width: '100%', background: 'var(--brand)' }} />
        </div>
        <span className="text-[11px] font-body flex-shrink-0" style={{ color: 'var(--text-tertiary)' }}>Step 3 of 3</span>
      </div>

      <div className="px-4 mt-3">
        {/* Alert banner */}
        {topZone.probability > 60 && (
          <div style={{
            background: 'var(--warning-light)',
            borderLeft: '3px solid var(--warning)',
            borderRadius: '0 12px 12px 0',
            padding: '12px 14px',
            marginBottom: 16,
          }}>
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} style={{ color: 'var(--warning)', flexShrink: 0 }} />
              <p className="text-[14px] font-semibold font-body" style={{ color: 'var(--warning)' }}>
                High flood risk tomorrow — {topZone.probability}%
              </p>
            </div>
            <p className="text-[13px] font-body mt-1 pl-6" style={{ color: 'var(--text-secondary)' }}>
              {topZone.zone} · Your coverage auto-extends
            </p>
          </div>
        )}

        {/* ── RISK MAP ── */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Zone risk map
          </p>
          <RiskMap />
        </div>

        {/* ── NEWS CAROUSEL ── */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Latest disruption alerts
          </p>
          <NewsCarousel />
        </div>

        {/* Forecast card */}
        <div className="rounded-card overflow-hidden mb-3" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: '1px solid var(--border-light)' }}>
            <span className="text-[14px] font-semibold font-body" style={{ color: 'var(--text-primary)' }}>
              Next 24 hours
            </span>
            <div className="flex items-center gap-1.5">
              <Clock size={14} style={{ color: 'var(--text-tertiary)' }} />
              <span className="text-[12px] font-body" style={{ color: 'var(--text-tertiary)' }}>Updated 3 min ago</span>
            </div>
          </div>

          {forecast.map((item, index) => (
            <div
              key={item.city}
              className="px-4 py-3.5"
              style={{ borderBottom: index < forecast.length - 1 ? '1px solid var(--border-light)' : 'none' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[15px] font-semibold font-body" style={{ color: 'var(--text-primary)' }}>
                    {item.zone}
                  </p>
                  <p className="text-[12px] font-body mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{item.city}</p>
                </div>
                <p
                  className="font-display font-bold text-[22px]"
                  style={{ color: riskColor(item.probability) }}
                >
                  {item.probability}%
                </p>
              </div>

              <motion.div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: riskColor(item.probability) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.probability}%` }}
                  transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.2 + index * 0.1 }}
                />
              </motion.div>

              <p className="text-[11px] font-body mt-1.5" style={{ color: 'var(--text-tertiary)' }}>
                {item.rainfall}mm · {item.elevation < 100 ? 'Low' : 'High'} elevation · {item.events} events
              </p>
            </div>
          ))}
        </div>

        {/* Model card */}
        <div className="rounded-card overflow-hidden mb-3" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
          <div className="px-4 py-3.5" style={{ borderBottom: '1px solid var(--border-light)' }}>
            <span className="text-[14px] font-semibold font-body" style={{ color: 'var(--text-primary)' }}>
              What our AI analysed
            </span>
          </div>
          {[
            { label: 'IMD Rainfall Forecast', value: `${topZone.rainfall}mm / 24h` },
            { label: 'Zone Elevation',         value: `Low (${topZone.elevation}m)` },
            { label: 'Past Flood Events',      value: `${topZone.events} in 5 years` },
            { label: 'Monsoon Intensity',      value: `High (${topZone.monsoon}/1.0)` },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border-light)' : 'none' }}
            >
              <span className="text-[13px] font-body" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
              <span className="text-[13px] font-semibold font-body" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Auto-extend chip */}
        <div
          className="inline-flex items-center gap-2 rounded-pill px-3.5 py-2 mb-4"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}
        >
          <ShieldCheck size={14} style={{ color: 'var(--brand)' }} />
          <span className="text-[13px] font-medium font-body" style={{ color: 'var(--text-primary)' }}>
            Coverage auto-extended for tomorrow
          </span>
        </div>

        {/* ── INDIA CALENDAR ── */}
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            India holiday & flood calendar
          </p>
          <IndiaCalendar />
        </div>
      </div>

      {/* Sticky bottom */}
      <div className="fixed bottom-0 left-0 right-0 px-4 py-3 z-40" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border-light)' }}>
        <Button onClick={() => navigate('/premium')} fullWidth>
          View Your Premium →
        </Button>
      </div>

      <ChatWidget />
      <BottomNav />
    </motion.div>
  )
}
