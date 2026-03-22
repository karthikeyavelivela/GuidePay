import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera, MapPin, ChevronRight, Moon, Sun,
  LogOut, Shield, FileText, Bell, Globe, ArrowLeft,
} from 'lucide-react'
import BottomNav from '../../components/ui/BottomNav'
import ChatWidget from '../../components/chat/ChatWidget'
import ThemeToggle from '../../components/ui/ThemeToggle'
import { useWorkerStore } from '../../store/workerStore'
import { useThemeStore } from '../../store/themeStore'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
}

const BG_OPTIONS = [
  { id: 'default', label: 'Orange' },
  { id: 'city', label: 'City', gif: 'https://i.pinimg.com/originals/4a/01/59/4a01599692eaa47afc113c5a3b043ed8.gif' },
  { id: 'motion', label: 'Motion', gif: 'https://media1.tenor.com/m/PRUR2VCFT_EAAAAC/rickshaw-bike.gif' },
  { id: 'rain', label: 'Rain', gif: 'https://i.pinimg.com/originals/c2/29/0d/c2290de20311e9b3dccd962b0074fdc9.gif' },
]

export default function Profile() {
  const navigate = useNavigate()
  const { worker, logout } = useWorkerStore()
  const profileBg = useWorkerStore(s => s.profileBg) || 'default'
  const setProfileBg = useWorkerStore(s => s.setProfileBg)
  const { isDark } = useThemeStore()
  const [photo, setPhoto] = useState(worker?.photo || null)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const w = worker || {
    name: 'Ravi Kumar',
    phone: '+919876543210',
    zone: 'kondapur-hyderabad',
    riskScore: 0.82,
    riskTier: 'LOW',
    premium: 58,
  }
  const firstName = w.name?.split(' ')[0] || 'Ravi'
  const initials = `${w.name?.split(' ')[0]?.[0] || 'R'}${w.name?.split(' ')[1]?.[0] || 'K'}`

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPhoto(ev.target.result)
    reader.readAsDataURL(file)
    // TODO: upload to Firebase Storage
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const SECTIONS = [
    {
      title: 'Coverage',
      items: [
        { icon: Shield,   label: 'My coverage plan',  sub: 'Active · ₹600/week',     path: '/premium' },
        { icon: Bell,     label: 'Notifications',      sub: 'Alerts & reminders' },
        { icon: FileText, label: 'Policy documents',   sub: 'View & download' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Globe,
          label: 'Language',
          sub: 'English',
          right: <span className="text-[12px] font-body" style={{ color: 'var(--text-tertiary)' }}>EN ▾</span>,
        },
        {
          icon: isDark ? Sun : Moon,
          label: 'Dark mode',
          sub: isDark ? 'On' : 'Off',
          right: <ThemeToggle />,
        },
      ],
    },
    {
      title: 'Legal',
      items: [
        { icon: FileText, label: 'Terms of Service',  path: '/terms' },
        { icon: Shield,   label: 'Privacy Policy',    path: '/privacy' },
      ],
    },
  ]

  return (
    <motion.div
      className="min-h-screen pb-24"
      style={{ background: 'var(--bg-secondary)' }}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Header with GIF or gradient background */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden', flexShrink: 0 }}>
        {profileBg === 'default' ? (
          <motion.div
            style={{ position: 'absolute', inset: 0 }}
            animate={{
              background: [
                'linear-gradient(135deg, #D97757 0%, #B85C3A 100%)',
                'linear-gradient(135deg, #E08867 0%, #D97757 100%)',
                'linear-gradient(135deg, #D97757 0%, #B85C3A 100%)',
              ]
            }}
            transition={{ duration: 6, repeat: Infinity }}
          />
        ) : (
          <>
            <img
              key={profileBg}
              src={BG_OPTIONS.find(b => b.id === profileBg)?.gif}
              alt="profile background"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
          </>
        )}

        {/* Floating icons — only on gradient */}
        {profileBg === 'default' && ['🛵', '📦', '🌧️', '⚡', '🛡️'].map((icon, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl opacity-20"
            style={{ left: `${10 + i * 18}%`, top: `${20 + (i % 2) * 30}%` }}
            animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          >
            {icon}
          </motion.div>
        ))}

        {/* Back + title */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ArrowLeft size={20} color="white" />
          </button>
          <span className="text-white font-display font-semibold text-[17px]">Profile</span>
          <div style={{ width: 36 }} />
        </div>

        {/* BG picker */}
        <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 6, zIndex: 10 }}>
          {BG_OPTIONS.map(opt => (
            <motion.button
              key={opt.id}
              onClick={() => setProfileBg(opt.id)}
              whileTap={{ scale: 0.9 }}
              style={{
                padding: '5px 11px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                border: profileBg === opt.id ? '2px solid white' : '1px solid rgba(255,255,255,0.5)',
                background: profileBg === opt.id ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)',
                color: 'white',
                cursor: 'pointer',
                backdropFilter: 'blur(6px)',
                transition: 'all 0.2s',
              }}
            >
              {opt.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Photo + name — overlaps header */}
      <div className="px-4" style={{ marginTop: -44, position: 'relative', zIndex: 10 }}>
        <div className="flex items-end gap-4 mb-4">
          {/* Photo circle */}
          <div className="relative flex-shrink-0">
            <div
              className="rounded-full overflow-hidden flex items-center justify-center"
              style={{
                width: 88, height: 88,
                background: 'var(--brand)',
                border: '4px solid var(--bg-primary)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              {photo ? (
                <img src={photo} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <span className="font-display font-bold text-[28px] text-white">{initials}</span>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'var(--bg-primary)', border: '2px solid var(--bg-primary)', boxShadow: 'var(--shadow-sm)' }}
            >
              <Camera size={14} style={{ color: 'var(--brand)' }} />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          {/* Name + zone */}
          <div className="pb-1">
            <h2 className="font-display font-bold text-[20px]" style={{ color: 'var(--text-primary)' }}>
              {w.name}
            </h2>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={12} style={{ color: 'var(--text-tertiary)' }} />
              <span className="text-[12px] font-body" style={{ color: 'var(--text-tertiary)' }}>
                Kondapur, Hyderabad
              </span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Protected',  value: '₹1,200', sub: 'This month',  color: 'var(--brand)' },
            { label: 'Payouts',    value: '3',       sub: 'Total',       color: 'var(--text-primary)' },
            { label: 'Risk score', value: '0.82',    sub: 'Low risk',    color: 'var(--success)' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-3 text-center"
              style={{ background: 'var(--bg-primary)', boxShadow: 'var(--shadow-card)' }}
            >
              <p className="font-display font-bold text-[18px]" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px] font-body mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Sections */}
        {SECTIONS.map((section) => (
          <div key={section.title} className="mb-3">
            <p
              className="text-[11px] font-semibold font-body uppercase tracking-wider mb-1.5 px-1"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {section.title}
            </p>
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-primary)', boxShadow: 'var(--shadow-card)' }}>
              {section.items.map((item, i, arr) => {
                const Icon = item.icon
                return (
                  <motion.div
                    key={item.label}
                    className="flex items-center gap-3 px-4 py-3.5 cursor-pointer"
                    style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border-light)' : 'none' }}
                    whileTap={{ opacity: 0.7 }}
                    onClick={() => item.path && navigate(item.path)}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--bg-secondary)' }}
                    >
                      <Icon size={16} style={{ color: 'var(--text-secondary)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium font-body" style={{ color: 'var(--text-primary)' }}>
                        {item.label}
                      </p>
                      {item.sub && (
                        <p className="text-[12px] font-body mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                          {item.sub}
                        </p>
                      )}
                    </div>
                    {item.right ?? <ChevronRight size={16} style={{ color: 'var(--text-disabled)' }} />}
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Sign out */}
        <motion.button
          className="w-full mt-1 py-3.5 rounded-xl flex items-center justify-center gap-2"
          style={{ background: 'var(--danger-light)', border: '1px solid transparent' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
        >
          <LogOut size={16} style={{ color: 'var(--danger)' }} />
          <span className="text-[14px] font-semibold font-body" style={{ color: 'var(--danger)' }}>
            Sign out
          </span>
        </motion.button>

        <p className="text-center text-[12px] font-body mt-5 mb-2" style={{ color: 'var(--text-disabled)' }}>
          GuidePay v1.0 · Team SentinelX · KL University
        </p>
      </div>

      <ChatWidget />
      <BottomNav />
    </motion.div>
  )
}
