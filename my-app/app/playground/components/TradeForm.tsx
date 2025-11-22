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
    <form onSubmit={submit} style={{ padding: 12, border: '1px solid #e6e6e6', borderRadius: 8, background: '#fff' }}>
      <h3 style={{ marginTop: 0 }}>Trade</h3>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <select value={symbol} onChange={e => setSymbol(e.target.value)} style={{ flex: 1 }}>
          {symbols.map(s => <option key={s.symbol} value={s.symbol}>{s.symbol} — {s.name}</option>)}
        </select>
        <div>
          <label style={{ marginRight: 8 }}>
            <input type="radio" name="side" value="buy" checked={side === 'buy'} onChange={() => setSide('buy')} /> Buy
          </label>
          <label>
            <input type="radio" name="side" value="sell" checked={side === 'sell'} onChange={() => setSide('sell')} /> Sell
          </label>
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>Quantity</label>
        <input type="number" step="any" min="0" value={qty} onChange={e => setQty(Number(e.target.value))} style={{ width: '100%' }} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <div>Price: <strong>{price ? price.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) : '—'}</strong></div>
        <div>Estimated Cost: <strong>{cost.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</strong></div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" style={{ flex: 1 }}>{side === 'buy' ? 'Buy' : 'Sell'}</button>
        <button type="button" style={{ flex: 1 }} onClick={() => { setQty(0); setSymbol(symbols[0].symbol); setSide('buy') }}>Reset</button>
      </div>
    </form>
  )
}
