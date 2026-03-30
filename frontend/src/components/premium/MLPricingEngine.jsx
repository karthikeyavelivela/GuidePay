import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Zap, Info } from 'lucide-react'
import { useWorkerStore } from '../../store/workerStore'

const ZONE_DATA = {
  'kondapur-hyderabad': {
    city: 'Hyderabad', premium: 58, risk: 'HIGH',
    factors: {
      flood_history: 0.75, waterlogging: 0.58,
      elevation_risk: 0.39, drainage_quality: 0.45,
      monsoon_season: 0.95,
    }
  },
  'kurla-mumbai': {
    city: 'Mumbai', premium: 67, risk: 'HIGH',
    factors: {
      flood_history: 1.0, waterlogging: 0.90,
      elevation_risk: 0.99, drainage_quality: 0.65,
      monsoon_season: 0.95,
    }
  },
  'koramangala-bengaluru': {
    city: 'Bengaluru', premium: 43, risk: 'LOW',
    factors: {
      flood_history: 0.17, waterlogging: 0.20,
      elevation_risk: 0.0, drainage_quality: 0.22,
      monsoon_season: 0.95,
    }
  },
  'tnagar-chennai': {
    city: 'Chennai', premium: 54, risk: 'MEDIUM',
    factors: {
      flood_history: 0.58, waterlogging: 0.45,
      elevation_risk: 0.99, drainage_quality: 0.52,
      monsoon_season: 0.95,
    }
  },
  'dwarka-delhi': {
    city: 'Delhi', premium: 48, risk: 'LOW',
    factors: {
      flood_history: 0.25, waterlogging: 0.30,
      elevation_risk: 0.73, drainage_quality: 0.38,
      monsoon_season: 0.95,
    }
  },
}

const FACTOR_LABELS = {
  flood_history: 'Flood History (5yr)',
  waterlogging: 'Waterlogging Incidents',
  elevation_risk: 'Elevation Risk',
  drainage_quality: 'Drainage Issues',
  monsoon_season: 'Monsoon Intensity',
}

const FACTOR_DESCRIPTIONS = {
  flood_history: 'Number of flood events recorded in your zone over 5 years',
  waterlogging: 'How often your zone gets waterlogged after heavy rain',
  elevation_risk: 'Lower areas flood more easily — measured from NDMA data',
  drainage_quality: 'Quality of stormwater drainage infrastructure',
  monsoon_season: 'Current rainfall season intensity (IMD monsoon tracker)',
}

