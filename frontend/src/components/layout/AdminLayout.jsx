import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, FileCheck, BarChart2, Map, Settings, ShieldCheck } from 'lucide-react'

const ADMIN_NAV = [
  { label: 'Overview',   icon: LayoutDashboard, path: '/admin' },
  { label: 'Claims',     icon: FileCheck,        path: '/admin/claims' },
  { label: 'Analytics',  icon: BarChart2,        path: '/admin/analytics' },
  { label: 'Settings',   icon: Settings,         path: '/admin/settings' },
]

function AdminSidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside
      style={{
        width: 260,
        background: 'var(--bg-primary)',
        borderRight: '1px solid var(--border-light)',
        padding: '24px 12px',
        flexShrink: 0,
        minHeight: '100vh',
      }}
    >
      <div className="flex items-center gap-2 px-3 mb-8">
        <ShieldCheck size={24} style={{ color: 'var(--brand)' }} />
        <div>
          <p className="font-display font-bold text-[16px]" style={{ color: 'var(--text-primary)' }}>
            SentinelX
          </p>
          <p className="text-[11px] font-body" style={{ color: 'var(--text-tertiary)' }}>
            Admin Panel
          </p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {ADMIN_NAV.map((item) => {
          const active = location.pathname === item.path
          const Icon = item.icon
          return (
            <motion.button
              key={item.label}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-3 px-3 py-3 rounded-[10px] w-full text-left transition-colors"
              style={{
                background: active ? 'var(--brand-light)' : 'transparent',
                color: active ? 'var(--brand)' : 'var(--text-secondary)',
              }}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
              <span className="font-body font-semibold text-[14px]">{item.label}</span>
            </motion.button>
          )
        })}
      </nav>

      <div className="mt-auto pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-3 py-2 w-full text-left"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <span className="text-[12px] font-body">← Worker app</span>
        </button>
      </div>
    </aside>
  )
}

export default function AdminLayout({ children, breadcrumb }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-secondary)' }}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <div
          className="sticky top-0 z-30 flex items-center px-6 h-14"
          style={{
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <p className="text-[13px] font-body" style={{ color: 'var(--text-tertiary)' }}>
            Admin {breadcrumb ? `/ ${breadcrumb}` : '/ Overview'}
          </p>
        </div>
        {/* Content */}
        <main className="flex-1 p-6">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
