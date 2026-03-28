import { motion } from 'framer-motion'

const STAGE_CONFIG = {
  DETECTED: {
    label: 'Event Detected',
    icon: '🌧️',
    color: '#2E90FA',
    description: (claim) =>
      `${claim.trigger_type || 'FLOOD'} Alert — ${claim.zone || 'Your zone'}`,
    subtext: 'IMD SACHET RSS feed confirmed',
  },
  ACTIVITY_VERIFIED: {
    label: 'Your Activity Verified',
    icon: '✓',
    color: '#12B76A',
    description: (claim) =>
      claim.last_order_age_minutes
        ? `Last delivery: ${Math.round(claim.last_order_age_minutes)} mins ago`
        : 'Delivery activity confirmed',
    subtext: 'Platform activity check passed',
  },
  FRAUD_CHECKED: {
    label: 'Fraud Check Passed',
    icon: '🛡️',
    color: '#12B76A',
    description: (claim) =>
      `${claim.fraud_flags?.length === 0
        ? '7/7 signals clear'
        : `${7 - (claim.fraud_flags?.length || 0)}/7 signals clear`
      } · Score: ${((claim.fraud_score || 0.04) * 100).toFixed(0)}%`,
    subtext: 'Anti-spoofing engine verified',
  },
  APPROVED: {
    label: 'Auto-Approved',
    icon: '⚡',
    color: '#D97757',
    description: () => 'No manual review needed',
    subtext: 'AI confidence above threshold',
  },
  PAID: {
    label: 'Payout Sent',
    icon: '💰',
    color: '#12B76A',
    description: (claim) =>
      `₹${claim.amount} sent to your UPI`,
    subtext: 'Transfer complete',
  },
}

const PENDING_STAGE = {
  label: 'Payout Pending',
  icon: '⏳',
  color: '#F79009',
  description: () => 'Expected within 2 hours',
  subtext: 'Processing payment',
}

export const ClaimTimeline = ({ claim }) => {
  if (!claim) return null

  const getStages = () => {
    const stages = ['DETECTED', 'ACTIVITY_VERIFIED',
                    'FRAUD_CHECKED', 'APPROVED']
    const isPaid = claim.status === 'PAID'

    return stages.map((key, i) => {
      const isComplete = isPaid ||
        claim.status === 'AUTO_APPROVED' ||
        i < 3
      return {
        key,
        config: STAGE_CONFIG[key],
        complete: isComplete,
        timestamp: claim.created_at
          ? new Date(new Date(claim.created_at).getTime()
              + i * 45000)
          : null,
      }
    })
  }

  const stages = getStages()
  const isPaid = claim.status === 'PAID'

  const formatTime = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 16,
      padding: 20,
      border: '1px solid var(--border)',
    }}>
      <p style={{
        fontSize: 11, fontWeight: 700,
        fontFamily: 'Inter',
        color: 'var(--text-tertiary)',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        margin: '0 0 20px',
      }}>
        Claim Timeline
      </p>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}>
        {[...stages, isPaid
          ? { key: 'PAID_FINAL', config: STAGE_CONFIG.PAID, complete: true,
              timestamp: claim.paid_at ? new Date(claim.paid_at) :
                (claim.created_at ? new Date(new Date(claim.created_at).getTime() + 4 * 45000) : null) }
          : { key: 'PENDING', config: PENDING_STAGE,
              complete: false, timestamp: null }
        ].filter(Boolean).map((stage, i, arr) => {
          const isLast = i === arr.length - 1

          return (
            <div key={stage.key} style={{
              display: 'flex',
              gap: 12,
              position: 'relative',
            }}>
              {/* Left: icon + line */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 32,
                flexShrink: 0,
              }}>
                <motion.div
                  initial={stage.complete
                    ? { scale: 0 } : {}}
                  animate={stage.complete
                    ? { scale: 1 } : {}}
                  transition={{ delay: i * 0.15,
                    type: 'spring' }}
                  style={{
                    width: 32, height: 32,
                    borderRadius: 999,
                    background: stage.complete
                      ? `${stage.config.color}15`
                      : 'var(--bg-secondary)',
                    border: stage.complete
                      ? `2px solid ${stage.config.color}`
                      : '2px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    flexShrink: 0,
                    zIndex: 1,
                  }}
                >
                  {stage.config.icon}
                </motion.div>

                {/* Connecting line */}
                {!isLast && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: '100%' }}
                    transition={{ delay: i * 0.15 + 0.1,
                      duration: 0.3 }}
                    style={{
                      width: 2,
                      flex: 1,
                      minHeight: 24,
                      background: stage.complete
                        ? stage.config.color
                        : 'var(--border)',
                      opacity: stage.complete ? 0.3 : 0.2,
                      marginTop: 4,
                    }}
                  />
                )}
              </div>

              {/* Right: content */}
              <div style={{
                flex: 1,
                paddingBottom: isLast ? 0 : 20,
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 2,
                }}>
                  <p style={{
                    fontSize: 13, fontWeight: 700,
                    fontFamily: 'Inter',
                    color: stage.complete
                      ? 'var(--text-primary)'
                      : 'var(--text-tertiary)',
                    margin: 0,
                  }}>
                    {stage.config.label}
                  </p>
                  {stage.timestamp && stage.complete && (
                    <span style={{
                      fontSize: 11, fontFamily: 'Inter',
                      color: 'var(--text-tertiary)',
                      flexShrink: 0,
                      marginLeft: 8,
                    }}>
                      {formatTime(stage.timestamp)}
                    </span>
                  )}
                </div>
                <p style={{
                  fontSize: 12, fontFamily: 'Inter',
                  color: stage.complete
                    ? stage.config.color
                    : 'var(--text-tertiary)',
                  margin: '0 0 2px',
                  fontWeight: 600,
                }}>
                  {stage.config.description(claim)}
                </p>
                {stage.complete && (
                  <p style={{
                    fontSize: 11, fontFamily: 'Inter',
                    color: 'var(--text-tertiary)',
                    margin: 0,
                  }}>
                    {stage.config.subtext}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Fraud check detail */}
      {claim.fraud_checks && (
        <div style={{
          marginTop: 16,
          padding: '12px 14px',
          background: 'var(--bg-secondary)',
          borderRadius: 10,
          border: '1px solid var(--border-light)',
        }}>
          <p style={{
            fontSize: 11, fontWeight: 700,
            fontFamily: 'Inter',
            color: 'var(--text-tertiary)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            margin: '0 0 8px',
          }}>
            Fraud Check Detail
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '6px 12px',
          }}>
            {Object.entries(claim.fraud_checks)
              .slice(0, 6)
              .map(([key, val]) => (
              <div key={key} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}>
                <span style={{
                  fontSize: 10,
                  color: val?.result === 'PASS'
                    ? '#12B76A' : '#F04438',
                }}>
                  {val?.result === 'PASS' ? '✓' : '✗'}
                </span>
                <span style={{
                  fontSize: 11, fontFamily: 'Inter',
                  color: 'var(--text-secondary)',
                  textTransform: 'capitalize',
                }}>
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
