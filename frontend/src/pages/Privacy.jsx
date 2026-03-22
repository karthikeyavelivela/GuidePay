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
    title: 'What data we collect',
    content: `GuidePay collects the following data to provide you with income protection:\n\n• Mobile number and UPI ID (for authentication and payouts)\n• GPS location coordinates (only while coverage is active, to verify you are in your declared zone)\n• Delivery activity timestamps (last order time, to verify you were working)\n• Device information (model, OS, to prevent fraud)\n• Claim history (to calculate your risk score and detect patterns)`,
  },
  {
    title: 'How we use your data',
    content: `Your data is used exclusively to:\n\n• Verify your identity and prevent fraud\n• Detect trigger events in your zone automatically\n• Confirm you were working at the time of an event\n• Calculate your personalised premium and risk score\n• Process payouts to your UPI\n\nWe do not use your data for advertising, and we do not sell your data to third parties.`,
  },
  {
    title: 'Who we share data with',
    content: `We share minimal data with:\n\n• Razorpay: Payment processing (UPI transfers). They receive only your UPI ID and transaction amount.\n• Firebase (Google): Authentication and secure data storage.\n• IMD and platform status APIs: To verify event triggers. We send zone identifiers only, never personal data.\n\nWe do not share your data with delivery platforms (Zepto, Swiggy, Blinkit, Amazon).`,
  },
  {
    title: 'Data storage and security',
    content: `All data is stored on Indian servers compliant with DPDP Act 2023. We use AES-256 encryption for data at rest and TLS 1.3 for data in transit.\n\nGPS data is retained for 30 days after each coverage period and then automatically deleted. Claim and payout records are retained for 3 years as required by insurance regulations.`,
  },
  {
    title: 'Your rights',
    content: `Under DPDP Act 2023, you have the right to:\n\n• Access: Request a copy of all data we hold about you\n• Correction: Fix any inaccurate data\n• Deletion: Request deletion of your account and data (within 30 days)\n• Portability: Download your data in a machine-readable format\n• Objection: Object to specific types of data processing\n\nTo exercise any right, contact guidepay@sentinelx.in.`,
  },
  {
    title: 'Cookies and tracking',
    content: `GuidePay uses minimal local storage (on your device) to save your session and preferences. We do not use advertising cookies or third-party trackers.\n\nThe app stores: authentication token, zone selection, premium history, and theme preference. This data never leaves your device unless required for a specific transaction.`,
  },
  {
    title: 'Contact',
    content: `Privacy Officer: guidepay@sentinelx.in\nTeam SentinelX · KL University\n\nFor data deletion requests, include "Data Deletion Request" in the subject line. We process all requests within 30 days.`,
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

export default function Privacy() {
  return (
    <motion.div
      className="min-h-screen pb-10"
      style={{ background: 'var(--bg-primary)' }}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <TopBar title="Privacy Policy" showBack />

      <div
        className="mx-4 mt-4 rounded-card px-4 py-3 mb-4"
        style={{ background: 'var(--brand-light)', borderLeft: '3px solid var(--brand)' }}
      >
        <p className="text-[14px] font-medium font-body" style={{ color: 'var(--text-primary)' }}>
          GuidePay takes your privacy seriously.
        </p>
        <p className="text-[12px] font-body mt-1" style={{ color: 'var(--text-tertiary)' }}>
          Last updated: March 2026 · DPDP Act 2023 compliant
        </p>
      </div>

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
