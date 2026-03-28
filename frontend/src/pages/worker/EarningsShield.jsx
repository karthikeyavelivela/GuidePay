import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, Shield, DollarSign, BarChart3 } from 'lucide-react'
import { useWorkerStore } from '../../store/workerStore'
import { getMyEarnings } from '../../services/api'
import { formatINR } from '../../utils/formatters'
import ChatWidget from '../../components/chat/ChatWidget'
import BottomNav from '../../components/ui/BottomNav'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const DEMO_DATA = {
  summary: {
    total_payouts: 2400,
    total_premiums: 464,
    total_claims: 4,
    net_protection: 1936,
    roi_percent: 417,
  },
  monthly_payouts: [
    { _id: '2026-01', total_payout: 600,  claim_count: 1 },
    { _id: '2026-02', total_payout: 600,  claim_count: 1 },
    { _id: '2026-03', total_payout: 1200, claim_count: 2 },
  ],
  monthly_premiums: [
    { _id: '2025-12', total_premium: 58 },
    { _id: '2026-01', total_premium: 116 },
    { _id: '2026-02', total_premium: 174 },
    { _id: '2026-03', total_premium: 116 },
  ],
}

export default function EarningsShield() {
  const navigate = useNavigate()
  const worker = useWorkerStore(s => s.worker)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyEarnings()
        const hasData = (res?.summary?.total_claims ?? 0) > 0
        setData(hasData ? res : DEMO_DATA)
      } catch (e) {
        setData(DEMO_DATA)
      }
      setLoading(false)
    }
    fetch()
  }, [])

  const summary = data?.summary || DEMO_DATA.summary

  // Build chart data from monthly aggregates
  const monthlyPayouts = data?.monthly_payouts || []
  const monthlyPremiums = data?.monthly_premiums || []

  // Merge into unified monthly data
  const allMonths = new Set([
    ...monthlyPayouts.map(m => m._id),
    ...monthlyPremiums.map(m => m._id),
  ])
  const chartData = Array.from(allMonths).sort().map(month => {
    const payout = monthlyPayouts.find(m => m._id === month)
    const premium = monthlyPremiums.find(m => m._id === month)
    const [year, monthNum] = month.split('-')
    return {
      month: `${MONTH_NAMES[parseInt(monthNum) - 1]} '${year.slice(2)}`,
      payouts: payout?.total_payout || 0,
      premiums: premium?.total_premium || 0,
      claims: payout?.claim_count || 0,
    }
  })

  const maxVal = Math.max(
    ...chartData.map(d => Math.max(d.payouts, d.premiums)),
    100
  )

  return (
    <motion.div
      className="min-h-screen pb-24"
      style={{ background: 'var(--bg-secondary)' }}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        padding: '16px 16px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 999,
              width: 36, height: 36,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ArrowLeft size={18} color="white" />
          </button>
          <div>
            <h1 style={{
              fontFamily: 'Bricolage Grotesque',
              fontSize: 20, fontWeight: 800,
              color: 'white', margin: 0,
            }}>
              Earnings Shield
            </h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter', margin: '2px 0 0' }}>
              Your income protection overview
            </p>
          </div>
        </div>

        {/* Main stat */}
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'Inter', margin: '0 0 4px' }}>
            NET PROTECTION VALUE
          </p>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <span style={{
              fontFamily: 'Bricolage Grotesque',
              fontSize: 48, fontWeight: 800,
              color: summary.net_protection >= 0 ? '#12B76A' : '#F04438',
              letterSpacing: -2,
            }}>
              {summary.net_protection >= 0 ? '+' : ''}{formatINR(summary.net_protection)}
            </span>
          </motion.div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter', margin: '4px 0 0' }}>
            {summary.roi_percent > 0 ? `${summary.roi_percent}% return on premiums` : 'Start earning protected income'}
          </p>
        </div>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { icon: DollarSign, label: 'Total Payouts', value: formatINR(summary.total_payouts), color: '#12B76A', bg: '#ECFDF3' },
            { icon: Shield, label: 'Premiums Paid', value: formatINR(summary.total_premiums), color: '#D97757', bg: '#FDF1ED' },
            { icon: BarChart3, label: 'Claims Filed', value: String(summary.total_claims), color: '#2E90FA', bg: '#EFF8FF' },
            { icon: TrendingUp, label: 'ROI', value: `${summary.roi_percent}%`, color: summary.roi_percent > 100 ? '#12B76A' : '#F79009', bg: summary.roi_percent > 100 ? '#ECFDF3' : '#FFFAEB' },
          ].map(stat => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 14,
                  padding: 14,
                  border: '1px solid var(--border-light)',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: stat.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 8,
                }}>
                  <Icon size={16} color={stat.color} />
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'Inter', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                  {stat.label}
                </p>
                <p style={{ fontFamily: 'Bricolage Grotesque', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0' }}>
                  {stat.value}
                </p>
              </motion.div>
            )
          })}
        </div>

        {/* Monthly chart */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 14,
          padding: 16,
          border: '1px solid var(--border-light)',
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Inter', color: 'var(--text-primary)', margin: '0 0 14px' }}>
            Monthly Breakdown
          </p>
          {chartData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <span style={{ fontSize: 32 }}>📊</span>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', fontFamily: 'Inter', margin: '8px 0 0' }}>
                No earnings data yet. Buy a plan to get started.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {chartData.map((row, i) => (
                <div key={row.month}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'Inter' }}>
                      {row.month}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'Inter' }}>
                      {row.claims} claim{row.claims !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {/* Payouts bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: '#12B76A', fontFamily: 'Inter', width: 50, fontWeight: 600 }}>Payout</span>
                    <div style={{ flex: 1, height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(row.payouts / maxVal) * 100}%` }}
                        transition={{ delay: 0.4 + i * 0.1, type: 'spring', stiffness: 80 }}
                        style={{ height: '100%', background: '#12B76A', borderRadius: 4 }}
                      />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter', width: 50, textAlign: 'right' }}>
                      {formatINR(row.payouts)}
                    </span>
                  </div>
                  {/* Premiums bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: '#D97757', fontFamily: 'Inter', width: 50, fontWeight: 600 }}>Premium</span>
                    <div style={{ flex: 1, height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(row.premiums / maxVal) * 100}%` }}
                        transition={{ delay: 0.5 + i * 0.1, type: 'spring', stiffness: 80 }}
                        style={{ height: '100%', background: '#D97757', borderRadius: 4 }}
                      />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter', width: 50, textAlign: 'right' }}>
                      {formatINR(row.premiums)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(217,119,87,0.08), rgba(217,119,87,0.02))',
          borderRadius: 14,
          padding: 16,
          border: '1px solid rgba(217,119,87,0.15)',
        }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <Shield size={20} color="#D97757" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Inter', color: 'var(--text-primary)', margin: '0 0 4px' }}>
                How Earnings Shield works
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Inter', lineHeight: 1.5, margin: 0 }}>
                Your weekly premiums fund a protection pool. When floods, outages, or curfews hit your zone,
                you receive automatic payouts — often exceeding your total premiums paid.
              </p>
            </div>
          </div>
        </div>
      </div>

      <ChatWidget />
      <BottomNav />
    </motion.div>
  )
}
