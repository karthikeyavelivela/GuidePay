import { motion } from 'framer-motion'
import { Search, Download } from 'lucide-react'
import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import Badge from '../../components/ui/Badge'
import { getClaimsQueue, approveClaim, rejectClaim } from '../../services/api'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
}

export default function ClaimsQueue() {
  const [claims, setClaims] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  const fetchClaims = async (status) => {
    setLoading(true)
    try {
      const res = await getClaimsQueue(status === 'ALL' ? 'ALL' : status)
      setClaims(res?.claims || [])
    } catch {
      setClaims([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClaims(filter)
  }, [filter])

  const handleApprove = async (claimId) => {
    await approveClaim(claimId)
    fetchClaims(filter)
  }

  const handleReject = async (claimId) => {
    await rejectClaim(claimId, 'Manual review failed')
    fetchClaims(filter)
  }

  const exportToExcel = () => {
    const rows = claims.map((claim) => ({
      'Claim ID': claim.id || claim._id,
      Worker: claim.worker?.name || 'Unknown',
      Phone: claim.worker?.phone || '',
      City: claim.worker?.city || '',
      'Trigger Type': claim.trigger_type || '',
      'Amount (Rs)': claim.amount || 0,
      Status: claim.status || '',
      'Fraud Score': claim.fraud_score?.toFixed?.(3) || claim.fraud_score || '0.000',
      Flags: (claim.fraud_flags || []).join(', '),
      'Created At': claim.created_at || '',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Claims')
    XLSX.writeFile(wb, `Claims_${filter}_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const filters = ['ALL', 'AUTO_APPROVED', 'MANUAL_REVIEW']

  return (
    <motion.div className="min-h-screen bg-grey-50 pb-8" variants={pageVariants} initial="initial" animate="animate" exit="exit">
      <div className="px-4 mt-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-bold font-display text-[#0F0F0F]">Claims Queue</h2>
          <button onClick={exportToExcel} className="flex items-center gap-2 px-3 py-2 rounded-[8px] bg-[#0F0F0F] text-white text-[12px] font-semibold font-body">
            <Download size={13} />
            Export
          </button>
        </div>

        <div className="flex items-center gap-3 px-4 h-[48px] rounded-input border-[1.5px] border-grey-200 bg-white mb-3">
          <Search size={16} className="text-grey-400 flex-shrink-0" />
          <input type="text" placeholder="Search worker or claim ID..." className="flex-1 text-[14px] font-body text-[#0F0F0F] placeholder:text-grey-300 outline-none bg-transparent" />
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {filters.map((entry) => (
            <button key={entry} onClick={() => setFilter(entry)} className={`flex-shrink-0 px-3.5 py-1.5 rounded-pill text-[12px] font-semibold font-body transition-colors ${filter === entry ? 'bg-brand-light text-brand border border-brand' : 'bg-white text-grey-500 border border-grey-200'}`}>
              {entry === 'ALL' ? 'All' : entry === 'AUTO_APPROVED' ? 'Auto-approved' : 'Manual review'}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-card shadow-card overflow-hidden">
          {loading ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[14px] text-[#9B9B9B] font-body">Loading...</p>
            </div>
          ) : claims.map((claim, index) => (
            <div key={claim._id} className={`p-4 ${index < claims.length - 1 ? 'border-b border-grey-50' : ''} ${claim.status === 'MANUAL_REVIEW' ? 'bg-danger-light' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-[15px] font-semibold font-body text-[#0F0F0F]">{claim.worker?.name ?? 'Worker'}</p>
                  <p className="text-[13px] text-[#6B6B6B] font-body mt-0.5">{claim.trigger_type} · Rs{claim.amount} · {claim._id?.slice(0, 8)}</p>
                  {claim.fraud_flags?.length > 0 && (
                    <p className="text-[12px] text-danger font-semibold font-body mt-1.5">{claim.fraud_flags.join(' · ')}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-display font-bold text-[20px] text-[#0F0F0F]">{claim.fraud_score?.toFixed?.(2) ?? claim.fraud_score ?? '-'}</p>
                  <p className="text-[11px] text-[#9B9B9B] font-body mb-1">fraud score</p>
                  <Badge variant={claim.status === 'AUTO_APPROVED' || claim.status === 'PAID' ? 'success' : claim.status === 'MANUAL_REVIEW' ? 'danger' : 'info'}>
                    {claim.status === 'AUTO_APPROVED' ? 'Auto' : claim.status === 'PAID' ? 'Paid' : claim.status === 'MANUAL_REVIEW' ? 'Review' : claim.status}
                  </Badge>
                </div>
              </div>

              {claim.status === 'MANUAL_REVIEW' && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleApprove(claim._id)} className="flex-1 h-9 bg-success text-white text-[13px] font-semibold font-body rounded-button">
                    Approve
                  </button>
                  <button onClick={() => handleReject(claim._id)} className="flex-1 h-9 bg-danger text-white text-[13px] font-semibold font-body rounded-button">
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {!loading && claims.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[15px] text-[#6B6B6B] font-body">No claims found</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
