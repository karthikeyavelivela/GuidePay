import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const INDIA_HOLIDAYS_2026 = [
  { date: '2026-01-14', name: 'Makar Sankranti', type: 'holiday' },
  { date: '2026-01-26', name: 'Republic Day', type: 'holiday' },
  { date: '2026-02-26', name: 'Maha Shivratri', type: 'holiday' },
  { date: '2026-03-18', name: 'Holi', type: 'holiday' },
  { date: '2026-04-02', name: 'Ram Navami', type: 'holiday' },
  { date: '2026-04-14', name: 'Dr. Ambedkar Jayanti', type: 'holiday' },
  { date: '2026-04-23', name: 'Eid ul-Fitr', type: 'holiday' },
  { date: '2026-05-01', name: 'Labour Day', type: 'holiday' },
  { date: '2026-06-01', name: 'Monsoon begins', type: 'monsoon' },
  { date: '2026-06-15', name: 'Pre-monsoon risk', type: 'risk' },
  { date: '2026-07-01', name: 'Peak flood season', type: 'risk' },
  { date: '2026-07-15', name: 'High flood alert', type: 'risk' },
  { date: '2026-07-30', name: 'Eid ul-Adha', type: 'holiday' },
  { date: '2026-08-15', name: 'Independence Day', type: 'holiday' },
  { date: '2026-08-20', name: 'Peak monsoon', type: 'monsoon' },
  { date: '2026-09-01', name: 'Monsoon peak zone', type: 'risk' },
  { date: '2026-09-20', name: 'Monsoon withdrawal begins', type: 'monsoon' },
  { date: '2026-10-02', name: 'Gandhi Jayanti', type: 'holiday' },
  { date: '2026-10-20', name: 'Dussehra', type: 'holiday' },
  { date: '2026-11-04', name: 'Diwali', type: 'holiday' },
  { date: '2026-11-15', name: 'Northeast monsoon', type: 'monsoon' },
  { date: '2026-12-25', name: 'Christmas', type: 'holiday' },
]

const TYPE_COLORS = {
  holiday: { dot: '#D97757', bg: '#FDF1ED', text: '#B85C3A' },
  monsoon: { dot: '#2E90FA', bg: '#EFF8FF', text: '#1A6FD4' },
  risk:    { dot: '#F04438', bg: '#FEF3F2', text: '#C01048' },
}

const TYPE_LABELS = {
  holiday: 'National Holiday',
  monsoon: 'Monsoon Event',
  risk:    'Flood Risk',
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

export default function IndiaCalendar() {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState(null)

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  const holidayMap = {}
  INDIA_HOLIDAYS_2026.forEach(h => {
    const d = new Date(h.date)
    if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
      holidayMap[d.getDate()] = h
    }
  })

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
    setSelected(null)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
    setSelected(null)
  }

  const isToday = (day) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const upcomingEvents = INDIA_HOLIDAYS_2026
    .filter(h => new Date(h.date) >= today)
    .slice(0, 3)

  return (
    <div style={{ borderRadius: 16, background: 'var(--bg-card)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px',
        borderBottom: '1px solid var(--border-light)',
      }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-secondary)' }}>
          <ChevronLeft size={18} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 700, fontFamily: 'Bricolage Grotesque, sans-serif', color: 'var(--text-primary)', margin: 0 }}>
            {MONTHS[viewMonth]} {viewYear}
          </p>
          <p style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'Inter, sans-serif', margin: '2px 0 0' }}>
            India Holiday & Flood Calendar
          </p>
        </div>
        <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-secondary)' }}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 12, padding: '8px 16px', borderBottom: '1px solid var(--border-light)' }}>
        {Object.entries(TYPE_COLORS).map(([type, col]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: 999, background: col.dot }} />
            <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'Inter, sans-serif' }}>{TYPE_LABELS[type]}</span>
          </div>
        ))}
      </div>

      {/* Weekday labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '8px 12px 4px' }}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: 'var(--text-tertiary)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, padding: '0 12px 12px' }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />
          const event = holidayMap[day]
          const col = event ? TYPE_COLORS[event.type] : null
          const isSelected = selected === day
          const _isToday = isToday(day)
          return (
            <motion.button
              key={day}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelected(isSelected ? null : day)}
              style={{
                position: 'relative',
                height: 36, borderRadius: 8,
                border: isSelected ? `1.5px solid ${col?.dot || 'var(--brand)'}` : '1px solid transparent',
                background: isSelected ? (col?.bg || 'var(--brand-light)') : _isToday ? 'var(--brand)' : event ? `${col.dot}12` : 'transparent',
                cursor: event ? 'pointer' : 'default',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span style={{
                fontSize: 12, fontFamily: 'Inter, sans-serif',
                fontWeight: _isToday ? 700 : event ? 600 : 400,
                color: _isToday ? 'white' : isSelected && col ? col.text : event ? col.dot : 'var(--text-primary)',
              }}>
                {day}
              </span>
              {event && (
                <div style={{
                  position: 'absolute', bottom: 3,
                  width: 4, height: 4, borderRadius: 999,
                  background: col.dot,
                }} />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Selected event detail */}
      {selected && holidayMap[selected] && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          style={{
            margin: '0 12px 12px',
            background: TYPE_COLORS[holidayMap[selected].type].bg,
            borderRadius: 10,
            padding: '10px 14px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}
        >
          <div style={{
            width: 8, height: 8, borderRadius: 999, flexShrink: 0,
            background: TYPE_COLORS[holidayMap[selected].type].dot,
          }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: TYPE_COLORS[holidayMap[selected].type].text, margin: '0 0 2px' }}>
              {holidayMap[selected].name}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'Inter, sans-serif', margin: 0 }}>
              {TYPE_LABELS[holidayMap[selected].type]} · {MONTHS[viewMonth]} {selected}
            </p>
          </div>
        </motion.div>
      )}

      {/* Upcoming events */}
      <div style={{ borderTop: '1px solid var(--border-light)', padding: '12px 16px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, fontFamily: 'Inter, sans-serif', color: 'var(--text-tertiary)', letterSpacing: '1px', textTransform: 'uppercase', margin: '0 0 10px' }}>
          Upcoming events
        </p>
        {upcomingEvents.map((ev, i) => {
          const d = new Date(ev.date)
          const col = TYPE_COLORS[ev.type]
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              paddingBottom: i < upcomingEvents.length - 1 ? 10 : 0,
              marginBottom: i < upcomingEvents.length - 1 ? 10 : 0,
              borderBottom: i < upcomingEvents.length - 1 ? '1px solid var(--border-light)' : 'none',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: col.bg,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'Bricolage Grotesque, sans-serif', color: col.dot, lineHeight: 1 }}>{d.getDate()}</span>
                <span style={{ fontSize: 8, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: col.dot }}>{MONTHS[d.getMonth()]}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif', color: 'var(--text-primary)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ev.name}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'Inter, sans-serif', margin: 0 }}>
                  {TYPE_LABELS[ev.type]}
                </p>
              </div>
              <div style={{ width: 6, height: 6, borderRadius: 999, background: col.dot, flexShrink: 0 }} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