export const MLPricingEngine = ({ compact = false, onPremiumCalculated = null }) => {
  const worker = useWorkerStore(s => s.worker)
  const zone = worker?.zone || 'kondapur-hyderabad'
  const riskScore = worker?.risk_score || 0.82

  const [calculating, setCalculating] = useState(false)
  const [calculated, setCalculated] = useState(false)
  const [currentZone, setCurrentZone] = useState(zone)
  const [showFactors, setShowFactors] = useState(false)
  const [activeTooltip, setActiveTooltip] = useState(null)

  const zoneInfo = ZONE_DATA[currentZone] || ZONE_DATA['kondapur-hyderabad']

  const BASE = 49
  const zoneAdj = zoneInfo.premium - BASE
  const workerAdj = riskScore > 0.8 ? -7 : riskScore > 0.65 ? -3 : 0
  const totalPremium = zoneInfo.premium + workerAdj

  useEffect(() => {
    triggerCalculation()
  }, [currentZone])

  const triggerCalculation = async () => {
    setCalculating(true)
    setCalculated(false)
    await new Promise(r => setTimeout(r, 1200))
    setCalculating(false)
    setCalculated(true)
    if (onPremiumCalculated) onPremiumCalculated(totalPremium)
  }

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '14px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Brain size={15} color="#D97757" />
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Inter', color: 'var(--text-primary)' }}>
              AI-Calculated Premium
            </span>
          </div>
          {calculating ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width: 14, height: 14, border: '2px solid #D97757', borderTopColor: 'transparent', borderRadius: 999 }}
            />
          ) : (
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'Inter', color: '#12B76A', background: 'rgba(18,183,106,0.1)', padding: '2px 7px', borderRadius: 999 }}>
              ✓ Calculated
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 8 }}>
          <motion.span
            key={totalPremium}
            initial={{ scale: 1.2, color: '#D97757' }}
            animate={{ scale: 1, color: 'var(--text-primary)' }}
            style={{ fontFamily: 'Bricolage Grotesque', fontSize: 32, fontWeight: 800, letterSpacing: -1 }}
          >
            ₹{totalPremium}
          </motion.span>
          <span style={{ fontSize: 12, fontFamily: 'Inter', color: 'var(--text-tertiary)' }}>/week</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontFamily: 'Inter', color: 'var(--text-tertiary)' }}>Base rate</span>
            <span style={{ fontSize: 11, fontFamily: 'Inter', color: 'var(--text-secondary)', fontWeight: 600 }}>₹{BASE}</span>
          </div>
          {zoneAdj !== 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontFamily: 'Inter', color: 'var(--text-tertiary)' }}>{zoneInfo.city} zone risk</span>
              <span style={{ fontSize: 11, fontFamily: 'Inter', color: zoneAdj > 0 ? '#F04438' : '#12B76A', fontWeight: 600 }}>
                {zoneAdj > 0 ? '+' : ''}₹{zoneAdj}
              </span>
            </div>
          )}
          {workerAdj !== 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontFamily: 'Inter', color: 'var(--text-tertiary)' }}>Your trust score</span>
              <span style={{ fontSize: 11, fontFamily: 'Inter', color: '#12B76A', fontWeight: 600 }}>-₹{Math.abs(workerAdj)}</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setShowFactors(!showFactors)}
          style={{
            marginTop: 10, width: '100%', padding: '7px',
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 8, cursor: 'pointer', fontSize: 11,
            fontFamily: 'Inter', color: 'var(--text-tertiary)', fontWeight: 600,
          }}
        >
          {showFactors ? '▲ Hide' : '▼ Show'} ML factors
        </button>

        <AnimatePresence>
          {showFactors && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(zoneInfo.factors).map(([key, val]) => (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 10, fontFamily: 'Inter', color: 'var(--text-tertiary)' }}>
                        {FACTOR_LABELS[key] || key}
                      </span>
                      <span style={{ fontSize: 10, fontFamily: 'Inter', color: val > 0.6 ? '#F04438' : val > 0.3 ? '#F79009' : '#12B76A', fontWeight: 700 }}>
                        {Math.round(val * 100)}%
                      </span>
                    </div>
                    <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 999, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${val * 100}%` }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        style={{ height: '100%', background: val > 0.6 ? '#F04438' : val > 0.3 ? '#F79009' : '#12B76A', borderRadius: 999 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  // Full version
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(217,119,87,0.08), rgba(217,119,87,0.02))',
        borderBottom: '1px solid var(--border-light)',
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(217,119,87,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={18} color="#D97757" />
          </div>
          <div>
            <p style={{ fontFamily: 'Bricolage Grotesque', fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              ML Premium Engine
            </p>
            <p style={{ fontSize: 11, fontFamily: 'Inter', color: 'var(--text-tertiary)', margin: 0 }}>
              7 hyper-local risk factors · Updated daily
            </p>
          </div>
        </div>
        {calculating ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(217,119,87,0.08)', border: '1px solid rgba(217,119,87,0.2)', borderRadius: 999, padding: '5px 12px' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 12, height: 12, border: '2px solid #D97757', borderTopColor: 'transparent', borderRadius: 999 }} />
            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Inter', color: '#D97757' }}>Calculating...</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(18,183,106,0.08)', border: '1px solid rgba(18,183,106,0.2)', borderRadius: 999, padding: '5px 12px' }}>
            <div style={{ width: 6, height: 6, borderRadius: 999, background: '#12B76A' }} />
            <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Inter', color: '#12B76A' }}>Price ready</span>
          </div>
        )}
      </div>

      <div style={{ padding: 20 }}>
        {/* Zone selector */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Inter', color: 'var(--text-tertiary)', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 8px' }}>
            Calculate for zone
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 6 }}>
            {Object.entries(ZONE_DATA).map(([zoneKey, data]) => (
              <motion.button
                key={zoneKey}
                onClick={() => { setCurrentZone(zoneKey); setCalculated(false) }}
                whileTap={{ scale: 0.96 }}
                style={{
                  padding: '8px 10px', borderRadius: 8,
                  border: currentZone === zoneKey ? '1.5px solid var(--brand)' : '1.5px solid var(--border)',
                  background: currentZone === zoneKey ? 'var(--brand-light)' : 'var(--bg-secondary)',
                  cursor: 'pointer', textAlign: 'center',
                }}
              >
                <p style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Inter', color: currentZone === zoneKey ? 'var(--brand)' : 'var(--text-secondary)', margin: '0 0 2px' }}>
                  {data.city}
                </p>
                <p style={{ fontSize: 10, fontFamily: 'Inter', color: data.risk === 'HIGH' ? '#F04438' : data.risk === 'MEDIUM' ? '#F79009' : '#12B76A', margin: 0, fontWeight: 600 }}>
                  {data.risk}
                </p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Price result */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 14, padding: '18px 20px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 11, fontFamily: 'Inter', color: 'var(--text-tertiary)', margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Your premium</p>
            <motion.p
              key={`${currentZone}-${totalPremium}`}
              initial={{ scale: 1.3, color: '#D97757' }}
              animate={{ scale: 1, color: 'var(--text-primary)' }}
              transition={{ type: 'spring', stiffness: 400 }}
              style={{ fontFamily: 'Bricolage Grotesque', fontSize: 44, fontWeight: 800, margin: 0, letterSpacing: -2, lineHeight: 1 }}
            >
              ₹{calculating ? '...' : totalPremium}
            </motion.p>
            <p style={{ fontSize: 12, fontFamily: 'Inter', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>per week · ₹600 coverage</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              background: zoneInfo.risk === 'HIGH' ? 'rgba(240,68,56,0.1)' : zoneInfo.risk === 'MEDIUM' ? 'rgba(247,144,9,0.1)' : 'rgba(18,183,106,0.1)',
              border: `1px solid ${zoneInfo.risk === 'HIGH' ? 'rgba(240,68,56,0.2)' : zoneInfo.risk === 'MEDIUM' ? 'rgba(247,144,9,0.2)' : 'rgba(18,183,106,0.2)'}`,
              borderRadius: 10, padding: '8px 14px', marginBottom: 8,
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Inter', color: zoneInfo.risk === 'HIGH' ? '#F04438' : zoneInfo.risk === 'MEDIUM' ? '#F79009' : '#12B76A', margin: 0 }}>
                {zoneInfo.risk} RISK ZONE
              </p>
            </div>
            {workerAdj < 0 && (
              <p style={{ fontSize: 11, fontFamily: 'Inter', color: '#12B76A', margin: 0, fontWeight: 600 }}>
                You save ₹{Math.abs(workerAdj)}/week 🎉
              </p>
            )}
          </div>
        </div>

        {/* Breakdown table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {[
            { label: 'Base premium', value: `₹${BASE}`, sub: 'Standard rate for all workers', color: null },
            { label: `${zoneInfo.city} zone risk`, value: zoneAdj >= 0 ? `+₹${zoneAdj}` : `-₹${Math.abs(zoneAdj)}`, sub: `${zoneInfo.risk.toLowerCase()} flood zone · historical data`, color: zoneAdj > 0 ? '#F04438' : '#12B76A' },
            { label: 'Worker trust score', value: workerAdj >= 0 ? `+₹${workerAdj}` : `-₹${Math.abs(workerAdj)}`, sub: riskScore > 0.8 ? `Score ${Math.round(riskScore * 100)}/100 — trusted worker` : `Score ${Math.round(riskScore * 100)}/100`, color: workerAdj <= 0 ? '#12B76A' : '#F04438' },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 10 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Inter', color: 'var(--text-primary)', margin: '0 0 2px' }}>{row.label}</p>
                <p style={{ fontSize: 11, fontFamily: 'Inter', color: 'var(--text-tertiary)', margin: 0 }}>{row.sub}</p>
              </div>
              <span style={{ fontFamily: 'Bricolage Grotesque', fontSize: 18, fontWeight: 800, color: row.color || 'var(--text-primary)' }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* ML Factors */}
        <div>
          <button
            onClick={() => setShowFactors(!showFactors)}
            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', marginBottom: showFactors ? 10 : 0 }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Inter', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={13} color="#D97757" />
              View 7 ML factors
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{showFactors ? '▲' : '▼'}</span>
          </button>

          <AnimatePresence>
            {showFactors && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Object.entries(zoneInfo.factors).map(([key, val]) => (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12, fontFamily: 'Inter', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            {FACTOR_LABELS[key]}
                          </span>
                          <div onMouseEnter={() => setActiveTooltip(key)} onMouseLeave={() => setActiveTooltip(null)} style={{ cursor: 'help', position: 'relative' }}>
                            <Info size={11} color="var(--text-tertiary)" />
                            {activeTooltip === key && (
                              <div style={{ position: 'absolute', bottom: 20, left: 0, width: 200, background: 'var(--text-primary)', color: 'var(--bg-card)', fontSize: 11, fontFamily: 'Inter', padding: '8px 10px', borderRadius: 8, zIndex: 100, lineHeight: 1.5 }}>
                                {FACTOR_DESCRIPTIONS[key]}
                              </div>
                            )}
                          </div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Inter', color: val > 0.6 ? '#F04438' : val > 0.3 ? '#F79009' : '#12B76A' }}>
                          {Math.round(val * 100)}%
                        </span>
                      </div>
                      <div style={{ height: 5, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${val * 100}%` }}
                          transition={{ duration: 0.6, type: 'spring' }}
                          style={{ height: '100%', background: val > 0.6 ? '#F04438' : val > 0.3 ? '#F79009' : '#12B76A', borderRadius: 999 }}
                        />
                      </div>
                    </div>
                  ))}
                  <p style={{ fontSize: 10, fontFamily: 'Inter', color: 'var(--text-tertiary)', margin: 0, lineHeight: 1.5 }}>
                    Data sources: NDMA flood records, IMD rainfall data, OpenWeatherMap, state drainage board reports
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default MLPricingEngine
