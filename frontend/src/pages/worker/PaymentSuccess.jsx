import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Download, Share2, CheckCircle, ArrowRight } from 'lucide-react'

export default function PaymentSuccess() {
  const navigate = useNavigate()
  const receiptId = 'GP-RZP-' + Date.now().toString().slice(-8)
  const today = new Date()
  const weekEnd = new Date(today)
  weekEnd.setDate(today.getDate() + 7)

  const formatDate = (d) => d.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <div style={{
      minHeight: '100vh', background: '#FAFAFA',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Success animation */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            style={{
              width: 80, height: 80, borderRadius: 999,
              background: '#ECFDF3', border: '2px solid #12B76A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <CheckCircle size={36} color="#12B76A" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: 28, fontWeight: 800, color: '#0F0F0F', marginBottom: 8,
            }}
          >
            You're protected! 🎉
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ fontSize: 15, color: '#6B6B6B', fontFamily: 'Inter, sans-serif', lineHeight: 1.5 }}
          >
            Your first week of income protection starts now. We'll auto-pay you if any trigger fires.
          </motion.p>
        </div>

        {/* RECEIPT CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            background: 'white', borderRadius: 20, overflow: 'hidden',
            boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
            border: '1px solid #F4F4F5', marginBottom: 20,
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
              { label: 'Amount paid',      value: '₹58.00' },
              { label: 'Payment method',   value: 'UPI / Razorpay' },
              { label: 'Coverage period',  value: `${formatDate(today)} – ${formatDate(weekEnd)}` },
              { label: 'Coverage cap',     value: '₹600 / week' },
              { label: 'Triggers covered', value: 'Flood · Outage · Curfew' },
              { label: 'Payout UPI',       value: 'ravi.kumar@okaxis' },
              { label: 'Status',           value: '✓ Active', success: true },
            ].map((row, i) => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', padding: '10px 0',
                borderBottom: i < 6 ? '1px solid #F4F4F5' : 'none', gap: 16,
              }}>
                <span style={{ fontSize: 13, color: '#9B9B9B', fontFamily: 'Inter, sans-serif', flexShrink: 0 }}>
                  {row.label}
                </span>
                <span style={{
                  fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif',
                  color: row.success ? '#12B76A' : '#0F0F0F', textAlign: 'right',
                }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
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
                border: '1.5px solid #E4E4E7', background: 'white',
                fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif',
                color: '#0F0F0F', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <Icon size={14} /> {label}
            </motion.button>
          ))}
        </motion.div>

        <motion.button
          onClick={() => navigate('/onboarding')}
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
