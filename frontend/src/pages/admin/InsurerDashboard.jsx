import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie,
  Cell, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Legend
} from 'recharts'

const MOCK_DATA = {
  kpis: [
    { label: 'Active Policies', value: '847',
      change: '+12%', up: true, icon: '🛡️' },
    { label: 'Weekly Revenue', value: '₹47,770',
      change: '+8%', up: true, icon: '💰' },
    { label: 'Loss Ratio', value: '24.5%',
      change: '-3%', up: false, icon: '📊' },
    { label: 'Avg Payout Time', value: '47 min',
      change: '-12 min', up: false, icon: '⚡' },
    { label: 'Fraud Prevented', value: '₹18,400',
      change: 'This week', up: true, icon: '🔐' },
    { label: 'Auto-Approval Rate', value: '89%',
      change: '+2%', up: true, icon: '✓' },
  ],
  weekly_revenue: [
    { week: 'W1', premium: 38200, payouts: 8400 },
    { week: 'W2', premium: 41100, payouts: 11200 },
    { week: 'W3', premium: 43800, payouts: 9600 },
    { week: 'W4', premium: 47770, payouts: 11700 },
  ],
  trigger_breakdown: [
    { name: 'Flood', value: 67, color: '#2E90FA' },
    { name: 'Outage', value: 24, color: '#F79009' },
    { name: 'Curfew', value: 9, color: '#F04438' },
  ],
  zone_exposure: [
    { zone: 'Kondapur, Hyderabad', workers: 312,
      exposure: 187200, risk: 'HIGH' },
    { zone: 'Kurla, Mumbai', workers: 198,
      exposure: 118800, risk: 'HIGH' },
    { zone: 'T.Nagar, Chennai', workers: 143,
      exposure: 85800, risk: 'MEDIUM' },
    { zone: 'Koramangala, Bengaluru', workers: 127,
      exposure: 76200, risk: 'LOW' },
    { zone: 'Dwarka, Delhi', workers: 67,
      exposure: 40200, risk: 'LOW' },
  ],
  fraud_stats: {
    total_checked: 208,
    auto_approved: 185,
    manual_review: 16,
    rejected: 7,
    money_saved: 18400,
  },
  loss_ratio_trend: [
    { month: 'Nov', ratio: 31 },
    { month: 'Dec', ratio: 28 },
    { month: 'Jan', ratio: 26 },
    { month: 'Feb', ratio: 25 },
    { month: 'Mar', ratio: 24.5 },
  ],
}

const InsurerDashboard = () => {
  const [data, setData] = useState(MOCK_DATA)
  const [period, setPeriod] = useState('month')

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      paddingBottom: 40,
    }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'Bricolage Grotesque',
            fontSize: 22, fontWeight: 800,
            color: 'var(--text-primary)', margin: 0,
          }}>
            Insurer Dashboard
          </h1>
          <p style={{
            fontSize: 13, fontFamily: 'Inter',
            color: 'var(--text-tertiary)',
            margin: '2px 0 0',
          }}>
            GuidePay Portfolio — Week 14, 2026
          </p>
        </div>
        <div style={{
          background: 'rgba(18,183,106,0.1)',
          border: '1px solid rgba(18,183,106,0.25)',
          borderRadius: 8,
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <div style={{
            width: 6, height: 6,
            borderRadius: 999,
            background: '#12B76A',
          }}/>
          <span style={{
            fontSize: 12, fontWeight: 700,
            fontFamily: 'Inter', color: '#12B76A',
          }}>
            Portfolio Healthy
          </span>
        </div>
      </div>

      <div style={{ padding: 20 }}>

        {/* KPI Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}>
          {data.kpis.map(kpi => (
            <div key={kpi.label} style={{
              background: 'var(--bg-card)',
              borderRadius: 14,
              padding: '14px 16px',
              border: '1px solid var(--border)',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 6,
              }}>
                <span style={{ fontSize: 18 }}>
                  {kpi.icon}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700,
                  fontFamily: 'Inter',
                  color: kpi.up ? '#12B76A' : '#F04438',
                  background: kpi.up
                    ? 'rgba(18,183,106,0.1)'
                    : 'rgba(240,68,56,0.1)',
                  padding: '2px 6px',
                  borderRadius: 999,
                }}>
                  {kpi.change}
                </span>
              </div>
              <p style={{
                fontFamily: 'Bricolage Grotesque',
                fontSize: 22, fontWeight: 800,
                color: 'var(--text-primary)',
                margin: '0 0 2px',
              }}>
                {kpi.value}
              </p>
              <p style={{
                fontSize: 11, fontFamily: 'Inter',
                color: 'var(--text-tertiary)', margin: 0,
              }}>
                {kpi.label}
              </p>
            </div>
          ))}
        </div>

        {/* Revenue vs Payouts chart */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          border: '1px solid var(--border)',
        }}>
          <p style={{
            fontFamily: 'Bricolage Grotesque',
            fontSize: 15, fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 16px',
          }}>
            Premium vs Payouts
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.weekly_revenue}>
              <XAxis dataKey="week" tick={{
                fontSize: 11, fontFamily: 'Inter',
                fill: 'var(--text-tertiary)',
              }}/>
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontFamily: 'Inter',
                  fontSize: 12,
                }}
                formatter={(v) => `₹${v.toLocaleString()}`}
              />
              <Bar dataKey="premium" fill="#D97757"
                radius={[4,4,0,0]} name="Premium"/>
              <Bar dataKey="payouts" fill="#2E90FA"
                radius={[4,4,0,0]} name="Payouts"/>
            </BarChart>
          </ResponsiveContainer>
          <div style={{
            display: 'flex',
            gap: 16,
            justifyContent: 'center',
            marginTop: 8,
          }}>
            {[
              { color: '#D97757', label: 'Premium collected' },
              { color: '#2E90FA', label: 'Payouts made' },
            ].map(l => (
              <div key={l.label} style={{
                display: 'flex',
                alignItems: 'center', gap: 5,
              }}>
                <div style={{
                  width: 8, height: 8,
                  borderRadius: 2,
                  background: l.color,
                }}/>
                <span style={{
                  fontSize: 11, fontFamily: 'Inter',
                  color: 'var(--text-tertiary)',
                }}>
                  {l.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Trigger breakdown + Fraud stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 16,
        }}>
          {/* Trigger pie */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 16,
            padding: 16,
            border: '1px solid var(--border)',
          }}>
            <p style={{
              fontFamily: 'Bricolage Grotesque',
              fontSize: 13, fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 12px',
            }}>
              Claims by Trigger
            </p>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={data.trigger_breakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={50}
                  innerRadius={30}
                >
                  {data.trigger_breakdown.map((e, i) => (
                    <Cell key={i} fill={e.color}/>
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => `${v}%`}
                  contentStyle={{
                    fontSize: 11,
                    fontFamily: 'Inter',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            {data.trigger_breakdown.map(t => (
              <div key={t.name} style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center', gap: 5,
                }}>
                  <div style={{
                    width: 6, height: 6,
                    borderRadius: 999, background: t.color,
                  }}/>
                  <span style={{
                    fontSize: 11, fontFamily: 'Inter',
                    color: 'var(--text-secondary)',
                  }}>
                    {t.name}
                  </span>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  fontFamily: 'Inter',
                  color: 'var(--text-primary)',
                }}>
                  {t.value}%
                </span>
              </div>
            ))}
          </div>

          {/* Fraud stats */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 16,
            padding: 16,
            border: '1px solid var(--border)',
          }}>
            <p style={{
              fontFamily: 'Bricolage Grotesque',
              fontSize: 13, fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '0 0 12px',
            }}>
              Fraud Prevention
            </p>
            {[
              { label: 'Auto-approved',
                value: data.fraud_stats.auto_approved,
                color: '#12B76A' },
              { label: 'Manual review',
                value: data.fraud_stats.manual_review,
                color: '#F79009' },
              { label: 'Rejected',
                value: data.fraud_stats.rejected,
                color: '#F04438' },
            ].map(stat => (
              <div key={stat.label} style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}>
                <span style={{
                  fontSize: 12, fontFamily: 'Inter',
                  color: 'var(--text-secondary)',
                }}>
                  {stat.label}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  fontFamily: 'Inter', color: stat.color,
                }}>
                  {stat.value}
                </span>
              </div>
            ))}
            <div style={{
              marginTop: 10,
              padding: '8px 10px',
              background: 'rgba(18,183,106,0.08)',
              borderRadius: 8,
            }}>
              <p style={{
                fontSize: 11, fontWeight: 700,
                fontFamily: 'Inter', color: '#12B76A',
                margin: 0,
              }}>
                💰 ₹{data.fraud_stats.money_saved.toLocaleString()} saved
              </p>
              <p style={{
                fontSize: 10, fontFamily: 'Inter',
                color: 'var(--text-tertiary)', margin: 0,
              }}>
                Fraud prevention this week
              </p>
            </div>
          </div>
        </div>

        {/* Zone exposure table */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 16,
          border: '1px solid var(--border)',
          overflow: 'hidden',
          marginBottom: 16,
        }}>
          <div style={{ padding: '16px 20px 12px' }}>
            <p style={{
              fontFamily: 'Bricolage Grotesque',
              fontSize: 15, fontWeight: 700,
              color: 'var(--text-primary)', margin: 0,
            }}>
              Zone Exposure
            </p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: 12,
              fontFamily: 'Inter',
            }}>
              <thead>
                <tr style={{
                  background: 'var(--bg-secondary)',
                }}>
                  {['Zone', 'Workers', 'Exposure',
                    'Risk'].map(h => (
                    <th key={h} style={{
                      padding: '8px 16px',
                      textAlign: 'left',
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'var(--text-tertiary)',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.zone_exposure.map((row, i) => (
                  <tr key={i} style={{
                    borderTop: '1px solid var(--border-light)',
                  }}>
                    <td style={{ padding: '12px 16px',
                      color: 'var(--text-primary)',
                      fontWeight: 600 }}>
                      {row.zone}
                    </td>
                    <td style={{ padding: '12px 16px',
                      color: 'var(--text-secondary)' }}>
                      {row.workers}
                    </td>
                    <td style={{ padding: '12px 16px',
                      color: 'var(--text-secondary)' }}>
                      ₹{row.exposure.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 999,
                        background: row.risk === 'HIGH'
                          ? 'rgba(240,68,56,0.1)'
                          : row.risk === 'MEDIUM'
                          ? 'rgba(247,144,9,0.1)'
                          : 'rgba(18,183,106,0.1)',
                        color: row.risk === 'HIGH'
                          ? '#F04438'
                          : row.risk === 'MEDIUM'
                          ? '#F79009' : '#12B76A',
                      }}>
                        {row.risk}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Loss Ratio Trend */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          border: '1px solid var(--border)',
        }}>
          <p style={{
            fontFamily: 'Bricolage Grotesque',
            fontSize: 15, fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 16px',
          }}>
            Loss Ratio Trend
          </p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={data.loss_ratio_trend}>
              <XAxis dataKey="month" tick={{
                fontSize: 11, fontFamily: 'Inter',
                fill: 'var(--text-tertiary)',
              }}/>
              <YAxis tick={{
                fontSize: 11, fontFamily: 'Inter',
                fill: 'var(--text-tertiary)',
              }} domain={[0, 40]}/>
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontFamily: 'Inter',
                  fontSize: 12,
                }}
                formatter={(v) => `${v}%`}
              />
              <Line
                type="monotone"
                dataKey="ratio"
                stroke="#12B76A"
                strokeWidth={2}
                dot={{ fill: '#12B76A', r: 4 }}
                name="Loss Ratio"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  )
}

export default InsurerDashboard
