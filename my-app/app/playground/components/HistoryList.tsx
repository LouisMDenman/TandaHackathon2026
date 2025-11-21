"use client"
import React from "react"

export default function HistoryList({ items }: { items: any[] }) {
  return (
    <div style={{ padding: 12, border: '1px solid #e6e6e6', borderRadius: 8, background: '#fff' }}>
      <h3 style={{ marginTop: 0 }}>Transaction History</h3>
      {items.length === 0 ? <div>No trades yet</div> : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {items.map((it, idx) => (
            <li key={idx} style={{ padding: '8px 0', borderBottom: '1px dashed #eee' }}>
              <div style={{ fontSize: 12, color: '#666' }}>{new Date(it.time).toLocaleString()}</div>
              <div><strong>{it.side.toUpperCase()}</strong> {it.qty} {it.symbol} @ {it.price.toFixed(2)}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
