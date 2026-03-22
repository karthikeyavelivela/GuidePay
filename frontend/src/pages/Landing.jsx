import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck, Zap, Phone, MapPin, ArrowRight,
} from 'lucide-react'

const GradientBackground = () => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 0,
    overflow: 'hidden', background: '#FAFAFA',
  }}>
    <motion.div
      style={{
        position: 'absolute', width: '70vw', height: '70vw',
        maxWidth: 800, maxHeight: 800, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(217,119,87,0.18) 0%, transparent 65%)',
        top: '-20%', right: '-15%',
      }}
      animate={{ x: [0,40,-20,30,0], y: [0,-30,20,-10,0], scale: [1,1.08,0.95,1.04,1] }}
      transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      style={{
        position: 'absolute', width: '60vw', height: '60vw',
        maxWidth: 700, maxHeight: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(240,230,211,0.25) 0%, transparent 65%)',
        bottom: '-10%', left: '-10%',
      }}
      animate={{ x: [0,-30,20,-10,0], y: [0,20,-30,15,0], scale: [1,0.96,1.06,0.98,1] }}
      transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 8 }}
    />
    <motion.div
      style={{
        position: 'absolute', width: '50vw', height: '50vw',
        maxWidth: 600, maxHeight: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(217,119,87,0.08) 0%, transparent 70%)',
        top: '35%', left: '25%',
      }}
      animate={{ x: [0,25,-15,10,0], y: [0,-15,25,-10,0] }}
      transition={{ duration: 35, repeat: Infinity, ease: 'easeInOut', delay: 15 }}
    />
  </div>
)

