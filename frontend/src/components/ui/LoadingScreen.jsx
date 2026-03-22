import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const WORDS = [
  { text: 'GuidePay', lang: 'English' },
  { text: 'গাইডপে', lang: 'Bengali' },
  { text: 'ഗൈഡ്‌പേ', lang: 'Malayalam' },
  { text: 'குைடபே', lang: 'Tamil' },
  { text: 'గైడ్‌పే', lang: 'Telugu' },
  { text: 'ਗਾਈਡਪੇ', lang: 'Punjabi' },
  { text: 'गाइडपे', lang: 'Hindi' },
  { text: 'GuidePay', lang: 'English' },
]

const INTERVAL = 250

export const LoadingScreen = ({ onComplete }) => {
  const [index, setIndex] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      i++
      if (i >= WORDS.length) {
        clearInterval(timer)
        setIndex(WORDS.length - 1)
        setDone(true)
        setTimeout(() => onComplete?.(), 600)
        return
      }
      setIndex(i)
    }, INTERVAL)
    return () => clearInterval(timer)
  }, [])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: '#FFFFFF',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
          }}
        >
          {/* Language label */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`lang-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                fontSize: 11,
                fontFamily: 'Inter, sans-serif',
                color: '#9B9B9B',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              {WORDS[index].lang}
            </motion.p>
          </AnimatePresence>

          {/* Main word — large, crisp, NO blur */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`word-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                fontSize: 42,
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontWeight: 800,
                color: index === WORDS.length - 1 ? '#D97757' : '#0F0F0F',
                letterSpacing: -1,
                margin: 0,
                lineHeight: 1.2,
                filter: 'none',
                WebkitFontSmoothing: 'antialiased',
              }}
            >
              {WORDS[index].text}
            </motion.p>
          </AnimatePresence>

          {/* Progress bar */}
          <div style={{
            width: 48,
            height: 2,
            background: '#F0F0F2',
            borderRadius: 999,
            overflow: 'hidden',
          }}>
            <motion.div
              style={{
                height: '100%',
                background: '#D97757',
                borderRadius: 999,
              }}
              animate={{ width: `${((index + 1) / WORDS.length) * 100}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LoadingScreen
