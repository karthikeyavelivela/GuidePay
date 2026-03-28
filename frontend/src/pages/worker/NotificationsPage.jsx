import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useWorkerStore } from '../../store/workerStore'

const DEFAULT_NOTIFICATIONS = [
  {
    id: '1',
    type: 'PAYOUT',
    title: '₹600 credited to your UPI',
    body: 'Flood claim #CLM-A4F2 auto-processed',
    time: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    icon: '💰',
    color: '#12B76A',
    link: '/claims',
  },
  {
    id: '2',
    type: 'ALERT',
    title: 'Flood alert in your zone',
    body: 'IMD Orange Alert — Kondapur, Hyderabad',
    time: new Date(Date.now() - 7200000).toISOString(),
    read: false,
    icon: '🌧️',
    color: '#2E90FA',
    link: '/forecast',
  },
  {
    id: '3',
    type: 'COVERAGE',
    title: 'Coverage renewed automatically',
    body: 'Standard Plan · ₹58 debited',
    time: new Date(Date.now() - 86400000).toISOString(),
    read: true,
    icon: '🛡️',
    color: '#D97757',
    link: '/coverage',
  },
  {
    id: '4',
    type: 'SYSTEM',
    title: 'Risk score updated',
    body: 'Your score improved to 82/100 · Premium unchanged',
    time: new Date(Date.now() - 172800000).toISOString(),
    read: true,
    icon: '📊',
    color: '#7C3AED',
    link: '/risk-score',
  },
  {
    id: '5',
    type: 'INFO',
    title: 'GuidePay is watching your zone',
    body: 'Monsoon season active · Stay protected',
    time: new Date(Date.now() - 259200000).toISOString(),
    read: true,
    icon: '👁️',
    color: '#D97757',
  },
]

const timeLabel = (iso) => {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const Notifications = () => {
  const navigate = useNavigate()
  const storeNotifs = useWorkerStore(s => s.notifications)
  
  // Merge store notifications with defaults
  const all = [
    ...(storeNotifs || []),
    ...DEFAULT_NOTIFICATIONS,
  ].slice(0, 20)

  // Group by today / yesterday / older
  const groups = {
    'Today': all.filter(n => {
      const diff = Date.now() - new Date(n.time).getTime()
      return diff < 86400000
    }),
    'Yesterday': all.filter(n => {
      const diff = Date.now() - new Date(n.time).getTime()
      return diff >= 86400000 && diff < 172800000
    }),
    'Earlier': all.filter(n => {
      const diff = Date.now() - new Date(n.time).getTime()
      return diff >= 172800000
    }),
  }

  const unreadCount = all.filter(n => !n.read).length

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      paddingBottom: 80,
    }}>
      {/* TopBar */}
      <div style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-light)',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <button onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none',
            cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={22}
            color="var(--text-primary)"/>
        </button>
        <h1 style={{
          fontFamily: 'Bricolage Grotesque',
          fontSize: 18, fontWeight: 800,
          color: 'var(--text-primary)', margin: 0,
          flex: 1,
        }}>
          Notifications
        </h1>
        {unreadCount > 0 && (
          <span style={{
            background: '#D97757',
            color: 'white',
            fontSize: 11, fontWeight: 700,
            fontFamily: 'Inter',
            padding: '2px 8px',
            borderRadius: 999,
          }}>
            {unreadCount} new
          </span>
        )}
      </div>

      <div style={{ padding: '8px 0' }}>
        {Object.entries(groups)
          .filter(([, items]) => items.length > 0)
          .map(([group, items]) => (
          <div key={group}>
            <p style={{
              fontSize: 11, fontWeight: 700,
              fontFamily: 'Inter',
              color: 'var(--text-tertiary)',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              padding: '12px 16px 6px',
              margin: 0,
            }}>
              {group}
            </p>
            {items.map((notif, i) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => notif.link
                  && navigate(notif.link)}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '14px 16px',
                  background: notif.read
                    ? 'transparent'
                    : 'rgba(217,119,87,0.04)',
                  borderBottom:
                    '1px solid var(--border-light)',
                  cursor: notif.link ? 'pointer' : 'default',
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 40, height: 40,
                  borderRadius: 12,
                  background: `${notif.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  flexShrink: 0,
                }}>
                  {notif.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 8,
                  }}>
                    <p style={{
                      fontSize: 13, fontWeight: notif.read
                        ? 500 : 700,
                      fontFamily: 'Inter',
                      color: 'var(--text-primary)',
                      margin: 0,
                    }}>
                      {notif.title}
                    </p>
                    <span style={{
                      fontSize: 10, fontFamily: 'Inter',
                      color: 'var(--text-tertiary)',
                      flexShrink: 0,
                    }}>
                      {timeLabel(notif.time)}
                    </span>
                  </div>
                  <p style={{
                    fontSize: 12, fontFamily: 'Inter',
                    color: 'var(--text-secondary)',
                    margin: '2px 0 0',
                  }}>
                    {notif.body}
                  </p>
                </div>

                {/* Unread dot */}
                {!notif.read && (
                  <div style={{
                    width: 7, height: 7,
                    borderRadius: 999,
                    background: '#D97757',
                    flexShrink: 0,
                    marginTop: 6,
                  }}/>
                )}
              </motion.div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Notifications
