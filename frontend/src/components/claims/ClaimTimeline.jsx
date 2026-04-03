import { motion } from 'framer-motion'

const STEP_META = {
  TRIGGER_DETECTED: {
    label: 'Trigger Detected',
    icon: '⚠️',
    color: '#2E90FA',
    description: (claim) => `${claim.trigger_type || 'FLOOD'} event confirmed for ${claim.trigger_event?.city || claim.zone || 'your zone'}`,
  },
  ELIGIBILITY_CHECK: {
    label: 'Eligibility Check',
    icon: '🪪',
    color: '#7A5AF8',
    description: () => 'Minimum active days, platform verification, and zone eligibility checked',
  },
  FRAUD_CHECK: {
    label: 'Fraud Check',
    icon: '🛡️',
    color: '#F79009',
    description: (claim) => `Fraud score ${Math.round((claim.fraud_score || 0) * 100)}%`,
  },
  PAYOUT_CALCULATED: {
    label: 'Payout Calculated',
    icon: '🧮',
    color: '#D97757',
    description: (claim) => `Amount locked at ₹${claim.amount || 0}`,
  },
  TRANSFER_INITIATED: {
    label: 'Transfer Initiated',
    icon: '🏦',
    color: '#12B76A',
    description: () => 'Payment rail opened and transfer request queued',
  },
  PAYMENT_SUCCESS: {
    label: 'Payment Success',
    icon: '✅',
    color: '#12B76A',
    description: (claim) => `₹${claim.amount || 0} credited to registered UPI`,
  },
  PAYMENT_FAILED: {
    label: 'Payment Failed',
    icon: '❌',
    color: '#F04438',
    description: () => 'Transfer failed. Claim remains approved for retry.',
  },
}

const DEFAULT_STEPS = [
  'TRIGGER_DETECTED',
  'ELIGIBILITY_CHECK',
  'FRAUD_CHECK',
  'PAYOUT_CALCULATED',
  'TRANSFER_INITIATED',
  'PAYMENT_SUCCESS',
]

const formatStamp = (value) => {
  if (!value) return 'Pending'
  const date = new Date(value)
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const mapAuditToStep = (entry) => {
  const step = entry.step || ''
  if (step === 'TRIGGER_CONFIRMED') return 'TRIGGER_DETECTED'
  if (step === 'ELIGIBILITY_CHECK') return 'ELIGIBILITY_CHECK'
  if (step === 'PAYOUT_CALCULATED') return 'PAYOUT_CALCULATED'
  if (step === 'TRANSFER_INITIATED') return 'TRANSFER_INITIATED'
  if (step === 'PAYMENT_SUCCESS') return 'PAYMENT_SUCCESS'
  if (step === 'PAYMENT_FAILED') return 'PAYMENT_FAILED'
  return step
}

export const ClaimTimeline = ({ claim }) => {
  if (!claim) return null

  const auditByStep = {}
  ;(claim.payout_audit_log || []).forEach((entry) => {
    auditByStep[mapAuditToStep(entry)] = entry
  })

  const fraudCompleted = claim.fraud_score != null
  const timeline = DEFAULT_STEPS.map((step, index) => {
    const meta = STEP_META[step]
    const audit = auditByStep[step]
    const complete = step === 'FRAUD_CHECK'
      ? fraudCompleted
      : Boolean(audit) || (step === 'PAYMENT_SUCCESS' && claim.status === 'PAID')
    const failed = step === 'PAYMENT_SUCCESS' && claim.payout_status === 'FAILED'
    const timestamp = audit?.created_at
      || (step === 'FRAUD_CHECK' ? claim.updated_at || claim.created_at : null)
      || (step === 'PAYMENT_SUCCESS' && claim.paid_at)
    return {
      step,
      meta,
      audit,
      complete,
      failed,
      timestamp,
      index,
    }
  })

  if (claim.payout_status === 'FAILED' && !timeline.find((item) => item.step === 'PAYMENT_FAILED' && item.complete)) {
    timeline.push({
      step: 'PAYMENT_FAILED',
      meta: STEP_META.PAYMENT_FAILED,
      audit: auditByStep.PAYMENT_FAILED,
      complete: true,
      failed: true,
      timestamp: auditByStep.PAYMENT_FAILED?.created_at || claim.updated_at,
    })
  }

  const fraudChecks = Object.entries(claim.fraud_checks || {})

  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 20, border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-5">
        <p style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Inter', color: 'var(--text-tertiary)', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>
          Payment Timeline
        </p>
        <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Inter', color: claim.payout_status === 'FAILED' ? '#F04438' : '#12B76A' }}>
          {claim.payout_status || 'NOT_STARTED'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {timeline.map((item, index) => {
          const isLast = index === timeline.length - 1
          const color = item.failed ? '#F04438' : item.meta.color
          return (
            <div key={`${item.step}-${index}`} style={{ display: 'flex', gap: 12 }}>
              <div style={{ width: 34, display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <motion.div
                  initial={{ scale: 0.85, opacity: 0.6 }}
                  animate={{ scale: item.complete ? 1 : 0.92, opacity: 1 }}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: item.complete ? `${color}18` : 'var(--bg-secondary)',
                    border: `2px solid ${item.complete ? color : 'var(--border)'}`,
                    fontSize: 15,
                  }}
                >
                  {item.meta.icon}
                </motion.div>
                {!isLast && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 54 }}
                    style={{
                      width: 2,
                      background: item.complete ? `${color}` : 'var(--border)',
                      opacity: item.complete ? 0.35 : 0.2,
                      marginTop: 4,
                    }}
                  />
                )}
              </div>

              <div style={{ flex: 1, paddingBottom: isLast ? 0 : 16 }}>
                <div className="flex items-center justify-between gap-3">
                  <p style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Inter', color: 'var(--text-primary)', margin: 0 }}>
                    {item.meta.label}
                  </p>
                  <span style={{ fontSize: 11, fontFamily: 'Inter', color: 'var(--text-tertiary)' }}>
                    {formatStamp(item.timestamp)}
                  </span>
                </div>
                <p style={{ fontSize: 12, fontFamily: 'Inter', color: item.complete ? color : 'var(--text-secondary)', margin: '4px 0 0', fontWeight: 600 }}>
                  {item.meta.description(claim)}
                </p>
                {item.audit?.message && (
                  <p style={{ fontSize: 11, fontFamily: 'Inter', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>
                    {item.audit.message}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {fraudChecks.length > 0 && (
        <div style={{ marginTop: 18, padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Inter', color: 'var(--text-tertiary)', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 10px' }}>
            Fraud Signals
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
            {fraudChecks.slice(0, 8).map(([key, value]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: value?.result === 'FAIL' ? '#F04438' : value?.result === 'WARNING' ? '#F79009' : '#12B76A', fontSize: 11 }}>
                  {value?.result === 'FAIL' ? '●' : value?.result === 'WARNING' ? '◐' : '●'}
                </span>
                <span style={{ fontSize: 11, fontFamily: 'Inter', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                  {key.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
