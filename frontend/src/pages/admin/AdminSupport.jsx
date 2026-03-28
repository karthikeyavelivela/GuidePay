import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle, MessageSquare } from 'lucide-react'

const STATUS_COLORS = {
  open:     { bg: '#FFFAEB', text: '#F79009', border: '#FDE68A' },
  resolved: { bg: '#ECFDF3', text: '#12B76A', border: '#A7F3D0' },
  pending:  { bg: '#EFF8FF', text: '#2E90FA', border: '#BFDBFE' },
}

function getAllTickets() {
  try {
    const raw = localStorage.getItem('gp-support-tickets')
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function updateTicketInStorage(ticketId, updates) {
  try {
    const all = getAllTickets()
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

export default function AdminSupport() {
  const [tickets, setTickets] = useState([])
  const [selected, setSelected] = useState(null)
  const [reply, setReply] = useState('')
  const [filter, setFilter] = useState('all')
  const messagesEndRef = useRef(null)

  const refresh = () => {
    const all = getAllTickets()
    setTickets(all)
    // Refresh selected ticket if open
    if (selected) {
      const updated = all.find(t => t.id === selected.id)
      if (updated) setSelected(updated)
    }
  }

  useEffect(() => {
    refresh()
    // Poll every 5 seconds
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }, [selected?.messages])

  const handleReply = (e) => {
    e.preventDefault()
    if (!reply.trim() || !selected) return
    const newMsg = { from: 'support', text: reply.trim(), time: new Date().toISOString() }
    const updatedMessages = [...(selected.messages || []), newMsg]
    updateTicketInStorage(selected.id, { messages: updatedMessages, status: 'pending' })
    setReply('')
    refresh()
  }

  const handleResolve = () => {
    if (!selected) return
    updateTicketInStorage(selected.id, { status: 'resolved' })
    refresh()
  }

  const filtered = tickets.filter(t => {
    if (filter === 'all') return true
    return t.status === filter
  })

  const FILTERS = ['all', 'open', 'pending', 'resolved']

  return (
    <motion.div
      variants={pageVariants} initial="initial" animate="animate" exit="exit"
      style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <div style={{
        padding: '16px 20px 12px',
        borderBottom: '1px solid #1A1A1A',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <h2 style={{ fontFamily: 'Bricolage Grotesque', fontWeight: 800, fontSize: 18, color: 'white', margin: 0 }}>
          Support Inbox
        </h2>
        <span style={{
          fontSize: 11, fontWeight: 700, fontFamily: 'Inter',
          background: '#12B76A', color: 'white',
          padding: '3px 8px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: 0.5,
        }}>
          Live
        </span>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: 'calc(100vh - 112px)' }}>
        {/* Left pane — ticket list */}
        <div style={{
          width: 300, flexShrink: 0,
          borderRight: '1px solid #1A1A1A',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}>
          {/* Filter pills */}
          <div style={{ padding: '12px 12px 8px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '4px 10px', borderRadius: 999,
                  border: `1px solid ${filter === f ? '#D97757' : '#2A2A2A'}`,
                  background: filter === f ? 'rgba(217,119,87,0.12)' : 'transparent',
                  color: filter === f ? '#D97757' : '#6B6B6B',
                  fontSize: 12, fontWeight: 600, fontFamily: 'Inter', cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px' }}>
              <MessageSquare size={28} color="#3D3D3D" style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 13, color: '#6B6B6B', fontFamily: 'Inter', margin: 0 }}>No tickets</p>
            </div>
          ) : filtered.map(ticket => {
            const colors = STATUS_COLORS[ticket.status] || STATUS_COLORS.open
            const isActive = selected?.id === ticket.id
            return (
              <button
                key={ticket.id}
                onClick={() => setSelected(ticket)}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '12px 14px',
                  borderBottom: '1px solid #1A1A1A',
                  background: isActive ? '#1A1A1A' : 'none',
                  border: 'none', cursor: 'pointer',
                  borderLeft: isActive ? '3px solid #D97757' : '3px solid transparent',
                  transition: 'background 0.12s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <p style={{
                    fontSize: 13, fontWeight: 600, color: 'white',
                    fontFamily: 'Inter', margin: 0,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                  }}>
                    {ticket.subject}
                  </p>
                  <span style={{
                    padding: '2px 7px', borderRadius: 999, flexShrink: 0,
                    background: colors.bg, color: colors.text,
                    fontSize: 10, fontWeight: 700, fontFamily: 'Inter', textTransform: 'capitalize',
                  }}>
                    {ticket.status}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: '#6B6B6B', fontFamily: 'Inter', margin: '4px 0 0' }}>
                  {ticket.workerName} · {ticket.category}
                </p>
              </button>
            )
          })}
        </div>

        {/* Right pane — conversation */}
        {selected ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Ticket header */}
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid #1A1A1A',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'white', fontFamily: 'Bricolage Grotesque', margin: 0 }}>
                  {selected.subject}
                </p>
                <p style={{ fontSize: 12, color: '#6B6B6B', fontFamily: 'Inter', margin: '2px 0 0' }}>
                  {selected.id} · {selected.workerName} · {selected.category}
                </p>
              </div>
              {selected.status !== 'resolved' && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleResolve}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', borderRadius: 8,
                    background: 'rgba(18,183,106,0.12)', border: '1px solid rgba(18,183,106,0.25)',
                    color: '#12B76A', fontSize: 13, fontWeight: 600, fontFamily: 'Inter',
                    cursor: 'pointer',
                  }}
                >
                  <CheckCircle size={14} />
                  Resolve
                </motion.button>
              )}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(selected.messages || []).map((msg, i) => {
                const isSupport = msg.from === 'support'
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: isSupport ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '72%',
                      background: isSupport ? '#D97757' : '#1A1A1A',
                      border: isSupport ? 'none' : '1px solid #2A2A2A',
                      borderRadius: isSupport ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      padding: '10px 14px',
                    }}>
                      <p style={{ fontSize: 13, fontFamily: 'Inter', color: isSupport ? 'white' : '#E0E0E0', margin: 0, lineHeight: 1.5 }}>
                        {msg.text}
                      </p>
                      <p style={{ fontSize: 11, color: isSupport ? 'rgba(255,255,255,0.6)' : '#6B6B6B', margin: '4px 0 0', fontFamily: 'Inter' }}>
                        {msg.from === 'worker' ? selected.workerName : 'Support'} · {new Date(msg.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply input */}
            {selected.status !== 'resolved' && (
              <form onSubmit={handleReply} style={{
                padding: '12px 20px',
                borderTop: '1px solid #1A1A1A',
                background: '#111111',
                display: 'flex', gap: 10, alignItems: 'flex-end',
              }}>
                <input
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder="Reply to worker..."
                  style={{
                    flex: 1, height: 44, borderRadius: 10,
                    border: '1px solid #2A2A2A', background: '#1A1A1A',
                    padding: '0 14px', fontSize: 14, fontFamily: 'Inter',
                    color: 'white', outline: 'none',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#D97757' }}
                  onBlur={e => { e.target.style.borderColor = '#2A2A2A' }}
                />
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.94 }}
                  style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: '#D97757', border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Send size={18} color="white" />
                </motion.button>
              </form>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <MessageSquare size={40} color="#2A2A2A" />
            <p style={{ fontSize: 14, color: '#6B6B6B', fontFamily: 'Inter' }}>Select a ticket to view conversation</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
