import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Download, Share2, CheckCircle, ArrowRight, ArrowLeft, Home } from 'lucide-react'
import { useWorkerStore } from '../../store/workerStore'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const activePolicy = useWorkerStore(s => s.activePolicy)
  const worker = useWorkerStore(s => s.worker)

  // Redirect to coverage if no active policy
  if (!activePolicy) {
    navigate('/coverage')
    return null
  }

  const receiptId = activePolicy.paymentId || ('GP-' + Date.now().toString().slice(-8))
  const planName = activePolicy.planName || 'Standard'
  const planPrice = activePolicy.price || 58

  const today = activePolicy.weekStart ? new Date(activePolicy.weekStart) : new Date()
  const weekEnd = activePolicy.weekEnd ? new Date(activePolicy.weekEnd) : new Date(Date.now() + 7 * 86400000)

  const formatDate = (d) => d.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-secondary)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
      padding: '0 16px 24px',
    }}>
      {/* Top bar with back button */}
      <div style={{
        width: '100%',
        maxWidth: 440,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 0',
        position: 'sticky',
        top: 0,
        background: 'var(--bg-secondary)',
        zIndex: 10,
      }}>
        <motion.button
          onClick={() => navigate('/dashboard')}
          whileTap={{ scale: 0.9 }}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 10,
            width: 40, height: 40,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ArrowLeft size={18} style={{ color: 'var(--text-primary)' }} />
        </motion.button>
        <motion.button
          onClick={() => navigate('/dashboard')}
          whileTap={{ scale: 0.9 }}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 10,
            width: 40, height: 40,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Home size={18} style={{ color: 'var(--text-primary)' }} />
        </motion.button>
      </div>

      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Success animation */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            style={{
              width: 80, height: 80, borderRadius: 999,
              background: 'var(--success-light)', border: '2px solid var(--success)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <CheckCircle size={36} color="var(--success)" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8,
            }}
          >
            You're protected! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ fontSize: 15, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}
          >
            Your {planName} plan is now active. We'll monitor your zone 24/7 and auto-pay you via UPI if any trigger fires.
          </motion.p>
        </div>

        {/* RECEIPT CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            background: 'var(--bg-card)', borderRadius: 20, overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-light)', marginBottom: 20,
          }}
        >
          {/* Receipt header */}
          <div style={{
            background: 'linear-gradient(135deg, #D97757, #B85C3A)',
            padding: '20px 20px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <ShieldCheck size={18} color="white" />
              <span style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: 16, fontWeight: 700, color: 'white',
              }}>
                GuidePay Receipt
              </span>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontFamily: 'Inter, sans-serif', margin: 0 }}>
              {receiptId}
            </p>
          </div>

          {/* Receipt body */}
          <div style={{ padding: 20 }}>
            {[
              { label: 'Plan',              value: `${planName} Plan` },
              { label: 'Amount paid',       value: `₹${planPrice}.00` },
              { label: 'Payment method',    value: 'UPI' },
              { label: 'Coverage period',   value: `${formatDate(today)} – ${formatDate(weekEnd)}` },
              { label: 'Coverage cap',      value: `₹${activePolicy.coverage || 600} / week` },
              { label: 'Triggers covered',  value: 'Flood · Outage · Curfew' },
              { label: 'Payout UPI',        value: worker?.phone ? `${worker.phone}@upi` : 'ravi.kumar@okaxis' },
              { label: 'Status',            value: '✓ Active', success: true },
            ].map((row, i) => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', padding: '10px 0',
                borderBottom: i < 7 ? '1px solid var(--border-light)' : 'none', gap: 16,
              }}>
                <span style={{ fontSize: 13, color: 'var(--text-tertiary)', fontFamily: 'Inter, sans-serif', flexShrink: 0 }}>
                  {row.label}
                </span>
                <span style={{
                  fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif',
                  color: row.success ? 'var(--success)' : 'var(--text-primary)', textAlign: 'right',
                }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* What happens now */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            background: 'var(--bg-card)',
            borderRadius: 14,
            border: '1px solid var(--border-light)',
            padding: '14px 16px',
            marginBottom: 16,
          }}
        >
          <p style={{
            fontSize: 12, fontWeight: 700, fontFamily: 'Inter',
            color: 'var(--text-tertiary)',
            letterSpacing: '1px', textTransform: 'uppercase',
            margin: '0 0 10px',
          }}>
            What happens now?
          </p>
          {[
            { emoji: '📡', text: 'We start monitoring your zone in real-time for flood alerts, platform outages, and curfew orders.' },
            { emoji: '⚡', text: 'If a trigger event is detected, we verify your recent delivery activity automatically.' },
            { emoji: '💸', text: 'Your payout lands in your UPI within 2 hours — no claim forms needed.' },
            { emoji: '🔄', text: 'Your plan auto-renews next week. You can cancel any time from Profile.' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start',
              marginBottom: i < 3 ? 10 : 0,
            }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>{item.emoji}</span>
              <p style={{
                fontSize: 13, fontFamily: 'Inter',
                color: 'var(--text-secondary)',
                margin: 0, lineHeight: 1.5,
              }}>
                {item.text}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ display: 'flex', gap: 10, marginBottom: 12 }}
        >
          {[
            { label: 'Download', icon: Download },
            { label: 'Share', icon: Share2 },
          ].map(({ label, icon: Icon }) => (
            <motion.button
              key={label}
              whileTap={{ scale: 0.97 }}
              style={{
                flex: 1, padding: '12px', borderRadius: 10,
                border: '1.5px solid var(--border)', background: 'var(--bg-card)',
                fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif',
                color: 'var(--text-primary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <Icon size={14} /> {label}
            </motion.button>
          ))}
        </motion.div>

        <motion.button
          onClick={() => navigate('/dashboard')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.97 }}
          style={{
            width: '100%', padding: '14px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #D97757, #B85C3A)',
            color: 'white', fontSize: 15, fontWeight: 700,
            fontFamily: 'Inter, sans-serif', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 4px 16px rgba(217,119,87,0.35)',
          }}
        >
          Go to my dashboard <ArrowRight size={16} />
        </motion.button>
      </div>
    </div>
  )
}
