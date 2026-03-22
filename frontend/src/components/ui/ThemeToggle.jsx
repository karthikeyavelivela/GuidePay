import { motion } from 'framer-motion'
import { useThemeStore } from '../../store/themeStore'

export default function ThemeToggle() {
  const { isDark, toggle } = useThemeStore()

  return (
    <motion.div
      className="flex items-center justify-center cursor-pointer"
      style={{
        width: 48,
        height: 26,
        borderRadius: 999,
        background: isDark ? 'var(--brand)' : 'var(--bg-tertiary)',
        padding: '0 4px',
      }}
      onClick={toggle}
    >
      <motion.div
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
        animate={{ x: isDark ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.div>
  )
}
