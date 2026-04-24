import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

const TIERS = {
  bronze: {
    name: 'Bronze',
    coverage: 400,
    color: '#D97757',
    bg: '#FFF1EE',
    benefits: [
      'Basic flood protection',
      'Standard claim processing',
      'Email support'
    ]
  },
  silver: {
    name: 'Silver',
    coverage: 600,
    color: '#4B5563',
    bg: '#F3F4F6',
    benefits: [
      'Extended flood coverage',
      'Priority claim processing',
      'WhatsApp support',
      'Zone alerts'
    ]
  },
  gold: {
    name: 'Gold',
    coverage: 900,
    color: '#D97757',
    bg: '#FFF1EE',
    benefits: [
      'Maximum flood coverage',
      'Instant AI claims',
      '24/7 Priority support',
      'Predictive weather alerts'
    ]
  },
  platinum: {
    name: 'Platinum',
    coverage: 1200,
    color: '#111827',
    bg: '#F3F4F6',
    benefits: [
      'Ultimate income protection',
      'Zero-wait claim payouts',
      'Dedicated account manager',
      'Premium zone insights'
    ]
  }
}

export default function TierDetails() {
  const { tier } = useParams()
  const navigate = useNavigate()
  const tierData = TIERS[tier?.toLowerCase()] || TIERS.bronze

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">
      {/* Header */}
      <div className="bg-white px-5 py-4 flex items-center gap-3 border-b border-[#F0F0F0] sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-50 text-[#0F0F0F]">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-display font-bold text-[20px] text-[#0F0F0F]">Tier Details</h1>
      </div>

      <div className="px-5 pt-6 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 border border-[#F0F0F0] shadow-sm mb-6 relative overflow-hidden"
        >
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: tierData.color }} />
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: tierData.bg, color: tierData.color }}>
              <Shield size={24} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-[#666666] uppercase tracking-wider">{tierData.name} Tier</p>
              <h2 className="font-display font-bold text-[28px] text-[#0F0F0F]">₹{tierData.coverage}</h2>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <h3 className="font-bold text-[15px] text-[#0F0F0F]">Plan Benefits</h3>
            {tierData.benefits.map((benefit, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-[#12B76A] shrink-0 mt-0.5" />
                <p className="text-[15px] text-[#404040] leading-snug">{benefit}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <button 
          onClick={() => navigate('/premium')}
          className="w-full bg-[#0F0F0F] text-white font-medium text-[16px] py-4 rounded-full active:scale-[0.98] transition-transform"
        >
          Get This Plan
        </button>
      </div>
    </div>
  )
}
