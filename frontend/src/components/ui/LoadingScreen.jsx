import { useEffect } from 'react'
import { motion } from 'framer-motion'

export const LoadingScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => onComplete?.(), 1800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0A0A0B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <motion.img
        src="https://res.cloudinary.com/dqwm8wgg8/image/upload/v1774700124/fyoozql4veqn4tafbowk.png"
        alt="GuidePay"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          height: 44, width: 'auto',
          filter: 'brightness(0) invert(1)',
          objectFit: 'contain',
        }}
      />
      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ delay: i * 0.15, duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 6, height: 6,
              borderRadius: 999,
              background: '#D97757',
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default LoadingScreen
