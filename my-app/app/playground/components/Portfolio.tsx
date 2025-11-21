"use client"
import React from "react"

export default function Portfolio({ holdings, prices }: { holdings: Record<string, { qty: number; avg: number }>; prices: Record<string, number> }) {
  const entries = Object.entries(holdings)
  const totalValue = entries.reduce((s, [sym, h]) => s + (prices[sym] || 0) * h.qty, 0)

  return (
    <div style={{ padding: 12, border: '1px solid #e6e6e6', borderRadius: 8, background: '#fff' }}>
      <h3 style={{ marginTop: 0 }}>Portfolio</h3>
      {entries.length === 0 ? <div>No holdings yet</div> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>Symbol</th>
              <th style={th}>Qty</th>
              <th style={th}>Avg</th>
              <th style={th}>Market</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([sym, h]) => (
              <tr key={sym}>
                <td style={td}>{sym}</td>
                <td style={td}>{h.qty}</td>
                <td style={td}>{h.avg}</td>
                <td style={td}>{((prices[sym] || 0) * h.qty).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 12 }}><strong>Total market value:</strong> {totalValue.toFixed(2)}</div>
    </div>
  )
}

const th: React.CSSProperties = { textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid #eee' }
const td: React.CSSProperties = { padding: '6px 8px', borderBottom: '1px solid #fafafa' }
