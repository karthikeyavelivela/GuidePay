import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import TopBar from '../components/ui/TopBar'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
}

const SECTIONS = [
  {
    title: 'What GuidePay does',
    content: `GuidePay is a parametric income insurance platform for gig delivery workers in India. Unlike traditional insurance, GuidePay automatically pays you when predefined trigger events occur — such as IMD flood alerts, platform outages, or government curfews — without requiring you to file a claim.\n\nPayouts are processed within 2 hours of a confirmed event. You do not need to do anything. GuidePay monitors your zone continuously and verifies events automatically.`,
  },
  {
    title: 'Your coverage',
    content: `GuidePay covers income lost during three types of events:\n\n1. Flood alerts: IMD Red or Orange alerts for your zone. Pays 100% (up to ₹600/week).\n2. Platform outages: Verified outages on Zepto, Swiggy, Blinkit, or Amazon. Pays 75% (up to ₹450/week).\n3. Government curfews: Official curfew orders in your city. Pays 100% (up to ₹600/week).\n\nNOT covered: Health issues, vehicle repairs, accidents, personal decisions not to work, air quality events, or situations where platforms continue to operate.`,
  },
  {
    title: 'Premium payments',
    content: `Your weekly premium is auto-debited every Sunday via UPI. Coverage runs Monday to Sunday. You will receive a notification 24 hours before each deduction.\n\nPremiums are calculated based on: base rate (₹49) × zone flood risk × your reliability score. Workers with consistent activity and low fraud scores receive automatic discounts.\n\nCancellation: You may cancel at any time from Profile → Manage Coverage. Coverage ends at the close of your current week. No cancellation fee applies. Refunds are not available for the current week.`,
  },
  {
    title: 'Fraud prevention',
    content: `GuidePay uses an automated fraud detection system that checks: GPS location, last delivery activity, zone-wide worker correlation, device fingerprinting, and claim history.\n\nA fraud score of 0.0–0.3 results in automatic approval. Scores of 0.3–0.7 require a single in-app location confirmation tap. Scores above 0.7 result in manual review within 4 hours.\n\nWorkers suspended for fraud will not receive refunds for the current period. Repeated fraud results in permanent account suspension.`,
  },
  {
    title: 'Data we collect',
    content: `GuidePay collects: your mobile number, UPI ID, GPS location (during active coverage), delivery activity timestamps, device information, and claim history.\n\nLocation data is only collected when your coverage is active. We do not share your data with employers or delivery platforms. Data is stored securely on Indian servers in compliance with DPDP Act 2023.`,
  },
  {
    title: 'Your rights',
    content: `You may: cancel your coverage at any time, request deletion of your account and data, download a copy of your policy documents, and request a review of any claim decision.\n\nTo exercise these rights, contact us at guidepay@sentinelx.in. We will respond within 7 business days.`,
  },
  {
    title: 'Contact us',
    content: `Email: guidepay@sentinelx.in\nTeam SentinelX · KL University\n\nFor urgent issues during an active event, use the in-app support chat. Response time: under 30 minutes during active events.`,
  },
]

function AccordionItem({ section, index }) {
  const [open, setOpen] = useState(index === 0)

  return (
    <div style={{ borderBottom: '1px solid var(--border-light)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-4 text-left"
      >
        <span className="text-[14px] font-semibold font-body" style={{ color: 'var(--text-primary)' }}>
          {section.title}
        </span>
        {open
          ? <ChevronUp size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          : <ChevronDown size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
        }
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-4 pb-4">
              {section.content.split('\n').map((para, i) => (
                <p
                  key={i}
                  className="text-[14px] font-body leading-relaxed"
                  style={{ color: 'var(--text-secondary)', marginTop: i > 0 ? 8 : 0 }}
                >
                  {para}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Terms() {
  return (
    <motion.div
      className="min-h-screen pb-10"
      style={{ background: 'var(--bg-primary)' }}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <TopBar title="Terms of Service" showBack />

      {/* Header card */}
      <div
        className="mx-4 mt-4 rounded-card px-4 py-3 mb-4"
        style={{
          background: 'var(--brand-light)',
          borderLeft: '3px solid var(--brand)',
        }}
      >
        <p className="text-[14px] font-medium font-body" style={{ color: 'var(--text-primary)' }}>
          By using GuidePay, you agree to these terms.
        </p>
        <p className="text-[12px] font-body mt-1" style={{ color: 'var(--text-tertiary)' }}>
          Last updated: March 2026
        </p>
      </div>

      {/* Accordion sections */}
      <div
        className="mx-4 rounded-card overflow-hidden"
        style={{ background: 'var(--bg-primary)', boxShadow: 'var(--shadow-card)' }}
      >
        {SECTIONS.map((section, i) => (
          <AccordionItem key={section.title} section={section} index={i} />
        ))}
      </div>
    </motion.div>
  )
}
