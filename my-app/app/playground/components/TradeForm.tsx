"use client"
import React, { useMemo, useState } from "react"

export default function TradeForm({ symbols, prices, onExecute }: { symbols: { symbol: string; name: string; currency: string }[]; prices: Record<string, number>; onExecute: (p: { symbol: string; side: 'buy' | 'sell'; qty: number; price: number }) => void }) {
  const [symbol, setSymbol] = useState<string>(symbols[0].symbol)
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [qty, setQty] = useState<number>(0.001)

  const price = prices[symbol] || 0
  const cost = useMemo(() => +(qty * price), [qty, price])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!symbol || qty <= 0) {
      alert('Enter a valid quantity')
      return
    }
    onExecute({ symbol, side, qty, price })
  }

  return (
    <form onSubmit={submit} style={{ padding: 0 }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select 
          value={symbol} 
          onChange={e => setSymbol(e.target.value)} 
          style={selectStyle}
        >
          {symbols.map(s => <option key={s.symbol} value={s.symbol}>{s.symbol} — {s.name}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 16, background: '#f8fafc', padding: '12px 20px', borderRadius: '12px', border: '2px solid #e2e8f0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: '15px', color: side === 'buy' ? '#10b981' : '#64748b' }}>
            <input type="radio" name="side" value="buy" checked={side === 'buy'} onChange={() => setSide('buy')} style={{ accentColor: '#10b981' }} /> Buy
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, fontSize: '15px', color: side === 'sell' ? '#ef4444' : '#64748b' }}>
            <input type="radio" name="side" value="sell" checked={side === 'sell'} onChange={() => setSide('sell')} style={{ accentColor: '#ef4444' }} /> Sell
          </label>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, fontSize: '14px', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quantity</label>
        <input 
          type="number" 
          step="any" 
          min="0" 
          value={qty} 
          onChange={e => setQty(Number(e.target.value))} 
          style={inputStyle} 
        />
      </div>

      <div style={{ marginBottom: 24, padding: '20px', background: '#f8fafc', borderRadius: '14px', border: '2px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: '15px', color: '#64748b', fontWeight: 600 }}>Current Price:</span>
          <strong style={{ fontSize: '17px', color: '#0f172a', fontWeight: 800 }}>{price ? price.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) : '—'}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '15px', color: '#64748b', fontWeight: 600 }}>Estimated Cost:</span>
          <strong style={{ fontSize: '19px', color: side === 'buy' ? '#10b981' : '#ef4444', fontWeight: 800 }}>{cost.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</strong>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="submit" style={side === 'buy' ? buyButtonStyle : sellButtonStyle}>
          {side === 'buy' ? '🚀 Execute Buy' : '💸 Execute Sell'}
        </button>
        <button type="button" style={resetButtonStyle} onClick={() => { setQty(0.001); setSymbol(symbols[0].symbol); setSide('buy') }}>
          Reset
        </button>
      </div>
    </form>
  )
}

const selectStyle: React.CSSProperties = {
  flex: 1,
  minWidth: '240px',
  padding: '14px 18px',
  borderRadius: '12px',
  border: '2px solid #3b82f6',
  background: '#fff',
  color: '#0f172a',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
  outline: 'none',
  transition: 'all 0.3s'
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '16px 18px',
  borderRadius: '12px',
  border: '2px solid #e2e8f0',
  background: '#fff',
  color: '#0f172a',
  fontSize: '16px',
  fontWeight: 600,
  outline: 'none',
  transition: 'all 0.3s'
}

const buyButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '16px 24px',
  borderRadius: '12px',
  border: 'none',
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 6px 24px rgba(16, 185, 129, 0.35)',
  transition: 'all 0.3s',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
}

const sellButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: '16px 24px',
  borderRadius: '12px',
  border: 'none',
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 6px 24px rgba(239, 68, 68, 0.35)',
  transition: 'all 0.3s',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
}

const resetButtonStyle: React.CSSProperties = {
  padding: '16px 24px',
  borderRadius: '12px',
  border: '2px solid #e2e8f0',
  background: '#fff',
  color: '#64748b',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.3s'
}