const LandingNav = () => {
  const navigate = useNavigate()
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      height: 60, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 max(24px, 5vw)',
      background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ShieldCheck size={22} color="#D97757" />
        <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 18, fontWeight: 800, color: '#0F0F0F' }}>
          GuidePay
        </span>
      </div>
      <div className="hidden md:flex" style={{ gap: 32 }}>
        {['How it works', 'Coverage', 'For workers'].map(link => (
          <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`}
            style={{ fontSize: 14, color: '#6B6B6B', textDecoration: 'none', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            {link}
          </a>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <motion.button onClick={() => navigate('/login')} whileTap={{ scale: 0.97 }}
          style={{ padding: '8px 16px', borderRadius: 10, border: '1px solid #E4E4E7', background: 'white', fontSize: 14, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: '#0F0F0F', cursor: 'pointer' }}>
          Sign in
        </motion.button>
        <motion.button onClick={() => navigate('/login')} whileTap={{ scale: 0.97 }}
          style={{ padding: '8px 20px', borderRadius: 10, border: 'none', background: '#D97757', fontSize: 14, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: 'white', cursor: 'pointer' }}>
          Get protected
        </motion.button>
      </div>
    </nav>
  )
}

const NEWS_ITEMS = [
  { tag: 'Flood Alert', tagColor: '#2E90FA', title: 'IMD issues Red Alert for Hyderabad — 8 districts affected', source: 'Times of India', time: '2 hours ago', relevant: '32 GuidePay workers auto-covered' },
  { tag: 'Platform Outage', tagColor: '#F79009', title: 'Zepto app down for 3 hours across Mumbai and Pune', source: 'Inc42', time: '5 hours ago', relevant: '847 payout claims processed automatically' },
  { tag: 'Policy Update', tagColor: '#12B76A', title: 'IRDAI sandbox opens for parametric micro-insurance products', source: 'Financial Express', time: '1 day ago', relevant: 'GuidePay pursuing regulatory clearance' },
  { tag: 'Gig Economy', tagColor: '#D97757', title: '12M delivery workers face income risk every monsoon season', source: 'NASSCOM Report', time: '3 days ago', relevant: 'The problem GuidePay solves' },
  { tag: 'Climate', tagColor: '#F04438', title: 'India records 147% excess rainfall in 2024 monsoon season', source: 'IMD Bulletin', time: '1 week ago', relevant: 'Highest flood risk in 60 years' },
]

const NewsCarousel = () => (
  <div style={{ overflow: 'hidden', width: '100%' }}>
    <motion.div
      style={{ display: 'flex', gap: 16, width: 'max-content' }}
      animate={{ x: ['0%', '-50%'] }}
      transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
    >
      {[...NEWS_ITEMS, ...NEWS_ITEMS].map((item, i) => (
        <div key={i} style={{
          width: 280, flexShrink: 0, background: 'white', borderRadius: 14,
          padding: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #F4F4F5',
        }}>
          <span style={{
            fontSize: 10, fontWeight: 700, fontFamily: 'Inter, sans-serif',
            color: item.tagColor, background: `${item.tagColor}18`,
            padding: '3px 8px', borderRadius: 999, display: 'inline-block', marginBottom: 8,
          }}>{item.tag}</span>
          <p style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: '#0F0F0F', lineHeight: 1.4, margin: '0 0 8px' }}>{item.title}</p>
          <p style={{ fontSize: 11, color: '#9B9B9B', fontFamily: 'Inter, sans-serif', margin: '0 0 8px' }}>{item.source} · {item.time}</p>
          <div style={{ background: '#FDF1ED', borderRadius: 8, padding: '6px 10px', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <ShieldCheck size={12} color="#D97757" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 11, color: '#B85C3A', fontFamily: 'Inter, sans-serif', fontWeight: 500, margin: 0, lineHeight: 1.3 }}>{item.relevant}</p>
          </div>
        </div>
      ))}
    </motion.div>
  </div>
)

const Landing = () => {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', position: 'relative', background: 'transparent' }}>
      <GradientBackground />
      <LandingNav />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* HERO */}
        <section style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '100px max(20px, 5vw) 60px',
        }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FDF1ED', border: '1px solid rgba(217,119,87,0.3)', borderRadius: 999, padding: '6px 16px', marginBottom: 28 }}>
            <div style={{ width: 6, height: 6, borderRadius: 999, background: '#12B76A' }} />
            <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: '#B85C3A' }}>
              Guidewire DEVTrails 2026 · Team SentinelX
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 25 }}
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 'clamp(36px, 7vw, 72px)', fontWeight: 800, color: '#0F0F0F', lineHeight: 1.1, letterSpacing: -2, maxWidth: 800, margin: '0 auto 20px' }}>
            Income protection for{' '}
            <span style={{ color: '#D97757' }}>India's delivery workers</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: '#6B6B6B', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, maxWidth: 560, margin: '0 auto 40px' }}>
            Auto-pays when floods, outages, or curfews stop you from earning.
            <strong style={{ color: '#0F0F0F' }}> Zero claims. Zero paperwork.</strong>
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 60 }}>
            <motion.button onClick={() => navigate('/login')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ padding: '14px 28px', borderRadius: 12, border: 'none', background: '#D97757', color: 'white', fontSize: 16, fontWeight: 700, fontFamily: 'Inter, sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(217,119,87,0.35)' }}>
              Get protected for ₹49/week <ArrowRight size={18} />
            </motion.button>
            <motion.button onClick={() => navigate('/login')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ padding: '14px 28px', borderRadius: 12, border: '1.5px solid #E4E4E7', background: 'white', color: '#0F0F0F', fontSize: 16, fontWeight: 600, fontFamily: 'Inter, sans-serif', cursor: 'pointer' }}>
              See how it works
            </motion.button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            style={{ display: 'flex', gap: 'clamp(24px, 5vw, 64px)', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { value: '12M+', label: 'Workers uninsured' },
              { value: '₹4,200Cr', label: 'Annual income lost' },
              { value: '< 2hrs', label: 'Payout speed' },
              { value: '₹0', label: 'Claims to file' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800, color: '#0F0F0F', margin: 0 }}>{stat.value}</p>
                <p style={{ fontSize: 13, color: '#9B9B9B', fontFamily: 'Inter, sans-serif', margin: '4px 0 0' }}>{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* NEWS */}
        <section style={{ padding: '40px 0', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(8px)' }}>
          <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: '#9B9B9B', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 20 }}>
            Why this matters — latest news
          </p>
          <NewsCarousel />
        </section>

        {/* PROBLEM + SOLUTION */}
        <section id="how-it-works" style={{ padding: 'clamp(60px, 8vw, 100px) max(20px, 8vw)', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, alignItems: 'center', marginBottom: 80 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#D97757', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>The Problem</span>
              <h2 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#0F0F0F', lineHeight: 1.15, letterSpacing: -1, marginBottom: 20 }}>
                Ravi loses ₹640 every time it floods. With zero recourse.
              </h2>
              <p style={{ fontSize: 16, color: '#6B6B6B', fontFamily: 'Inter, sans-serif', lineHeight: 1.7, marginBottom: 24 }}>
                Ravi Kumar, 27, delivers for Zepto in Kondapur, Hyderabad. When IMD issues a Red Alert, platforms suspend operations. Ravi loses an entire day's income — ₹640 — with no claim to file.
              </p>
              {['20–30% monthly income lost during monsoon', 'Zero parametric insurance products exist', 'No platform takes responsibility', '₹4,200 crore in uninsured losses annually'].map((point, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 999, background: '#FEF3F2', border: '1px solid rgba(240,68,56,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <span style={{ fontSize: 10, color: '#F04438' }}>✕</span>
                  </div>
                  <p style={{ fontSize: 14, color: '#0F0F0F', fontFamily: 'Inter, sans-serif', margin: 0, lineHeight: 1.5 }}>{point}</p>
                </div>
              ))}
            </div>

            <motion.div whileHover={{ y: -4 }} style={{ background: 'white', borderRadius: 20, padding: 28, boxShadow: '0 8px 40px rgba(0,0,0,0.1)', border: '1px solid #F4F4F5' }}>
              <div style={{ width: 56, height: 56, borderRadius: 999, background: '#FDF1ED', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 28 }}>🛵</div>
              <h3 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 20, fontWeight: 700, color: '#0F0F0F', marginBottom: 4 }}>Ravi Kumar, 27</h3>
              <p style={{ fontSize: 13, color: '#9B9B9B', fontFamily: 'Inter, sans-serif', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} /> Kondapur, Hyderabad · Zepto + Swiggy
              </p>
              {[
                { label: 'Daily income', value: '₹800' },
                { label: 'Lost per flood day', value: '₹640', danger: true },
                { label: 'Insurance coverage', value: '₹0', danger: true },
                { label: 'Recourse available', value: 'None', danger: true },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < 3 ? '1px solid #F4F4F5' : 'none' }}>
                  <span style={{ fontSize: 13, color: '#9B9B9B', fontFamily: 'Inter, sans-serif' }}>{row.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Bricolage Grotesque, sans-serif', color: row.danger ? '#F04438' : '#0F0F0F' }}>{row.value}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Solution cards */}
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#D97757', letterSpacing: '2px', textTransform: 'uppercase', display: 'block', marginBottom: 16 }}>The Solution</span>
            <h2 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#0F0F0F', lineHeight: 1.15, letterSpacing: -1, maxWidth: 600, margin: '0 auto 16px' }}>
              Auto-pays before Ravi even knows the event happened.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {[
              { icon: '🌊', title: 'Flood Alert', desc: 'IMD Red/Orange alert in your zone triggers 100% weekly payout automatically.', stat: '100% payout' },
              { icon: '📱', title: 'Platform Outage', desc: 'Zepto, Swiggy, Blinkit down for 2+ hours — 75% payout, no claim needed.', stat: '75% payout' },
              { icon: '🚫', title: 'Govt Curfew', desc: 'Section 144 or lockdown in your area — full coverage, verified by admin API.', stat: '100% payout' },
              { icon: '⚡', title: 'Under 2 Hours', desc: 'From trigger detected to UPI credit — faster than any insurance in India.', stat: '< 2hr pay' },
            ].map((card, i) => (
              <motion.div key={i} whileHover={{ y: -4 }} style={{ background: 'white', borderRadius: 16, padding: 24, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #F4F4F5' }}>
                <span style={{ fontSize: 32 }}>{card.icon}</span>
                <h3 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 18, fontWeight: 700, color: '#0F0F0F', margin: '12px 0 8px' }}>{card.title}</h3>
                <p style={{ fontSize: 13, color: '#6B6B6B', fontFamily: 'Inter, sans-serif', lineHeight: 1.5, margin: '0 0 16px' }}>{card.desc}</p>
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#D97757', background: '#FDF1ED', padding: '4px 12px', borderRadius: 999 }}>{card.stat}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="coverage" style={{ padding: 'clamp(60px, 8vw, 100px) max(20px, 8vw)', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(8px)' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#0F0F0F', letterSpacing: -1, marginBottom: 16 }}>How GuidePay works</h2>
          </div>
          <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { step: '01', title: 'Sign up with your phone', desc: 'Google login or OTP — no documents, no paperwork. Done in 2 minutes.', icon: Phone },
              { step: '02', title: 'Set your delivery zone', desc: 'We detect your location and geofence a 5km coverage radius around your zone.', icon: MapPin },
              { step: '03', title: 'Pay ₹49–69/week', desc: 'Weekly premium based on your zone flood risk and delivery reliability score.', icon: ShieldCheck },
              { step: '04', title: 'Get paid automatically', desc: 'When a trigger fires, we verify you were working and UPI credit hits within 2 hours.', icon: Zap },
            ].map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} style={{ display: 'flex', gap: 20, paddingBottom: 32, position: 'relative' }}>
                  {i < 3 && <div style={{ position: 'absolute', left: 19, top: 44, bottom: 0, width: 1, background: '#E4E4E7' }} />}
                  <div style={{ width: 40, height: 40, borderRadius: 999, background: '#FDF1ED', border: '2px solid #D97757', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                    <Icon size={16} color="#D97757" />
                  </div>
                  <div style={{ paddingTop: 8 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Inter, sans-serif', color: '#D97757', letterSpacing: '1px', margin: '0 0 4px' }}>STEP {item.step}</p>
                    <h3 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 18, fontWeight: 700, color: '#0F0F0F', margin: '0 0 8px' }}>{item.title}</h3>
                    <p style={{ fontSize: 14, color: '#6B6B6B', fontFamily: 'Inter, sans-serif', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* FOR WORKERS */}
        <section id="for-workers" style={{ padding: 'clamp(60px, 8vw, 100px) max(20px, 8vw)', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#0F0F0F', letterSpacing: -1 }}>Built for the way you work</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {[
              { emoji: '📍', title: 'Zone-based coverage', desc: '5km radius monitoring. Your area, your coverage.' },
              { emoji: '💸', title: 'UPI instant credit', desc: 'Payout straight to your UPI. No bank forms.' },
              { emoji: '🤖', title: 'AI fraud protection', desc: 'Honest workers never punished. Fraud caught automatically.' },
              { emoji: '📊', title: 'Risk score rewards', desc: 'Consistent workers get lower premiums. Up to 15% off.' },
              { emoji: '🔔', title: 'Advance warnings', desc: 'AI predicts floods 24h early. Coverage extends automatically.' },
              { emoji: '❌', title: 'Zero paperwork', desc: 'No forms, no documents, no calls. Ever.' },
            ].map((item, i) => (
              <motion.div key={i} whileHover={{ y: -2 }} style={{ background: 'white', borderRadius: 14, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #F4F4F5' }}>
                <span style={{ fontSize: 28, display: 'block', marginBottom: 12 }}>{item.emoji}</span>
                <h3 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 16, fontWeight: 700, color: '#0F0F0F', marginBottom: 6 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: '#6B6B6B', fontFamily: 'Inter, sans-serif', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) max(20px, 8vw)', textAlign: 'center' }}>
          <motion.div whileHover={{ scale: 1.01 }} style={{ maxWidth: 640, margin: '0 auto', background: 'white', borderRadius: 24, padding: 'clamp(40px, 6vw, 64px)', boxShadow: '0 8px 48px rgba(0,0,0,0.1)', border: '1px solid #F4F4F5' }}>
            <h2 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: '#0F0F0F', letterSpacing: -1, marginBottom: 16 }}>Start your protection today</h2>
            <p style={{ fontSize: 16, color: '#6B6B6B', fontFamily: 'Inter, sans-serif', marginBottom: 32, lineHeight: 1.5 }}>Join thousands of delivery workers already protected by GuidePay. From ₹49/week.</p>
            <motion.button onClick={() => navigate('/login')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ padding: '16px 36px', borderRadius: 12, border: 'none', background: '#D97757', color: 'white', fontSize: 16, fontWeight: 700, fontFamily: 'Inter, sans-serif', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(217,119,87,0.4)' }}>
              Get protected — ₹49/week <ArrowRight size={18} />
            </motion.button>
            <p style={{ fontSize: 12, color: '#9B9B9B', fontFamily: 'Inter, sans-serif', marginTop: 16 }}>No commitment · Cancel anytime · UPI payment</p>
          </motion.div>
        </section>

        {/* FOOTER */}
        <footer style={{ borderTop: '1px solid #F4F4F5', padding: 'clamp(32px, 5vw, 48px) max(20px, 5vw)', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={18} color="#D97757" />
              <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 16, fontWeight: 700, color: '#0F0F0F' }}>GuidePay</span>
              <span style={{ fontSize: 12, color: '#9B9B9B', fontFamily: 'Inter, sans-serif' }}>· Team SentinelX · KL University</span>
            </div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {['Privacy Policy', 'Terms of Service', 'Contact'].map(link => (
                <a key={link} href={link === 'Privacy Policy' ? '/privacy' : link === 'Terms of Service' ? '/terms' : '#'}
                  style={{ fontSize: 13, color: '#9B9B9B', fontFamily: 'Inter, sans-serif', textDecoration: 'none' }}>{link}</a>
              ))}
            </div>
            <p style={{ fontSize: 12, color: '#C4C4C4', fontFamily: 'Inter, sans-serif', margin: 0 }}>© 2026 GuidePay · Guidewire DEVTrails 2026</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Landing
