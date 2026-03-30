import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { useWorkerStore } from '../../store/workerStore'
import { createPaymentOrder, getMyPremiumBreakdown, USE_MOCK, verifyPayment } from '../../services/api'

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 49,
    coverage: 600,
    badge: null,
    description: 'For low-risk zones',
    features: [
      'Up to Rs600/week coverage',
      'IMD flood trigger',
      'Platform outage trigger',
      'Govt curfew trigger',
      'UPI instant payout',
      'Basic risk score',
    ],
    notIncluded: ['AI 24h advance forecast', 'Priority claim review'],
    borderColor: '#E4E4E7',
    bgColor: 'white',
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 58,
    coverage: 600,
    badge: 'Most Popular',
    description: 'Best for most workers',
    features: [
      'Up to Rs600/week coverage',
      'All 5 triggers included',
      'UPI payout under 2 hours',
      'AI 24h flood forecast',
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
    price: 69,
    coverage: 600,
    badge: 'Best Protection',
    description: 'For high-risk flood zones',
    features: [
      'Up to Rs600/week coverage',
      'All 5 triggers included',
      'UPI payout under 1 hour',
      'AI 7-day flood forecast',
      'Auto coverage extension',
      'Priority fraud protection',
      'Dedicated claim tracking',
      'WhatsApp alerts',
    ],
    notIncluded: [],
    borderColor: '#0F0F0F',
    bgColor: 'white',
  },
]

export default function Coverage() {
  const navigate = useNavigate()
  const worker = useWorkerStore((s) => s.worker)
  const setActivePolicy = useWorkerStore((s) => s.setActivePolicy)
  const [selectedPlan, setSelectedPlan] = useState('standard')
  const [loading, setLoading] = useState(false)
  const [mlPremium, setMlPremium] = useState(null)

  const plan = PLANS.find((entry) => entry.id === selectedPlan)

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
    const ratio = mlPremium.final_premium / 58
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
          All plans include Rs600/week coverage cap
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
                Rs{mlPremium?.final_premium || 58}
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {PLANS.map((entry) => {
            const isSelected = selectedPlan === entry.id
            const adjustedPrice = getAdjustedPrice(entry.price)
            return (
              <motion.div key={entry.id} onClick={() => setSelectedPlan(entry.id)} whileTap={{ scale: 0.99 }} style={{ background: isSelected ? entry.bgColor : 'var(--bg-card)', border: isSelected ? `2px solid ${entry.borderColor}` : '2px solid var(--border)', borderRadius: 16, padding: 18, cursor: 'pointer', position: 'relative' }}>
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
                      <span style={{ fontFamily: 'Bricolage Grotesque', fontSize: 28, fontWeight: 800, color: isSelected ? '#D97757' : 'var(--text-primary)', letterSpacing: -1 }}>
                        Rs{adjustedPrice}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'Inter' }}>/wk</span>
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
                Weekly · Rs600 coverage cap · Auto-renews
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
      </div>

      <div className="fixed left-0 right-0 lg:left-[240px]" style={{ bottom: 64, padding: '10px 16px', paddingBottom: 'calc(10px + env(safe-area-inset-bottom))', background: 'var(--bg-card)', borderTop: '1px solid var(--border-light)', zIndex: 40 }}>
        <div style={{ maxWidth: 560, width: '100%', margin: '0 auto' }}>
          <motion.button onClick={handleBuy} disabled={loading} whileHover={!loading ? { scale: 1.01 } : {}} whileTap={!loading ? { scale: 0.97 } : {}} style={{ width: '100%', padding: '15px', borderRadius: 12, border: 'none', background: loading ? '#E4E4E7' : 'linear-gradient(135deg,#D97757,#B85C3A)', color: loading ? '#9B9B9B' : 'white', fontSize: 16, fontWeight: 700, fontFamily: 'Bricolage Grotesque, sans-serif', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Opening payment...' : `Buy ${plan.name} - Rs${getAdjustedPrice(plan.price)}/week`}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
