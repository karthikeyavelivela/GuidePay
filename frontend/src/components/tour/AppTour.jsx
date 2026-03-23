import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { X, ArrowRight, ArrowLeft } from 'lucide-react'

const TOUR_STEPS = [
  {
    id: 'welcome',
    target: null,
    title: 'Welcome to GuidePay! 👋',
    body: 'GuidePay is your income safety net. We automatically detect floods, platform outages, and curfews in your delivery zone — and pay you instantly via UPI when you can\'t work. Let\'s show you around!',
  },
  {
    id: 'policy-card',
    target: '#policy-hero-card',
    title: 'Your Coverage Card',
    body: 'This is your active policy. It shows your coverage cap (₹600/week), renewal dates, premium amount, and risk score. The green dot means you\'re currently protected.',
  },
  {
    id: 'alert-card',
    target: '#alert-banner',
    title: 'Risk Alerts',
    body: 'Our AI monitors your zone 24/7. When it detects high flood risk, platform issues, or govt curfews — this alert appears automatically. Your coverage extends, no action needed from you.',
  },
  {
    id: 'zone-status',
    target: '#zone-status-card',
    title: 'Zone Monitor',
    body: 'Real-time status of flood alerts, platform health (Zepto, Swiggy, Blinkit), and curfew orders in your 5km zone. We run checks every 15 minutes to protect you.',
  },
  {
    id: 'bottom-nav-coverage',
    target: '#nav-coverage',
    title: 'Buy or Change Coverage',
    body: 'Tap "Cover" to browse plans (Basic ₹49/wk, Standard ₹58/wk, Premium ₹69/wk). Pick the plan that fits your risk zone and get instant protection.',
  },
  {
    id: 'bottom-nav-claims',
    target: '#nav-claims',
    title: 'Your Payouts',
    body: 'When a trigger event happens (flood/outage/curfew), your payout is processed automatically. Track all past and current payouts here in real-time.',
  },
  {
    id: 'bottom-nav-forecast',
    target: '#nav-forecast',
    title: 'AI Forecast',
    body: 'Check flood probability for the next 7 days with our AI-powered map. Plan your deliveries around weather events and stay ahead of disruptions.',
  },
  {
    id: 'chat-button',
    target: '#chat-btn',
    title: 'Got Questions?',
    body: 'Tap this button anytime for instant answers about coverage, payouts, claims, and your premium. Our FAQ covers everything you need.',
  },
  {
    id: 'done',
    target: null,
    title: 'You\'re all set! 🎉',
    body: 'Here\'s the flow: Buy a plan → We monitor your zone → Trigger event detected → Payout sent to your UPI in under 2 hours. That\'s it — go deliver, we handle the rest!',
    last: true,
  },
]

export const AppTour = ({ onClose }) => {
  const [step, setStep] = useState(0)
  const current = TOUR_STEPS[step]
  const [targetRect, setTargetRect] = useState(null)

  const next = () => {
    if (current.last) onClose()
    else setStep(s => s + 1)
  }

  const prev = () => {
    if (step > 0) setStep(s => s - 1)
  }

  const updateTargetRect = useCallback(() => {
    if (current.target) {
      const el = document.querySelector(current.target)
      if (el) {
        const rect = el.getBoundingClientRect()
        setTargetRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height })
      } else {
        setTargetRect(null)
      }
    } else {
      setTargetRect(null)
    }
  }, [current.target])

  useEffect(() => {
    if (current.target) {
      const el = document.querySelector(current.target)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      const timer = setTimeout(updateTargetRect, 400)
      return () => clearTimeout(timer)
    } else {
      setTargetRect(null)
    }
  }, [step, current.target, updateTargetRect])

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          zIndex: 8000,
        }}
      />

      {/* SPOTLIGHT on target */}
      {current.target && targetRect && (
        <div
          style={{
            position: 'fixed',
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            borderRadius: 14,
            border: '2px solid #D97757',
            background: 'transparent',
            boxShadow: '0 0 0 4px rgba(217,119,87,0.25)',
            zIndex: 8001,
            pointerEvents: 'none',
            transition: 'all 0.3s ease',
          }}
        />
      )}

      {/* TOOLTIP CARD — always centered in the viewport */}
      <motion.div
        key={step}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'fixed',
          zIndex: 8002,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'calc(100% - 32px)',
          maxWidth: 360,
          background: 'white',
          borderRadius: 18,
          padding: 20,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Progress bar */}
        <div style={{
          display: 'flex',
          gap: 4,
          marginBottom: 14,
        }}>
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1, height: 3,
                borderRadius: 999,
                background: i <= step ? '#D97757' : '#F4F4F5',
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>

        {/* Step info + close */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 8,
        }}>
          <p style={{
            fontSize: 11, fontWeight: 700,
            fontFamily: 'Inter', color: '#D97757',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            margin: 0,
          }}>
            Step {step + 1} of {TOUR_STEPS.length}
          </p>
          <button
            onClick={onClose}
            style={{
              background: '#F4F4F5',
              border: 'none',
              borderRadius: 999,
              width: 26, height: 26,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X size={14} color="#6B6B6B" />
          </button>
        </div>

        <h3 style={{
          fontFamily: 'Bricolage Grotesque',
          fontSize: 20, fontWeight: 800,
          color: '#0F0F0F', margin: '0 0 8px',
        }}>
          {current.title}
        </h3>

        <p style={{
          fontSize: 14, color: '#6B6B6B',
          fontFamily: 'Inter', lineHeight: 1.6,
          margin: '0 0 16px',
        }}>
          {current.body}
        </p>

        {/* Navigation buttons */}
        <div style={{
          display: 'flex',
          gap: 8,
        }}>
          {step > 0 && (
            <button
              onClick={prev}
              style={{
                padding: '10px 16px',
                borderRadius: 10,
                border: '1px solid #E4E4E7',
                background: 'white',
                fontSize: 13, fontWeight: 600,
                fontFamily: 'Inter',
                color: '#0F0F0F', cursor: 'pointer',
                display: 'flex', alignItems: 'center',
                gap: 4,
              }}
            >
              <ArrowLeft size={14} />
              Back
            </button>
          )}

          <button
            onClick={next}
            style={{
              flex: 1,
              padding: '11px',
              borderRadius: 10,
              border: 'none',
              background: '#D97757',
              fontSize: 14, fontWeight: 700,
              fontFamily: 'Inter',
              color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 6,
              boxShadow: '0 4px 16px rgba(217,119,87,0.35)',
            }}
          >
            {current.last ? 'Start delivering!' : 'Next'}
            {!current.last && <ArrowRight size={15} />}
          </button>
        </div>
      </motion.div>
    </>
  )
}

export default AppTour
