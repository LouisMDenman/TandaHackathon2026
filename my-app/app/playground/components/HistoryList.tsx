"use client"
import React from "react"

export default function HistoryList({ items }: { items: any[] }) {
  return (
    <div style={{ padding: 0 }}>
      {items.length === 0 ? (
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
          No trades yet. Start trading to see your history!
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '600px', overflowY: 'auto' }}>
          {items.map((it, idx) => {
            const isBuy = it.side === 'buy'
            return (
              <li 
                key={idx} 
                style={{ 
                  padding: '20px', 
                  borderBottom: idx === items.length - 1 ? 'none' : '1px solid #f1f5f9',
                  background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                  borderRadius: idx === 0 ? '14px 14px 0 0' : idx === items.length - 1 ? '0 0 14px 14px' : '0',
                  transition: 'all 0.2s',
                  cursor: 'default'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <div style={{ 
                    display: 'inline-block',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    background: isBuy ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    boxShadow: isBuy ? '0 4px 16px rgba(16, 185, 129, 0.3)' : '0 4px 16px rgba(239, 68, 68, 0.3)'
                  }}>
                    {isBuy ? '🚀 BUY' : '💸 SELL'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, textAlign: 'right' }}>
                    {new Date(it.time).toLocaleDateString()}<br/>
                    {new Date(it.time).toLocaleTimeString()}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '17px', 
                  fontWeight: 700, 
                  color: '#0f172a',
                  marginBottom: '6px',
                  letterSpacing: '-0.01em'
                }}>
                  {it.qty} × {it.symbol}
                </div>
                <div style={{ 
                  fontSize: '15px', 
                  color: '#64748b',
                  fontWeight: 600
                }}>
                  @ {it.price.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
                  <span style={{ 
                    marginLeft: '12px',
                    color: '#0f172a',
                    fontWeight: 700
                  }}>
                    = {(it.qty * it.price).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
