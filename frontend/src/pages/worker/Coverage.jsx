import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Check, Info } from 'lucide-react'
import { useWorkerStore } from '../../store/workerStore'
import { createPaymentOrder, getMyPremiumBreakdown, USE_MOCK, verifyPayment } from '../../services/api'
import IncomeTierBadge from '../../components/ui/IncomeTierBadge'
import { PAYOUT_TIERS } from '../../data/plans'

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 49,
    coverage: 400,
    badge: null,
    description: 'For low-risk zones',
    features: [
      'Up to ₹400/week (Bronze tier)',
      'IMD flood trigger',
      'Limited triggers',
      'Payout in 24 hours',
      'Basic risk score',
    ],
    notIncluded: ['All triggers', 'Auto payout'],
    borderColor: '#E4E4E7',
    bgColor: 'white',
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 62,
    coverage: 600,
    badge: 'Most Popular',
    description: 'Best for most workers',
    features: [
      'Up to ₹900 based on your activity level',
      'All 5 triggers included',
      'UPI payout under 2 hours',
      'Worker risk score tracking',
      'Priority claim review',
      'Flood alert notifications',
    ],
    notIncluded: [],
    borderColor: '#D97757',
    bgColor: '#FDF1ED',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 89,
    coverage: 900,
    badge: 'Best Protection',
    description: 'For high-risk flood zones',
    features: [
      'Up to ₹900 based on your activity level',
      'All 5 triggers included',
      'UPI payout under 1 hour',
      'Auto payout included',
      'Priority fraud protection',
      'Dedicated claim tracking',
      'WhatsApp alerts',
    ],
    notIncluded: [],
    borderColor: '#0F0F0F',
    bgColor: 'white',
  },
  {
    id: 'daily',
    name: 'Daily Shield',
    price: 12,
    coverage: 900,
    badge: 'MOST AFFORDABLE',
    description: 'Flexible daily protection',
    features: [
      'Up to ₹900/day (Gold tier)',
      'All 5 triggers included',
      'UPI payout in 2 hours',
      'Expires after 24 hours',
      'Renew anytime',
    ],
    notIncluded: ['Weekly auto-renewal'],
    borderColor: '#12B76A',
    bgColor: '#F0FDF4',
    daily: true,
  },
]

function getIncomeTier(dailyOrders) {
  if (dailyOrders >= 15) return { tier: 'Gold', payout: 900 }
  if (dailyOrders >= 8) return { tier: 'Silver', payout: 600 }
  return { tier: 'Bronze', payout: 400 }
}

