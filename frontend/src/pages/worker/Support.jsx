import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ArrowLeft, Send, MessageSquare, ChevronRight } from 'lucide-react'
import { useWorkerStore } from '../../store/workerStore'

const CATEGORIES = [
  'Claim not processed',
  'Payment issue',
  'Coverage question',
  'App problem',
  'Premium concern',
  'Other',
]

const STATUS_COLORS = {
  open: { bg: '#FFFAEB', text: '#F79009', border: '#FDE68A' },
  resolved: { bg: '#ECFDF3', text: '#12B76A', border: '#A7F3D0' },
  pending: { bg: '#EFF8FF', text: '#2E90FA', border: '#BFDBFE' },
}

function getTickets(workerId) {
  try {
    const raw = localStorage.getItem('gp-support-tickets')
    const all = raw ? JSON.parse(raw) : []
    return all.filter(t => t.workerId === workerId)
  } catch { return [] }
}

function saveTicket(ticket) {
  try {
    const raw = localStorage.getItem('gp-support-tickets')
    const all = raw ? JSON.parse(raw) : []
    all.push(ticket)
    localStorage.setItem('gp-support-tickets', JSON.stringify(all))
  } catch {}
}

function updateTicket(ticketId, updates) {
  try {
    const raw = localStorage.getItem('gp-support-tickets')
    const all = raw ? JSON.parse(raw) : []
    const idx = all.findIndex(t => t.id === ticketId)
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...updates }
      localStorage.setItem('gp-support-tickets', JSON.stringify(all))
    }
  } catch {}
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
}

