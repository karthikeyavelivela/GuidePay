import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Menu, X, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Coverage',     href: '#coverage' },
  { label: 'Pricing',      href: '#pricing' },
  { label: 'For workers',  href: '#workers' },
]

export const LandingNav = () => {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      <motion.nav
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 500,
          height: 64,
          display: 'flex',
          alignItems: 'center',
          padding: '0 max(24px, 5vw)',
          background: scrolled ? 'rgba(255,255,255,0.94)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : 'none',
          transition: 'all 0.3s ease',
        }}
      >
        {/* LEFT: Logo */}
        <motion.div
          onClick={() => navigate('/')}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'flex', alignItems: 'center',
            gap: 10, cursor: 'pointer', flexShrink: 0,
          }}
        >
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: scrolled
              ? 'linear-gradient(135deg, #D97757, #B85C3A)'
              : 'rgba(255,255,255,0.2)',
            backdropFilter: scrolled ? 'none' : 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: scrolled ? 'none' : '1px solid rgba(255,255,255,0.3)',
          }}>
            <ShieldCheck size={18} color="white" />
          </div>
          <span style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: 19, fontWeight: 800,
            letterSpacing: -0.5,
            color: scrolled ? '#0F0F0F' : 'white',
          }}>
            GuidePay
          </span>
        </motion.div>

        {/* CENTER: Nav links */}
        <div
          className="hidden md:flex"
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 2 }}
        >
          {NAV_LINKS.map(link => (
            <motion.a
              key={link.label}
              href={link.href}
              whileHover={{
                background: scrolled ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.15)',
              }}
              style={{
                padding: '7px 14px', borderRadius: 8,
                fontSize: 14, fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                color: scrolled ? '#0F0F0F' : 'rgba(255,255,255,0.9)',
                textDecoration: 'none', transition: 'color 0.2s',
              }}
            >
              {link.label}
            </motion.a>
          ))}
        </div>

        {/* RIGHT: CTAs */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: 8, flexShrink: 0, marginLeft: 'auto',
        }}>
          <motion.button
            onClick={() => navigate('/login')}
            className="hidden md:block"
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '8px 16px', borderRadius: 8,
              border: scrolled
                ? '1px solid #E4E4E7'
                : '1px solid rgba(255,255,255,0.3)',
              background: 'transparent',
              fontSize: 14, fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              color: scrolled ? '#0F0F0F' : 'white',
              cursor: 'pointer',
            }}
          >
            Sign in
          </motion.button>

          <motion.button
            onClick={() => navigate('/register')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '9px 20px', borderRadius: 8, border: 'none',
              background: scrolled
                ? 'linear-gradient(135deg, #D97757, #B85C3A)'
                : 'rgba(255,255,255,0.95)',
              fontSize: 14, fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              color: scrolled ? 'white' : '#D97757',
              cursor: 'pointer',
              boxShadow: scrolled
                ? '0 2px 12px rgba(217,119,87,0.3)'
                : '0 2px 12px rgba(0,0,0,0.15)',
            }}
          >
            Get protected →
          </motion.button>

          <motion.button
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
            style={{
              background: 'none', border: 'none',
              cursor: 'pointer',
              color: scrolled ? '#0F0F0F' : 'white',
            }}
            whileTap={{ scale: 0.9 }}
          >
            <Menu size={24} />
          </motion.button>
        </div>
      </motion.nav>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 600 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 35 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: 280, background: 'white', zIndex: 700,
                padding: 20, display: 'flex', flexDirection: 'column',
              }}
            >
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 32,
              }}>
                <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 18, fontWeight: 800, color: '#0F0F0F' }}>
                  GuidePay
                </span>
                <motion.button
                  onClick={() => setMobileOpen(false)}
                  style={{
                    background: '#F7F7F8', border: 'none', borderRadius: 999,
                    width: 32, height: 32, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={16} />
                </motion.button>
              </div>

              {NAV_LINKS.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    padding: '14px 0',
                    borderBottom: '1px solid #F4F4F5',
                    fontSize: 16, fontWeight: 600,
                    fontFamily: 'Inter, sans-serif',
                    color: '#0F0F0F', textDecoration: 'none', display: 'block',
                  }}
                >
                  {link.label}
                </a>
              ))}

              <div style={{ marginTop: 'auto', gap: 10, display: 'flex', flexDirection: 'column' }}>
                <motion.button
                  onClick={() => { navigate('/login'); setMobileOpen(false) }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 10,
                    border: '1.5px solid #E4E4E7', background: 'white',
                    fontSize: 15, fontWeight: 600, fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                  }}
                >
                  Sign in
                </motion.button>
                <motion.button
                  onClick={() => { navigate('/register'); setMobileOpen(false) }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                    background: 'linear-gradient(135deg, #D97757, #B85C3A)',
                    color: 'white', fontSize: 15, fontWeight: 700,
                    fontFamily: 'Inter, sans-serif', cursor: 'pointer',
                  }}
                >
                  Get protected →
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default LandingNav
