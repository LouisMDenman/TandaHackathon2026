"use client"
import React from "react"

export default function TickerCard({ symbol, name, price, currency }: { symbol: string; name: string; price?: number; currency?: string }) {
  const display = price == null ? "—" : new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD', maximumFractionDigits: 2 }).format(price)

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 700 }}>{symbol}</div>
          <div style={{ fontSize: 12, color: '#666' }}>{name}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700 }}>{display}</div>
        </div>
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = { padding: 12, border: '1px solid #e6e6e6', borderRadius: 8, background: '#fff' }