export default function Coverage() {
  const navigate = useNavigate()
  const worker = useWorkerStore((s) => s.worker)
  const setActivePolicy = useWorkerStore((s) => s.setActivePolicy)
  const [selectedPlan, setSelectedPlan] = useState('standard')
  const [loading, setLoading] = useState(false)
  const [mlPremium, setMlPremium] = useState(null)
  const [showPayoutInfo, setShowPayoutInfo] = useState(false)

  const plan = PLANS.find((entry) => entry.id === selectedPlan)
  const avgIncome = Number(worker?.avg_daily_income || worker?.avgDailyIncome || 800)
  const triggerProbability = Number(mlPremium?.zone_risk_score || 0.42)
  const exposedDays = plan?.id === 'premium' ? 2 : 1
  const formulaPremium = Math.round(triggerProbability * avgIncome * exposedDays * 0.1)
  const dailyOrders = Number(worker?.avg_daily_orders || worker?.avgDailyOrders || 8)
  const incomeInfo = getIncomeTier(dailyOrders)

  useEffect(() => {
    const loadPremium = async () => {
      if (!worker?.zone || USE_MOCK) return
      try {
        const data = await getMyPremiumBreakdown(worker.zone)
        setMlPremium(data)
      } catch {}
    }
    loadPremium()
  }, [worker?.zone])

  const getAdjustedPrice = (basePlanPrice) => {
    if (!mlPremium?.final_premium) return basePlanPrice
    const ratio = mlPremium.final_premium / 62
    return Math.max(35, Math.round(basePlanPrice * ratio))
  }

  const handleBuy = async () => {
    setLoading(true)
    const selected = PLANS.find((entry) => entry.id === selectedPlan)
    const finalPrice = getAdjustedPrice(selected.price)

    try {
      const order = await createPaymentOrder(selected.id, finalPrice)
      const mockPaymentId = `pay_MOCK_${Date.now()}`
      const mockSignature = `sig_MOCK_${Date.now()}`
      const result = await verifyPayment({
        razorpay_order_id: order.order_id,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: mockSignature,
        plan_id: selected.id,
        amount: order.amount || finalPrice,
      })

      if (result?.policy) {
        setActivePolicy({
          planId: result.policy.plan_id || selected.id,
          planName: result.policy.plan_name || selected.name,
          price: result.policy.weekly_premium || order.amount || finalPrice,
          coverage: result.policy.coverage_cap || selected.coverage,
          weekStart: result.policy.week_start,
          weekEnd: result.policy.week_end,
          paymentId: result.payment_id || mockPaymentId,
          status: result.policy.status || 'ACTIVE',
        })
        navigate('/payment-success')
      }
    } catch (e) {
      console.error('[Coverage] Payment flow failed:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', paddingBottom: 140 }}>
      <div style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-light)', padding: '16px' }}>
        <h1 style={{ fontFamily: 'Bricolage Grotesque', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          Choose your plan
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Inter', margin: '2px 0 0' }}>
          Select the plan that matches your protection needs
        </p>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 18, border: '1px solid var(--border-light)', marginBottom: 18 }}>
          <p style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Inter', color: 'var(--text-tertiary)', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 10px' }}>
            Current zone pricing
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <p style={{ fontFamily: 'Bricolage Grotesque', fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {worker?.city || mlPremium?.city || 'Your city'}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Inter', margin: '2px 0 0' }}>
                Stable backend premium for your current zone
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontFamily: 'Bricolage Grotesque', fontSize: 34, fontWeight: 800, color: '#D97757', margin: 0 }}>
                Rs{mlPremium?.final_premium || 62}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'Inter', margin: 0 }}>
                /week
              </p>
            </div>
          </div>
          {mlPremium && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '10px 12px' }}>
                <p style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'Inter', margin: 0 }}>Base</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Inter', margin: '4px 0 0' }}>
                  Rs{mlPremium.base_premium}
                </p>
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '10px 12px' }}>
                <p style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'Inter', margin: 0 }}>Zone</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: mlPremium.zone_adjustment >= 0 ? '#F04438' : '#12B76A', fontFamily: 'Inter', margin: '4px 0 0' }}>
                  {mlPremium.zone_adjustment >= 0 ? '+' : '-'}Rs{Math.abs(mlPremium.zone_adjustment)}
                </p>
              </div>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '10px 12px' }}>
                <p style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'Inter', margin: 0 }}>Worker</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: mlPremium.worker_adjustment <= 0 ? '#12B76A' : '#F04438', fontFamily: 'Inter', margin: '4px 0 0' }}>
                  {mlPremium.worker_adjustment >= 0 ? '+' : '-'}Rs{Math.abs(mlPremium.worker_adjustment)}
                </p>
              </div>
            </div>
          )}
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 18, border: '1px solid var(--border-light)', marginBottom: 18 }}>
          <p style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Inter', color: 'var(--text-tertiary)', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 10px' }}>
            Pricing Transparency
          </p>
          <p style={{ fontFamily: 'Bricolage Grotesque', fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>
            Premium = trigger probability × income loss/day × days exposed
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '10px 12px' }}>
              <p style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'Inter', margin: 0 }}>Trigger probability</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Inter', margin: '4px 0 0' }}>{Math.round(triggerProbability * 100)}%</p>
            </div>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '10px 12px' }}>
              <p style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'Inter', margin: 0 }}>Income loss/day</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Inter', margin: '4px 0 0' }}>Rs{avgIncome}</p>
            </div>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '10px 12px' }}>
              <p style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'Inter', margin: 0 }}>Days exposed</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Inter', margin: '4px 0 0' }}>{exposedDays}</p>
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Inter', margin: 0 }}>
            Raw expected-loss premium: Rs{formulaPremium}. Final premium is plan-adjusted and capped with reserve margin, underwriting rules, and zone risk controls.
          </p>
        </div>

        {/* Income Tier Badge */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: '14px 16px', border: '1px solid var(--border-light)', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <p style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Inter', color: 'var(--text-tertiary)', letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>
              Your Income Tier
            </p>
            <button
              onClick={() => setShowPayoutInfo(!showPayoutInfo)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <Info size={14} color="var(--text-tertiary)" />
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IncomeTierBadge dailyOrders={dailyOrders} />
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Inter', margin: 0 }}>
              Your payout: <strong style={{ color: 'var(--text-primary)' }}>₹{incomeInfo.payout}</strong> per trigger event
            </p>
          </div>
          {showPayoutInfo && (
            <div style={{ marginTop: 12, background: 'var(--bg-secondary)', borderRadius: 10, padding: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', fontFamily: 'Inter', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 8px' }}>
                Payout Tiers — based on activity
              </p>
              {PAYOUT_TIERS.map(t => (
                <div key={t.tier} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: 12, fontFamily: 'Inter', color: 'var(--text-secondary)' }}>{t.tier} · {t.orders}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Inter', color: 'var(--text-primary)' }}>₹{t.payout}</span>
                </div>
              ))}
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'Inter', margin: '8px 0 0' }}>
                Workers with higher order volume receive higher payouts per trigger event.
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {PLANS.map((entry) => {
            const isSelected = selectedPlan === entry.id
            const adjustedPrice = entry.daily ? entry.price : getAdjustedPrice(entry.price)
            return (
              <motion.div key={entry.id} onClick={() => setSelectedPlan(entry.id)} whileTap={{ scale: 0.99 }} style={{ background: isSelected ? entry.bgColor : 'var(--bg-card)', border: isSelected ? `2px solid ${entry.borderColor}` : entry.daily ? `2px dashed ${entry.borderColor}` : '2px solid var(--border)', borderRadius: 16, padding: 18, cursor: 'pointer', position: 'relative' }}>
                {entry.badge && (
                  <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: entry.popular ? '#D97757' : '#0F0F0F', color: 'white', fontSize: 10, fontWeight: 700, fontFamily: 'Inter', padding: '3px 12px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                    {entry.badge}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <p style={{ fontFamily: 'Bricolage Grotesque', fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px' }}>{entry.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'Inter', margin: 0 }}>{entry.description}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, justifyContent: 'flex-end' }}>
                      <span style={{ fontFamily: 'Bricolage Grotesque', fontSize: 28, fontWeight: 800, color: isSelected ? (entry.daily ? '#12B76A' : '#D97757') : 'var(--text-primary)', letterSpacing: -1 }}>
                        ₹{adjustedPrice}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'Inter' }}>{entry.daily ? '/day' : '/wk'}</span>
                    </div>
                    <div style={{ width: 22, height: 22, borderRadius: 999, background: isSelected ? '#D97757' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', marginTop: 4 }}>
                      {isSelected && <Check size={12} color="white" strokeWidth={3} />}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {entry.features.map((feature) => (
                    <div key={feature} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <div style={{ width: 16, height: 16, borderRadius: 999, background: '#ECFDF3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <Check size={9} color="#12B76A" strokeWidth={3} />
                      </div>
                      <span style={{ fontSize: 12, fontFamily: 'Inter', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{feature}</span>
                    </div>
                  ))}
                  {entry.notIncluded.map((feature) => (
                    <div key={feature} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <div style={{ width: 16, height: 16, borderRadius: 999, background: '#F7F7F8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <span style={{ fontSize: 9, color: '#C4C4C4', lineHeight: 1 }}>x</span>
                      </div>
                      <span style={{ fontSize: 12, fontFamily: 'Inter', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: '14px 16px', border: '1px solid var(--border-light)', marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Inter', color: 'var(--text-tertiary)', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 10px' }}>
            You are selecting
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: 'Bricolage Grotesque', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{plan.name} Plan</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Inter', margin: '2px 0 0' }}>
                Weekly - Rs{plan.coverage} coverage cap - Auto-renews
              </p>
            </div>
            <p style={{ fontFamily: 'Bricolage Grotesque', fontSize: 24, fontWeight: 800, color: '#D97757', margin: 0 }}>
              Rs{getAdjustedPrice(plan.price)}
            </p>
          </div>
          {mlPremium && (
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'Inter', margin: '10px 0 0' }}>
              Zone-adjusted pricing active for {mlPremium.city || worker?.city || 'your zone'}
            </p>
          )}
        </div>

        {/* IRDAI Trust Badges */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {[
            { icon: '🏛️', label: 'IRDAI Innovation Sandbox Compliant' },
            { icon: '🔒', label: 'Data stored in India (Mumbai region)' },
            { icon: '⚡', label: 'Payouts via RBI-regulated UPI' },
          ].map((badge) => (
            <div
              key={badge.label}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: 999,
                padding: '5px 10px',
              }}
            >
              <span style={{ fontSize: 12 }}>{badge.icon}</span>
              <span style={{ fontSize: 10, fontFamily: 'Inter', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed left-0 right-0 lg:left-[240px]" style={{ bottom: 64, padding: '10px 16px', paddingBottom: 'calc(10px + env(safe-area-inset-bottom))', background: 'var(--bg-card)', borderTop: '1px solid var(--border-light)', zIndex: 40 }}>
        <div style={{ maxWidth: 560, width: '100%', margin: '0 auto' }}>
          <motion.button onClick={handleBuy} disabled={loading} whileHover={!loading ? { scale: 1.01 } : {}} whileTap={!loading ? { scale: 0.97 } : {}} style={{ width: '100%', padding: '15px', borderRadius: 12, border: 'none', background: loading ? '#E4E4E7' : 'linear-gradient(135deg,#D97757,#B85C3A)', color: loading ? '#9B9B9B' : 'white', fontSize: 16, fontWeight: 700, fontFamily: 'Bricolage Grotesque, sans-serif', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Opening payment...' : `Buy ${plan.name} - ₹${plan.daily ? plan.price : getAdjustedPrice(plan.price)}/${plan.daily ? 'day' : 'week'}`}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
