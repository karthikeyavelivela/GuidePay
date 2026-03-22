import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, ShieldCheck, AlertTriangle, CheckCircle } from 'lucide-react'

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'alert',
    icon: AlertTriangle,
    iconColor: '#F79009',
    iconBg: '#FFFAEB',
    title: '78% flood risk tomorrow',
    body: 'Kondapur zone · Coverage auto-extends',
    time: '2 min ago',
    read: false,
  },
  {
    id: 2,
    type: 'payout',
    icon: CheckCircle,
    iconColor: '#12B76A',
    iconBg: '#ECFDF3',
    title: '₹600 credited to your UPI',
    body: 'IMD Red Alert payout processed',
    time: '1 hour ago',
    read: false,
  },
  {
    id: 3,
    type: 'premium',
    icon: ShieldCheck,
    iconColor: '#D97757',
    iconBg: '#FDF1ED',
    title: 'Coverage renewed',
    body: 'Week Mar 21–27 · ₹58 deducted',
    time: '2 days ago',
    read: true,
  },
]

export const NotificationBell = () => {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

  const unread = notifications.filter(n => !n.read).length

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div style={{ position: 'relative' }}>
      <motion.button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative',
          background: open ? 'var(--bg-secondary)' : 'none',
          border: 'none',
          cursor: 'pointer',
          width: 36,
          height: 36,
          borderRadius: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        whileTap={{ scale: 0.9 }}
      >
        <Bell size={20} style={{ color: 'var(--text-secondary)' }} />
        {unread > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute',
              top: 6, right: 6,
              width: 8, height: 8,
              borderRadius: 999,
              background: '#F04438',
              border: '1.5px solid var(--bg-card, white)',
            }}
          />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 40 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{
                position: 'absolute',
                top: 44,
                right: 0,
                width: 320,
                background: 'var(--bg-card, #FFFFFF)',
                borderRadius: 16,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '1px solid var(--border)',
                zIndex: 50,
                overflow: 'hidden',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: '1px solid var(--border-light)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p style={{
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    margin: 0,
                  }}>
                    Notifications
                  </p>
                  {unread > 0 && (
                    <span style={{
                      background: '#F04438',
                      color: 'white',
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: 'Inter, sans-serif',
                      padding: '1px 7px',
                      borderRadius: 999,
                    }}>
                      {unread}
                    </span>
                  )}
                </div>
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 12,
                      color: 'var(--brand, #D97757)',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {notifications.map((notif, i) => {
                  const Icon = notif.icon
                  return (
                    <motion.div
                      key={notif.id}
                      style={{
                        display: 'flex',
                        gap: 12,
                        padding: '12px 16px',
                        borderBottom: i < notifications.length - 1
                          ? '1px solid var(--border-light)'
                          : 'none',
                        background: notif.read ? 'transparent' : 'rgba(217,119,87,0.03)',
                        cursor: 'pointer',
                      }}
                      whileHover={{ background: 'var(--bg-secondary)' }}
                      onClick={() => {
                        setNotifications(prev =>
                          prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
                        )
                      }}
                    >
                      <div style={{
                        width: 36, height: 36,
                        borderRadius: 999,
                        background: notif.iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon size={16} style={{ color: notif.iconColor }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: 13,
                          fontWeight: notif.read ? 400 : 600,
                          color: 'var(--text-primary)',
                          fontFamily: 'Inter, sans-serif',
                          margin: 0,
                          marginBottom: 2,
                        }}>
                          {notif.title}
                        </p>
                        <p style={{
                          fontSize: 12,
                          color: 'var(--text-secondary)',
                          fontFamily: 'Inter, sans-serif',
                          margin: 0,
                          marginBottom: 4,
                          lineHeight: 1.4,
                        }}>
                          {notif.body}
                        </p>
                        <p style={{
                          fontSize: 11,
                          color: 'var(--text-tertiary)',
                          fontFamily: 'Inter, sans-serif',
                          margin: 0,
                        }}>
                          {notif.time}
                        </p>
                      </div>
                      {!notif.read && (
                        <div style={{
                          width: 7, height: 7,
                          borderRadius: 999,
                          background: 'var(--brand, #D97757)',
                          flexShrink: 0,
                          marginTop: 4,
                        }} />
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationBell
