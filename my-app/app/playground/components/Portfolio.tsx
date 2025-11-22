"use client"
import React from "react"

export default function Portfolio({ holdings, prices }: { holdings: Record<string, { qty: number; avg: number }>; prices: Record<string, number> }) {
  const entries = Object.entries(holdings)
  const totalValue = entries.reduce((s, [sym, h]) => s + (prices[sym] || 0) * h.qty, 0)

  return (
    <div style={{ padding: 0 }}>
      {entries.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '48px 24px', 
          color: '#94a3b8',
          fontSize: '15px',
          fontWeight: 500,
          background: '#f8fafc',
          borderRadius: '14px',
          border: '2px dashed #e2e8f0'
        }}>
          No holdings yet. Make your first trade!
        </div>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
            <thead>
              <tr>
                <th style={th}>Symbol</th>
                <th style={th}>Quantity</th>
                <th style={th}>Avg Price</th>
                <th style={th}>Market Value</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([sym, h]) => {
                const currentPrice = prices[sym] || 0
                const marketValue = currentPrice * h.qty
                const profitLoss = marketValue - (h.avg * h.qty)
                const isProfit = profitLoss >= 0
                
                return (
                  <tr key={sym} style={trStyle}>
                    <td style={tdSymbol}>{sym}</td>
                    <td style={td}>{h.qty.toFixed(4)}</td>
                    <td style={td}>{h.avg.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</td>
                    <td style={{ ...td, ...tdValue }}>
                      <div>{marketValue.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: isProfit ? '#10b981' : '#ef4444' }}>
                        {isProfit ? '▲' : '▼'} {Math.abs(profitLoss).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div style={{ 
            padding: '20px', 
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
          }}>
            <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Total Portfolio Value
            </span>
            <strong style={{ fontSize: '24px', color: '#fff', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {totalValue.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
            </strong>
          </div>
        </>
      )}
    </div>
  )
}

const th: React.CSSProperties = { 
  textAlign: 'left', 
  padding: '14px 16px', 
  borderBottom: '2px solid #e2e8f0',
  fontSize: '12px',
  fontWeight: 800,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  background: '#f8fafc'
}

const td: React.CSSProperties = { 
  padding: '16px', 
  borderBottom: '1px solid #f1f5f9',
  fontSize: '15px',
  color: '#334155',
  fontWeight: 600
}

const tdSymbol: React.CSSProperties = {
  ...td,
  color: '#3b82f6',
  fontWeight: 800,
  fontSize: '16px'
}

const tdValue: React.CSSProperties = {
  textAlign: 'right',
  fontWeight: 700,
  fontSize: '16px',
  color: '#0f172a'
}

const trStyle: React.CSSProperties = {
  transition: 'all 0.2s',
  cursor: 'default'
}
