import { motion } from 'framer-motion'
import { Search, Download } from 'lucide-react'
import { useState, useEffect } from 'react'
import Badge from '../../components/ui/Badge'
import { getClaimsQueue, approveClaim, rejectClaim } from '../../services/api'
import * as XLSX from 'xlsx'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
}

const DEMO_CLAIMS = [
  {
    id: 'CLM-2847', _id: 'CLM-2847',
    worker: { name: 'Ravi Kumar', phone: '9876543210', city: 'Hyderabad' },
    trigger_type: 'FLOOD', amount: 600, status: 'PAID', fraud_score: 0.04, fraud_flags: [],
    fraud_checks: {
      duplicate: { result: 'PASS' }, gps: { result: 'PASS', distance_km: 0.8 },
      activity: { result: 'PASS', age_minutes: 47 }, frequency: { result: 'PASS' },
      correlation: { result: 'CONFIRMED', ratio: 0.84 }, worker_risk: { result: 'PASS' }, account_age: { result: 'PASS' },
    },
    zone_correlation_ratio: 0.84,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'CLM-2841', _id: 'CLM-2841',
    worker: { name: 'Arjun Sharma', phone: '9876501234', city: 'Mumbai' },
    trigger_type: 'OUTAGE', amount: 450, status: 'AUTO_APPROVED', fraud_score: 0.12, fraud_flags: [],
    fraud_checks: {
      duplicate: { result: 'PASS' }, gps: { result: 'PASS', distance_km: 1.2 },
      activity: { result: 'PASS', age_minutes: 23 }, frequency: { result: 'PASS' },
      correlation: { result: 'CONFIRMED', ratio: 0.71 }, worker_risk: { result: 'PASS' }, account_age: { result: 'PASS' },
    },
    zone_correlation_ratio: 0.71,
    created_at: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'CLM-2839', _id: 'CLM-2839',
    worker: { name: 'Mohammed Ali', phone: '9988776655', city: 'Hyderabad' },
    trigger_type: 'FLOOD', amount: 600, status: 'MANUAL_REVIEW', fraud_score: 0.71,
    fraud_flags: ['HIGH_CLAIM_FREQUENCY'],
    fraud_checks: {
      duplicate: { result: 'PASS' }, gps: { result: 'WARNING', distance_km: 6.2 },
      activity: { result: 'FAIL', age_minutes: 380 }, frequency: { result: 'FAIL' },
      correlation: { result: 'NORMAL', ratio: 0.45 }, worker_risk: { result: 'PASS' }, account_age: { result: 'WARNING', age_days: 4 },
    },
    zone_correlation_ratio: 0.45,
    created_at: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    id: 'CLM-2835', _id: 'CLM-2835',
    worker: { name: 'Priya Patel', phone: '9123456789', city: 'Chennai' },
    trigger_type: 'CURFEW', amount: 600, status: 'PAID', fraud_score: 0.03, fraud_flags: [],
    fraud_checks: {
      duplicate: { result: 'PASS' }, gps: { result: 'PASS', distance_km: 0.4 },
      activity: { result: 'PASS', age_minutes: 12 }, frequency: { result: 'PASS' },
      correlation: { result: 'CONFIRMED', ratio: 0.92 }, worker_risk: { result: 'PASS' }, account_age: { result: 'PASS' },
    },
    zone_correlation_ratio: 0.92,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'CLM-2821', _id: 'CLM-2821',
    worker: { name: 'Sita Devi', phone: '9765432100', city: 'Bengaluru' },
    trigger_type: 'OUTAGE', amount: 450, status: 'REJECTED', fraud_score: 0.89,
    fraud_flags: ['GPS_FAR_FROM_ZONE', 'NO_RECENT_ACTIVITY', 'NEW_ACCOUNT'],
    fraud_checks: {
      duplicate: { result: 'PASS' }, gps: { result: 'FAIL', distance_km: 14.3 },
      activity: { result: 'FAIL', age_minutes: 720 }, frequency: { result: 'PASS' },
      correlation: { result: 'ANOMALY', ratio: 0.08 }, worker_risk: { result: 'FAIL' }, account_age: { result: 'WARNING', age_days: 2 },
    },
    zone_correlation_ratio: 0.08,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
]

export default function ClaimsQueue() {
  const [claims, setClaims] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)

  const fetchClaims = (status) => {
    setLoading(true)
    getClaimsQueue(status === 'ALL' ? undefined : status)
      .then((res) => {
        const data = res.claims ?? []
        setClaims(data.length > 0 ? data : DEMO_CLAIMS)
      })
      .catch(() => setClaims(DEMO_CLAIMS))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchClaims(filter) }, [filter])

  const handleApprove = async (claimId) => {
    await approveClaim(claimId)
    fetchClaims(filter)
  }

  const handleReject = async (claimId) => {
    await rejectClaim(claimId, 'Manual review failed')
    fetchClaims(filter)
  }

  const filters = ['ALL', 'AUTO_APPROVED', 'MANUAL_REVIEW']
  const filtered = claims

  const exportToExcel = () => {
    const rows = filtered.map(c => ({
      'Claim ID': c.id || c._id,
      'Worker': c.worker?.name || 'Unknown',
      'Phone': c.worker?.phone || '',
      'City': c.worker?.city || '',
      'Trigger Type': c.trigger_type || '',
      'Amount (₹)': c.amount || 0,
      'Status': c.status || '',
      'Fraud Score': c.fraud_score?.toFixed(3) || '0.000',
      'Flags': (c.fraud_flags || []).join(', '),
      'Created At': c.created_at || '',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Claims')
    XLSX.writeFile(wb, `Claims_${filter}_${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  return (
    <motion.div
      className="min-h-screen bg-grey-50 pb-8"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="px-4 mt-3">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-bold font-display text-[#0F0F0F]">Claims Queue</h2>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-3 py-2 rounded-[8px] bg-[#0F0F0F] text-white text-[12px] font-semibold font-body"
          >
            <Download size={13} />
            Export
          </button>
        </div>

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
          {loading ? (
            <div className="px-4 py-8 text-center">
              <p className="text-[14px] text-[#9B9B9B] font-body">Loading...</p>
            </div>
          ) : filtered.map((claim, i) => (
            <div
              key={claim._id}
              className={`p-4 ${i < filtered.length - 1 ? 'border-b border-grey-50' : ''} ${claim.status === 'MANUAL_REVIEW' ? 'bg-danger-light' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-[15px] font-semibold font-body text-[#0F0F0F]">
                    {claim.worker?.name ?? 'Worker'}
                  </p>
                  <p className="text-[13px] text-[#6B6B6B] font-body mt-0.5">
                    {claim.trigger_type} · ₹{claim.amount} · {claim._id?.slice(0, 8)}
                  </p>
                  {claim.fraud_flags?.length > 0 && (
                    <p className="text-[12px] text-danger font-semibold font-body mt-1.5">
                      ⚠️ {claim.fraud_flags.join(' · ')}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-display font-bold text-[20px] text-[#0F0F0F]">
                    {claim.fraud_score?.toFixed(2) ?? '—'}
                  </p>
                  <p className="text-[11px] text-[#9B9B9B] font-body mb-1">fraud score</p>
                  <Badge variant={claim.status === 'AUTO_APPROVED' || claim.status === 'PAID' ? 'success' : claim.status === 'MANUAL_REVIEW' ? 'danger' : 'info'}>
                    {claim.status === 'AUTO_APPROVED' ? 'Auto' : claim.status === 'PAID' ? 'Paid' : claim.status === 'MANUAL_REVIEW' ? 'Review' : claim.status}
                  </Badge>
                </div>
              </div>

              {/* Action buttons for manual review */}
              {claim.status === 'MANUAL_REVIEW' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleApprove(claim._id)}
                    className="flex-1 h-9 bg-success text-white text-[13px] font-semibold font-body rounded-button"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(claim._id)}
                    className="flex-1 h-9 bg-danger text-white text-[13px] font-semibold font-body rounded-button"
                  >
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

    </motion.div>
  )
}