export default function Support() {
  const worker = useWorkerStore(s => s.worker)
  const workerId = worker?.id || worker?._id || 'demo-user'
  const workerName = worker?.name || 'You'

  const [view, setView] = useState('list') // 'list' | 'new' | 'chat'
  const [tickets, setTickets] = useState([])
  const [activeTicket, setActiveTicket] = useState(null)
  const [newMsg, setNewMsg] = useState('')
  const messagesEndRef = useRef(null)

  // New ticket form
  const [category, setCategory] = useState(CATEGORIES[0])
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const refresh = () => setTickets(getTickets(workerId))

  useEffect(() => { refresh() }, [workerId])
  useEffect(() => {
    if (view === 'chat') {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }, [view, activeTicket?.messages])

  const createTicket = (e) => {
    e.preventDefault()
    const ticket = {
      id: `TKT-${Date.now()}`,
      workerId,
      workerName,
      category,
      subject,
      status: 'open',
      createdAt: new Date().toISOString(),
      messages: [
        { from: 'worker', text: body, time: new Date().toISOString() },
        { from: 'support', text: `Hi ${workerName}! We've received your ticket about "${subject}". Our team will respond within 24 hours.`, time: new Date(Date.now() + 2000).toISOString() },
      ],
    }
    saveTicket(ticket)
    setSubject('')
    setBody('')
    setCategory(CATEGORIES[0])
    refresh()
    setActiveTicket(ticket)
    setView('chat')
  }

  const sendMessage = (e) => {
    e.preventDefault()
    if (!newMsg.trim() || !activeTicket) return
    const updatedMessages = [
      ...activeTicket.messages,
      { from: 'worker', text: newMsg.trim(), time: new Date().toISOString() },
    ]
    updateTicket(activeTicket.id, { messages: updatedMessages })
    setActiveTicket(prev => ({ ...prev, messages: updatedMessages }))
    setNewMsg('')

    // Auto-reply after 1.5s
    setTimeout(() => {
      const autoReply = { from: 'support', text: 'Thanks for the update! Our team is looking into this. We\'ll get back to you soon.', time: new Date().toISOString() }
      const withReply = [...updatedMessages, autoReply]
      updateTicket(activeTicket.id, { messages: withReply })
      setActiveTicket(prev => prev ? { ...prev, messages: withReply } : prev)
    }, 1500)
  }

  const openTicket = (ticket) => {
    setActiveTicket(ticket)
    setView('chat')
  }

  if (view === 'new') {
    return (
      <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
        style={{ padding: '16px 16px 100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button onClick={() => setView('list')} style={{
            background: 'var(--bg-tertiary)', border: 'none', borderRadius: 8,
            width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ArrowLeft size={18} style={{ color: 'var(--text-primary)' }} />
          </button>
          <h2 style={{ fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', margin: 0 }}>
            New Ticket
          </h2>
        </div>

        <form onSubmit={createTicket} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Category
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {CATEGORIES.map(c => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCategory(c)}
                  style={{
                    padding: '6px 12px', borderRadius: 999,
                    border: `1px solid ${category === c ? 'var(--brand)' : 'var(--border)'}`,
                    background: category === c ? 'var(--brand-light)' : 'var(--bg-card)',
                    color: category === c ? 'var(--brand)' : 'var(--text-secondary)',
                    fontSize: 13, fontFamily: 'Inter', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Brief description of your issue"
              required
              style={{
                width: '100%', height: 46, borderRadius: 10,
                border: '1.5px solid var(--border)', background: 'var(--bg-card)',
                padding: '0 14px', fontSize: 14, fontFamily: 'Inter',
                color: 'var(--text-primary)', outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Description
            </label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Describe your issue in detail..."
              required
              rows={5}
              style={{
                width: '100%', borderRadius: 10,
                border: '1.5px solid var(--border)', background: 'var(--bg-card)',
                padding: '12px 14px', fontSize: 14, fontFamily: 'Inter',
                color: 'var(--text-primary)', outline: 'none', resize: 'vertical',
              }}
            />
          </div>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            style={{
              height: 50, borderRadius: 12, background: 'var(--brand)',
              border: 'none', color: 'white', fontSize: 15, fontWeight: 700,
              fontFamily: 'Inter', cursor: 'pointer',
            }}
          >
            Submit Ticket
          </motion.button>
        </form>
      </motion.div>
    )
  }

  if (view === 'chat' && activeTicket) {
    const colors = STATUS_COLORS[activeTicket.status] || STATUS_COLORS.open
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--border-light)',
          background: 'var(--bg-card)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <button onClick={() => { setView('list'); refresh() }} style={{
            background: 'var(--bg-tertiary)', border: 'none', borderRadius: 8,
            width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ArrowLeft size={18} style={{ color: 'var(--text-primary)' }} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', fontFamily: 'Bricolage Grotesque', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeTicket.subject}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'Inter', margin: 0 }}>
              {activeTicket.id} · {activeTicket.category}
            </p>
          </div>
          <span style={{
            padding: '4px 10px', borderRadius: 999,
            background: colors.bg, color: colors.text,
            border: `1px solid ${colors.border}`,
            fontSize: 11, fontWeight: 700, fontFamily: 'Inter', textTransform: 'capitalize',
          }}>
            {activeTicket.status}
          </span>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {activeTicket.messages.map((msg, i) => {
            const isWorker = msg.from === 'worker'
            return (
              <div key={i} style={{ display: 'flex', justifyContent: isWorker ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '78%',
                  background: isWorker ? 'var(--brand)' : 'var(--bg-card)',
                  border: isWorker ? 'none' : '1px solid var(--border-light)',
                  borderRadius: isWorker ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  padding: '10px 14px',
                }}>
                  <p style={{ fontSize: 14, fontFamily: 'Inter', color: isWorker ? 'white' : 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                    {msg.text}
                  </p>
                  <p style={{ fontSize: 11, color: isWorker ? 'rgba(255,255,255,0.65)' : 'var(--text-tertiary)', margin: '4px 0 0', fontFamily: 'Inter' }}>
                    {new Date(msg.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {activeTicket.status !== 'resolved' && (
          <form onSubmit={sendMessage} style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border-light)',
            background: 'var(--bg-card)',
            display: 'flex', gap: 10, alignItems: 'flex-end',
          }}>
            <input
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              placeholder="Type a message..."
              style={{
                flex: 1, height: 44, borderRadius: 10,
                border: '1.5px solid var(--border)', background: 'var(--bg-secondary)',
                padding: '0 14px', fontSize: 14, fontFamily: 'Inter',
                color: 'var(--text-primary)', outline: 'none',
              }}
            />
            <motion.button
              type="submit"
              whileTap={{ scale: 0.94 }}
              style={{
                width: 44, height: 44, borderRadius: 10,
                background: 'var(--brand)', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Send size={18} color="white" />
            </motion.button>
          </form>
        )}
      </div>
    )
  }

  // List view
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit"
      style={{ padding: '16px 16px 100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'Bricolage Grotesque', fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', margin: 0 }}>
          Support
        </h2>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setView('new')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--brand)', border: 'none', borderRadius: 10,
            padding: '8px 14px', cursor: 'pointer',
            color: 'white', fontSize: 13, fontWeight: 700, fontFamily: 'Inter',
          }}
        >
          <Plus size={15} />
          New Ticket
        </motion.button>
      </div>

      {tickets.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--bg-card)', borderRadius: 16,
          border: '1px solid var(--border-light)',
        }}>
          <MessageSquare size={36} style={{ color: 'var(--text-tertiary)', marginBottom: 12 }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Bricolage Grotesque', margin: '0 0 6px' }}>
            No support tickets yet
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', fontFamily: 'Inter', margin: 0 }}>
            Tap "New Ticket" to get help from our team
          </p>
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-card)', borderRadius: 16,
          border: '1px solid var(--border-light)',
          overflow: 'hidden',
        }}>
          {tickets.map((ticket, i) => {
            const colors = STATUS_COLORS[ticket.status] || STATUS_COLORS.open
            return (
              <motion.button
                key={ticket.id}
                whileTap={{ scale: 0.99 }}
                onClick={() => openTicket(ticket)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '14px 16px',
                  borderBottom: i < tickets.length - 1 ? '1px solid var(--border-light)' : 'none',
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ticket.subject}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'Inter', margin: '3px 0 0' }}>
                    {ticket.id} · {ticket.category}
                  </p>
                </div>
                <span style={{
                  padding: '3px 8px', borderRadius: 999, flexShrink: 0,
                  background: colors.bg, color: colors.text,
                  border: `1px solid ${colors.border}`,
                  fontSize: 11, fontWeight: 700, fontFamily: 'Inter', textTransform: 'capitalize',
                }}>
                  {ticket.status}
                </span>
                <ChevronRight size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
              </motion.button>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
