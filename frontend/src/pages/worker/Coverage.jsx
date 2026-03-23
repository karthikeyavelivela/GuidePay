import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useWorkerStore } from '../../store/workerStore'
import { Check, ShieldCheck } from 'lucide-react'

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 49,
    coverage: 600,
    badge: null,
    description: 'For low-risk zones',
    features: [
      'Up to ₹600/week coverage',
      'IMD flood trigger',
      'Platform outage trigger',
      'Govt curfew trigger',
      'UPI instant payout',
      'Basic risk score',
    ],
    notIncluded: [
      'AI 24h advance forecast',
      'Priority claim review',
    ],
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
      'Up to ₹600/week coverage',
      'All 3 triggers included',
      'UPI payout under 2 hours',
      'AI 24h flood forecast',
      'Worker risk score tracking',
      'Activity verification',
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
      'Up to ₹600/week coverage',
      'All 3 triggers included',
      'UPI payout under 1 hour',
      'AI 7-day flood forecast',
      'Auto coverage extension',
      'Priority fraud protection',
      'Dedicated claim tracking',
      'WhatsApp alerts',
      '24/7 support priority',
    ],
    notIncluded: [],
    borderColor: '#0F0F0F',
    bgColor: 'white',
  },
]

export default function Coverage() {
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState('standard')
  const [loading, setLoading] = useState(false)
  const setActivePolicy = useWorkerStore(s => s.setActivePolicy)
  const worker = useWorkerStore(s => s.worker)

  const plan = PLANS.find(p => p.id === selectedPlan)

  const handleBuy = () => {
    setLoading(true)
    // Simulate a short delay for UX, then activate policy
    setTimeout(() => {
      setActivePolicy({
        planId: plan.id,
        planName: plan.name,
        price: plan.price,
        coverage: plan.coverage,
        weekStart: new Date().toISOString(),
        weekEnd: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        paymentId: 'GP_' + Date.now(),
        status: 'ACTIVE',
      })
      setLoading(false)
      navigate('/payment-success')
    }, 1200)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      paddingBottom: 100,
    }}>
      {/* TopBar */}
      <div style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-light)',
        padding: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <h1 style={{
          fontFamily: 'Bricolage Grotesque',
          fontSize: 20, fontWeight: 800,
          color: 'var(--text-primary)',
          margin: 0,
        }}>
          Choose your plan
        </h1>
        <p style={{
          fontSize: 13, color: 'var(--text-secondary)',
          fontFamily: 'Inter', margin: '2px 0 0',
        }}>
          All plans include ₹600/week coverage cap
        </p>
      </div>

      <div style={{ padding: '16px' }}>

        {/* PLAN CARDS */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          marginBottom: 20,
        }}>
          {PLANS.map(p => {
            const isSelected = selectedPlan === p.id
            return (
              <motion.div
                key={p.id}
                onClick={() => setSelectedPlan(p.id)}
                whileTap={{ scale: 0.99 }}
                style={{
                  background: isSelected ? p.bgColor : 'var(--bg-card)',
                  border: isSelected
                    ? `2px solid ${p.borderColor}`
                    : '2px solid var(--border)',
                  borderRadius: 16,
                  padding: 18,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                {/* Badge */}
                {p.badge && (
                  <div style={{
                    position: 'absolute',
                    top: -11,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: p.popular ? '#D97757' : '#0F0F0F',
                    color: 'white',
                    fontSize: 10, fontWeight: 700,
                    fontFamily: 'Inter',
                    padding: '3px 12px',
                    borderRadius: 999,
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.5px',
                  }}>
                    {p.badge}
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 12,
                }}>
                  <div>
                    <p style={{
                      fontFamily: 'Bricolage Grotesque',
                      fontSize: 18, fontWeight: 800,
                      color: 'var(--text-primary)',
                      margin: '0 0 2px',
                    }}>
                      {p.name}
                    </p>
                    <p style={{
                      fontSize: 12,
                      color: 'var(--text-tertiary)',
                      fontFamily: 'Inter', margin: 0,
                    }}>
                      {p.description}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 2,
                      justifyContent: 'flex-end',
                    }}>
                      <span style={{
                        fontFamily: 'Bricolage Grotesque',
                        fontSize: 28, fontWeight: 800,
                        color: isSelected ? '#D97757' : 'var(--text-primary)',
                        letterSpacing: -1,
                      }}>
                        ₹{p.price}
                      </span>
                      <span style={{
                        fontSize: 12,
                        color: 'var(--text-tertiary)',
                        fontFamily: 'Inter',
                      }}>
                        /wk
                      </span>
                    </div>
                    {/* Selected indicator */}
                    <div style={{
                      width: 22, height: 22,
                      borderRadius: 999,
                      background: isSelected ? '#D97757' : 'var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: 'auto',
                      marginTop: 4,
                      transition: 'all 0.15s',
                    }}>
                      {isSelected && (
                        <Check size={12} color="white" strokeWidth={3} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Features list */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}>
                  {p.features.map(f => (
                    <div key={f} style={{
                      display: 'flex',
                      gap: 8, alignItems: 'flex-start',
                    }}>
                      <div style={{
                        width: 16, height: 16,
                        borderRadius: 999,
                        background: '#ECFDF3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0, marginTop: 1,
                      }}>
                        <Check size={9} color="#12B76A" strokeWidth={3} />
                      </div>
                      <span style={{
                        fontSize: 12, fontFamily: 'Inter',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.4,
                      }}>
                        {f}
                      </span>
                    </div>
                  ))}
                  {p.notIncluded.map(f => (
                    <div key={f} style={{
                      display: 'flex',
                      gap: 8, alignItems: 'flex-start',
                    }}>
                      <div style={{
                        width: 16, height: 16,
                        borderRadius: 999,
                        background: '#F7F7F8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0, marginTop: 1,
                      }}>
                        <span style={{
                          fontSize: 9, color: '#C4C4C4',
                          lineHeight: 1,
                        }}>✕</span>
                      </div>
                      <span style={{
                        fontSize: 12, fontFamily: 'Inter',
                        color: 'var(--text-tertiary)',
                        lineHeight: 1.4,
                      }}>
                        {f}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* What you're getting */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 14,
          padding: '14px 16px',
          border: '1px solid var(--border-light)',
          marginBottom: 16,
        }}>
          <p style={{
            fontSize: 12, fontWeight: 700,
            fontFamily: 'Inter',
            color: 'var(--text-tertiary)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            margin: '0 0 10px',
          }}>
            You're selecting
          </p>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            <div>
              <p style={{
                fontFamily: 'Bricolage Grotesque',
                fontSize: 18, fontWeight: 700,
                color: 'var(--text-primary)', margin: 0,
              }}>
                {plan.name} Plan
              </p>
              <p style={{
                fontSize: 13,
                color: 'var(--text-secondary)',
                fontFamily: 'Inter', margin: '2px 0 0',
              }}>
                Weekly · ₹600 coverage cap · Auto-renews
              </p>
            </div>
            <p style={{
              fontFamily: 'Bricolage Grotesque',
              fontSize: 24, fontWeight: 800,
              color: '#D97757', margin: 0,
            }}>
              ₹{plan.price}
            </p>
          </div>
        </div>

        {/* WHAT HAPPENS NEXT — process explanation */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 14,
          padding: '14px 16px',
          border: '1px solid var(--border-light)',
          marginBottom: 16,
        }}>
          <p style={{
            fontSize: 12, fontWeight: 700,
            fontFamily: 'Inter',
            color: 'var(--text-tertiary)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            margin: '0 0 12px',
          }}>
            What happens after you buy?
          </p>
          {[
            { step: '1', emoji: '🛡️', text: 'Your coverage activates instantly — valid Mon 00:00 to Sun 23:59' },
            { step: '2', emoji: '📡', text: 'We monitor your zone 24/7 for IMD flood alerts, platform outages & curfews' },
            { step: '3', emoji: '⚡', text: 'When a trigger event is detected, we verify your delivery activity automatically' },
            { step: '4', emoji: '💸', text: 'Payout sent directly to your UPI within 2 hours — no claim forms needed' },
            { step: '5', emoji: '🔄', text: 'Plan auto-renews weekly. Cancel anytime from your Profile page' },
          ].map(item => (
            <div key={item.step} style={{
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              marginBottom: 10,
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.emoji}</span>
              <p style={{
                fontSize: 13, fontFamily: 'Inter',
                color: 'var(--text-secondary)',
                margin: 0, lineHeight: 1.5,
              }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <p style={{
          fontSize: 12, color: 'var(--text-tertiary)',
          fontFamily: 'Inter', textAlign: 'center',
          marginBottom: 12, lineHeight: 1.5,
        }}>
          By purchasing, you agree to our{' '}
          <span
            onClick={() => navigate('/terms')}
            style={{ color: '#D97757', cursor: 'pointer' }}
          >
            Terms
          </span>
          {' '}and{' '}
          <span
            onClick={() => navigate('/privacy')}
            style={{ color: '#D97757', cursor: 'pointer' }}
          >
            Privacy Policy
          </span>
        </p>
      </div>

      {/* STICKY BUY BUTTON */}
      <div style={{
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        padding: '12px 16px',
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-light)',
        zIndex: 60,
      }}>
        <motion.button
          onClick={handleBuy}
          disabled={loading}
          whileHover={!loading ? { scale: 1.01 } : {}}
          whileTap={!loading ? { scale: 0.97 } : {}}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: 12,
            border: 'none',
            background: loading
              ? '#E4E4E7'
              : 'linear-gradient(135deg,#D97757,#B85C3A)',
            color: loading ? '#9B9B9B' : 'white',
            fontSize: 16, fontWeight: 700,
            fontFamily: 'Inter', cursor: loading
              ? 'not-allowed' : 'pointer',
            boxShadow: loading
              ? 'none'
              : '0 4px 20px rgba(217,119,87,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            maxWidth: 560,
            margin: '0 auto',
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: 18, height: 18,
                border: '2px solid #9B9B9B',
                borderTopColor: 'transparent',
                borderRadius: 999,
                animation: 'spin 0.8s linear infinite',
              }} />
              Opening payment...
            </>
          ) : (
            <>
              <ShieldCheck size={18} />
              Buy {plan.name} — ₹{plan.price}/week
            </>
          )}
        </motion.button>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
