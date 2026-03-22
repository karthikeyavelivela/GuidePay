import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Filter } from 'lucide-react'
import { useState } from 'react'
import TopBar from '../../components/ui/TopBar'
import Badge from '../../components/ui/Badge'
import { MOCK_ADMIN } from '../../services/mockData'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
}

const ADMIN_TABS = [
  { id: 'overview',  label: 'Overview',  path: '/admin' },
  { id: 'claims',    label: 'Claims',    path: '/admin/claims' },
  { id: 'analytics', label: 'Analytics', path: '/admin/analytics' },
]

function AdminBottomNav({ active }) {
  const navigate = useNavigate()
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white border-t border-grey-200">
      <div className="flex h-14">
        {ADMIN_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`flex-1 flex items-center justify-center text-[13px] font-semibold font-body transition-colors ${active === tab.id ? 'text-brand border-t-2 border-brand' : 'text-grey-400'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ClaimsQueue() {
  const { claimsQueue } = MOCK_ADMIN
  const [filter, setFilter] = useState('ALL')

  const filters = ['ALL', 'AUTO_APPROVED', 'MANUAL_REVIEW']

  const filtered = filter === 'ALL'
    ? claimsQueue
    : claimsQueue.filter((c) => c.status === filter)

  return (
    <motion.div
      className="min-h-screen bg-grey-50 pb-20"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <TopBar title="Claims Queue" bgClass="bg-grey-50" />

      <div className="px-4 mt-3">
        {/* Search */}
        <div className="flex items-center gap-3 px-4 h-[48px] rounded-input border-[1.5px] border-grey-200 bg-white mb-3">
          <Search size={16} className="text-grey-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search worker or claim ID..."
            className="flex-1 text-[14px] font-body text-[#0F0F0F] placeholder:text-grey-300 outline-none bg-transparent"
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-pill text-[12px] font-semibold font-body transition-colors ${
                filter === f
                  ? 'bg-brand-light text-brand border border-brand'
                  : 'bg-white text-grey-500 border border-grey-200'
              }`}
            >
              {f === 'ALL' ? 'All' : f === 'AUTO_APPROVED' ? 'Auto-approved' : 'Manual review'}
            </button>
          ))}
        </div>

        {/* Claims */}
        <div className="bg-white rounded-card shadow-card overflow-hidden">
          {filtered.map((claim, i) => (
            <div
              key={claim.id}
              className={`p-4 ${i < filtered.length - 1 ? 'border-b border-grey-50' : ''} ${claim.status === 'MANUAL_REVIEW' ? 'bg-danger-light' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-[15px] font-semibold font-body text-[#0F0F0F]">{claim.name}</p>
                  <p className="text-[13px] text-[#6B6B6B] font-body mt-0.5">
                    {claim.type} · ₹{claim.amount} · {claim.id}
                  </p>
                  {claim.flag && (
                    <p className="text-[12px] text-danger font-semibold font-body mt-1.5">
                      ⚠️ {claim.flag}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-display font-bold text-[20px] text-[#0F0F0F]">
                    {claim.fraudScore}
                  </p>
                  <p className="text-[11px] text-[#9B9B9B] font-body mb-1">fraud score</p>
                  <Badge variant={claim.status === 'AUTO_APPROVED' ? 'success' : 'danger'}>
                    {claim.status === 'AUTO_APPROVED' ? 'Auto' : 'Review'}
                  </Badge>
                </div>
              </div>

              {/* Action buttons for manual review */}
              {claim.status === 'MANUAL_REVIEW' && (
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 h-9 bg-success text-white text-[13px] font-semibold font-body rounded-button">
                    Approve
                  </button>
                  <button className="flex-1 h-9 bg-danger text-white text-[13px] font-semibold font-body rounded-button">
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[15px] text-[#6B6B6B] font-body">No claims found</p>
          </div>
        )}
      </div>

      <AdminBottomNav active="claims" />
    </motion.div>
  )
}
