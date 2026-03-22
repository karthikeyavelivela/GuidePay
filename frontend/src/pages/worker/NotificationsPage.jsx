import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Bell, X } from 'lucide-react'
import TopBar from '../../components/ui/TopBar'
import BottomNav from '../../components/ui/BottomNav'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
}

const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    group: 'Today',
    icon: '⚠️',
    title: '78% flood risk tomorrow',
    body: 'Kondapur zone · Coverage auto-extended. No action needed.',
    time: '2 hours ago',
    read: false,
    color: '#F79009',
  },
  {
    id: 'n2',
    group: 'Today',
    icon: '✅',
    title: '₹600 credited to your UPI',
    body: 'IMD Red Alert payout · ravi.kumar@okaxis',
    time: '5 hours ago',
    read: false,
    color: '#12B76A',
  },
  {
    id: 'n3',
    group: 'This week',
    icon: '🛡️',
    title: 'Coverage renewed',
    body: 'Your weekly coverage (Mar 21–27) is now active.',
    time: 'Mar 21',
    read: true,
    color: '#D97757',
  },
  {
    id: 'n4',
    group: 'This week',
    icon: '📊',
    title: 'Risk score updated',
    body: 'Your score improved to 0.84 · ₹7 discount applied.',
    time: 'Mar 20',
    read: true,
    color: '#7C3AED',
  },
  {
    id: 'n5',
    group: 'Earlier',
    icon: '🌊',
    title: 'Flood watch: Hyderabad',
    body: 'IMD forecasts heavy rain this weekend. Stay prepared.',
    time: 'Mar 17',
    read: true,
    color: '#2E90FA',
  },
]

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)

  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  const clearAll = () => setNotifications([])

  const groups = [...new Set(notifications.map(n => n.group))]

  return (
    <motion.div
      className="min-h-screen pb-24"
      style={{ background: 'var(--bg-secondary)' }}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <TopBar title="Notifications" showBack />

      {notifications.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px 0' }}>
          <button
            onClick={clearAll}
            style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: '#D97757', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Clear all
          </button>
        </div>
      )}

      <div style={{ padding: '8px 16px' }}>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 100 }}>
            <div style={{ width: 72, height: 72, borderRadius: 999, background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: 'var(--shadow-card)' }}>
              <Bell size={28} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Bricolage Grotesque, sans-serif', color: 'var(--text-primary)', margin: '0 0 8px' }}>
              All caught up
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-tertiary)', fontFamily: 'Inter, sans-serif', margin: 0 }}>
              No new notifications
            </p>
          </div>
        ) : (
          groups.map(group => (
            <div key={group} style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Inter, sans-serif', color: 'var(--text-tertiary)', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 8px 4px' }}>
                {group}
              </p>

              <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
                <AnimatePresence>
                  {notifications.filter(n => n.group === group).map((n, i, arr) => (
                    <motion.div
                      key={n.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onClick={() => markRead(n.id)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 12,
                        padding: '14px 16px',
                        borderBottom: i < arr.length - 1 ? '1px solid var(--border-light)' : 'none',
                        background: n.read ? 'transparent' : `${n.color}08`,
                        cursor: 'pointer', position: 'relative',
                      }}
                    >
                      {!n.read && (
                        <div style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: 999, background: n.color }} />
                      )}
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${n.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                        {n.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <p style={{ fontSize: 14, fontWeight: n.read ? 500 : 700, fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)', margin: '0 0 3px' }}>
                            {n.title}
                          </p>
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'Inter, sans-serif', flexShrink: 0 }}>{n.time}</span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', margin: 0, lineHeight: 1.4 }}>
                          {n.body}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </motion.div>
  )
}
