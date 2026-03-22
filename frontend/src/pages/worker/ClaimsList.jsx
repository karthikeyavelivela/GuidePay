import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import BottomNav from '../../components/ui/BottomNav'
import TopBar from '../../components/ui/TopBar'
import Badge from '../../components/ui/Badge'
import { useClaimStore } from '../../store/claimStore'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
}

const FILTERS = ['All', 'Paid', 'Processing', 'Flagged']

const MOCK_CLAIMS = [
  { id: 'cl-001', type: 'FLOOD',   event: 'IMD Red Alert — Kondapur',     date: '2026-03-18', amount: 600, status: 'Paid' },
  { id: 'cl-002', type: 'OUTAGE',  event: 'Zepto outage — 3hrs',          date: '2026-03-10', amount: 450, status: 'Paid' },
  { id: 'cl-003', type: 'FLOOD',   event: 'Orange Alert — Hyderabad',     date: '2026-02-28', amount: 600, status: 'Processing' },
  { id: 'cl-004', type: 'CURFEW',  event: 'Section 144 — Kondapur',       date: '2026-02-14', amount: 600, status: 'Paid' },
  { id: 'cl-005', type: 'OUTAGE',  event: 'Swiggy down — partial',        date: '2026-01-30', amount: 0,   status: 'Flagged' },
]

const typeIcon = (type) => ({ FLOOD: '🌊', OUTAGE: '📱', CURFEW: '🚫' }[type] || '📋')

const statusVariant = (status) => ({
  Paid: 'success',
  Processing: 'warning',
  Flagged: 'danger',
}[status] || 'default')

export default function ClaimsList() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')

  const claims = MOCK_CLAIMS.filter(c => filter === 'All' || c.status === filter)

  return (
    <motion.div
      className="min-h-screen pb-24"
      style={{ background: 'var(--bg-secondary)' }}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <TopBar title="Claims" showBack />

      {/* Filter tabs */}
      <div style={{ padding: '12px 16px 0', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {FILTERS.map(f => (
          <motion.button
            key={f}
            onClick={() => setFilter(f)}
            whileTap={{ scale: 0.96 }}
            style={{
              padding: '6px 14px', borderRadius: 999, flexShrink: 0,
              fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif',
              border: filter === f ? 'none' : '1px solid var(--border)',
              background: filter === f ? '#D97757' : 'var(--bg-card)',
              color: filter === f ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            {f}
          </motion.button>
        ))}
      </div>

      <div style={{ padding: '12px 16px' }}>
        {claims.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>📋</span>
            <p style={{ fontSize: 16, fontWeight: 600, fontFamily: 'Bricolage Grotesque, sans-serif', color: 'var(--text-primary)', margin: '0 0 8px' }}>
              No claims yet
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-tertiary)', fontFamily: 'Inter, sans-serif', margin: 0 }}>
              You'll see payouts here when triggers fire
            </p>
          </div>
        ) : (
          <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
            {claims.map((claim, i) => (
              <motion.button
                key={claim.id}
                onClick={() => navigate(`/claim/${claim.id}`)}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', background: 'transparent', border: 'none',
                  borderBottom: i < claims.length - 1 ? '1px solid var(--border-light)' : 'none',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: 'var(--bg-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>
                  {typeIcon(claim.type)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {claim.event}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'Inter, sans-serif', margin: 0 }}>
                    {new Date(claim.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {claim.amount > 0 && (
                    <p style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Bricolage Grotesque, sans-serif', color: '#12B76A', margin: '0 0 4px' }}>
                      +₹{claim.amount}
                    </p>
                  )}
                  <Badge variant={statusVariant(claim.status)}>{claim.status}</Badge>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </motion.div>
  )
}
