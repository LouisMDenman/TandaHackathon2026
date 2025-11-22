"use client"
import React, { useEffect, useState } from "react"
import usePriceFeed from "./usePriceFeed"
import TickerCard from "./components/TickerCard"
import TradeForm from "./components/TradeForm"
import Portfolio from "./components/Portfolio"
import HistoryList from "./components/HistoryList"
import styles from "./playground.module.css"

type SymbolConfig = {
  symbol: string
  name: string
  currency: string
}

type PricePoint = { t: number; p: number }

// very simple inline SVG line chart
function PriceChart({ points }: { points: PricePoint[] }) {
  if (!points || points.length < 2) {
    return (
      <div className={styles.chartEmpty}>
        Not enough price data yet. Leave this tab open for a bit.
      </div>
    )
  }

  const values = points.map(p => p.p)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1

  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 100
      const y = 100 - ((p.p - min) / span) * 100
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(" ")

  return (
    <svg
      className={styles.chartSvg}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="chartStroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#22c55e" />
        </linearGradient>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(56,189,248,0.35)" />
          <stop offset="1" stopColor="rgba(15,23,42,0.0)" />
        </linearGradient>
      </defs>
      <path
        d={path}
        fill="none"
        stroke="url(#chartStroke)"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d={`${path} L 100 100 L 0 100 Z`}
        fill="url(#chartFill)"
        stroke="none"
      />
    </svg>
  )
}

export default function PlaygroundPage() {
  // markets you track
  const [symbols, setSymbols] = useState<SymbolConfig[]>([
    { symbol: "BHP.AX", name: "BHP Group", currency: "AUD" },
    { symbol: "CBA.AX", name: "Commonwealth Bank", currency: "AUD" },
    { symbol: "AAPL", name: "Apple Inc", currency: "USD" },
  ])
  const [newSymbol, setNewSymbol] = useState("")

  // tab: trading or charts
  const [activeTab, setActiveTab] = useState<"trading" | "charts">("trading")

  // live prices
  const prices = usePriceFeed(symbols.map(s => s.symbol))

  // per-symbol price history for charts
  const [priceHistory, setPriceHistory] = useState<
    Record<string, PricePoint[]>
  >({})
  const [chartSymbol, setChartSymbol] = useState<string | null>(null)

  useEffect(() => {
    const now = Date.now()
    setPriceHistory(prev => {
      const next: Record<string, PricePoint[]> = { ...prev }
      for (const [sym, price] of Object.entries(prices)) {
        if (!price || price <= 0) continue
        const arr = next[sym] ? [...next[sym]] : []
        arr.push({ t: now, p: price })
        if (arr.length > 80) arr.shift()
        next[sym] = arr
      }
      return next
    })
  }, [prices])

  useEffect(() => {
    if (!chartSymbol && symbols.length > 0) {
      setChartSymbol(symbols[0].symbol)
    }
  }, [symbols, chartSymbol])

  // drag & drop state for watchlist (left column)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  function handleDragStart(index: number) {
    setDragIndex(index)
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>, index: number) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return

    setSymbols(prev => {
      const arr = [...prev]
      const [moved] = arr.splice(dragIndex, 1)
      arr.splice(index, 0, moved)
      return arr
    })
    setDragIndex(index)
  }

  function handleDragEnd() {
    setDragIndex(null)
  }

  // wallet state (persisted)
  const [balance, setBalance] = useState<number | null>(null)
  const [holdings, setHoldings] = useState<
    Record<string, { qty: number; avg: number }>
  >({})
  const [history, setHistory] = useState<any[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const rawBal = localStorage.getItem("sandbox_balance")
      const initBal = rawBal ? JSON.parse(rawBal) : 100000
      setBalance(initBal)

      const rawHold = localStorage.getItem("sandbox_holdings")
      setHoldings(rawHold ? JSON.parse(rawHold) : {})

      const rawHist = localStorage.getItem("sandbox_history")
      setHistory(rawHist ? JSON.parse(rawHist) : [])
    } catch {
      setBalance(100000)
      setHoldings({})
      setHistory([])
    }
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return
    localStorage.setItem("sandbox_balance", JSON.stringify(balance))
  }, [balance, isHydrated])

  useEffect(() => {
    if (!isHydrated) return
    localStorage.setItem("sandbox_holdings", JSON.stringify(holdings))
  }, [holdings, isHydrated])

  useEffect(() => {
    if (!isHydrated) return
    localStorage.setItem("sandbox_history", JSON.stringify(history))
  }, [history, isHydrated])

  // trade logic
  function executeTrade(payload: {
    symbol: string
    side: "buy" | "sell"
    qty: number
    price: number
  }) {
    const { symbol, side, qty, price } = payload
    const cost = +(qty * price)

    if (!isHydrated || balance === null) {
      alert("Wallet not ready yet")
      return
    }

    if (side === "buy") {
      if (cost > balance) {
        alert("Not enough play money for that trade.")
        return
      }
      setBalance(b => +(((b ?? 0) - cost).toFixed(2)))
      setHoldings(h => {
        const prev = h[symbol] || { qty: 0, avg: 0 }
        const newQty = prev.qty + qty
        const newAvg =
          newQty === 0 ? 0 : ((prev.qty * prev.avg) + (qty * price)) / newQty
        return { ...h, [symbol]: { qty: newQty, avg: +newAvg.toFixed(4) } }
      })
      setHistory(prev => [
        { time: new Date().toISOString(), symbol, side, qty, price },
        ...prev,
      ])
    } else {
      const prevHold = holdings[symbol] || { qty: 0, avg: 0 }
      if (qty > prevHold.qty) {
        alert("You’re trying to sell more than you own.")
        return
      }
      setHoldings(h => {
        const prev = h[symbol] || { qty: 0, avg: 0 }
        const newQty = prev.qty - qty
        const newHold = { ...h }
        if (newQty <= 0) delete newHold[symbol]
        else newHold[symbol] = { qty: newQty, avg: prev.avg }
        return newHold
      })
      setBalance(b => +(((b ?? 0) + cost).toFixed(2)))
      setHistory(prev => [
        { time: new Date().toISOString(), symbol, side, qty, price },
        ...prev,
      ])
    }
  }

  // add ticker handler
  function handleAddSymbol() {
    const sym = newSymbol.trim().toUpperCase()
    if (!sym) return
    if (symbols.some(s => s.symbol === sym)) {
      setNewSymbol("")
      return
    }
    setSymbols(prev => [...prev, { symbol: sym, name: sym, currency: "USD" }])
    setNewSymbol("")
  }

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div>
          <div className={styles.title}>Play Money Markets</div>
          <p className={styles.subtitle}>
            Learn how trading works with fake money and real prices.
          </p>
          <p className={styles.subtitleSmall}>
            1) Pick a market. 2) Place a test trade. 3) Watch your practice
            portfolio move.
          </p>
        </div>

        <div className={styles.balance}>
          <span className={styles.balanceLabel}>Play money balance</span>
          <div className={styles.balanceValue}>
            {balance == null
              ? "—"
              : balance.toLocaleString(undefined, {
                  style: "currency",
                  currency: "USD",
                })}
          </div>
        </div>
      </header>

      {/* tabs */}
      <div className={styles.tabs}>
        <button
          className={
            activeTab === "trading"
              ? `${styles.tabButton} ${styles.tabButtonActive}`
              : styles.tabButton
          }
          onClick={() => setActiveTab("trading")}
        >
          <span>Trading</span>
        </button>
        <button
          className={
            activeTab === "charts"
              ? `${styles.tabButton} ${styles.tabButtonActive}`
              : styles.tabButton
          }
          onClick={() => setActiveTab("charts")}
        >
          <span>Charts</span>
        </button>
      </div>

      {/* add ticker bar */}
      <div className={styles.addSymbolBar}>
        <div className={styles.addSymbolInputWrapper}>
          <span className={styles.addSymbolIcon}>🔍</span>
          <input
            value={newSymbol}
            onChange={e => setNewSymbol(e.target.value)}
            placeholder="Add ticker (e.g. TSLA, MSFT, BHP.AX)"
            className={styles.addSymbolInput}
          />
        </div>
        <button onClick={handleAddSymbol} className={styles.addSymbolButton}>
          Add
        </button>
      </div>

      {/* TRADING TAB */}
      {activeTab === "trading" && (
        <main className={styles.grid}>
          <section className={styles.tickers}>
            <h2 className={styles.sectionTitle}>1. Pick a market</h2>
            <p className={styles.sectionHelp}>
              These are the markets you&apos;re watching. Drag to reorder, or
              add a new ticker above.
            </p>
            <div className={styles.tickerList}>
              {symbols.map((s, index) => (
                <div
                  key={s.symbol}
                  className={
                    dragIndex === index
                      ? `${styles.tickerItem} ${styles.tickerItemDragging}`
                      : styles.tickerItem
                  }
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={e => handleDragOver(e, index)}
                  onDrop={e => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <TickerCard
                    symbol={s.symbol}
                    name={s.name}
                    price={prices[s.symbol]}
                    currency={s.currency}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className={styles.tradeArea}>
            <h2 className={styles.sectionTitle}>2. Place a test trade</h2>
            <p className={styles.sectionHelp}>
              Choose buy or sell, set a quantity, then hit <strong>Buy</strong>{" "}
              to simulate the trade with play money.
            </p>
            <div className={styles.tradeAndPortfolio}>
              <div className={styles.tradeFormWrapper}>
                <TradeForm
                  symbols={symbols}
                  prices={prices}
                  onExecute={executeTrade}
                />
              </div>
              <div className={styles.portfolioWrapper}>
                <h3 className={styles.subSectionTitle}>Your practice wallet</h3>
                <p className={styles.sectionHelpSmall}>
                  What you currently own and its market value.
                </p>
                <Portfolio holdings={holdings} prices={prices} />
              </div>
            </div>
          </section>

          <aside className={styles.historyList}>
            <h2 className={styles.sectionTitle}>3. Your past moves</h2>
            <p className={styles.sectionHelp}>
              Every trade you make with play money shows up here.
            </p>
            <HistoryList items={history} />
          </aside>
        </main>
      )}

      {/* CHARTS TAB */}
      {activeTab === "charts" && (
        <main className={styles.chartsLayout}>
          <section className={styles.chartsSidebar}>
            <h2 className={styles.sectionTitle}>Your markets</h2>
            <p className={styles.sectionHelp}>
              Select a symbol to view its recent price movement.
            </p>
            <div className={styles.chartsSymbolList}>
              {symbols.map(s => {
                const lastPrice = prices[s.symbol]
                const isActive = chartSymbol === s.symbol
                return (
                  <button
                    key={s.symbol}
                    className={
                      isActive
                        ? `${styles.chartsSymbolRow} ${styles.chartsSymbolRowActive}`
                        : styles.chartsSymbolRow
                    }
                    onClick={() => setChartSymbol(s.symbol)}
                  >
                    <div>
                      <div className={styles.chartsSymbol}>{s.symbol}</div>
                      <div className={styles.chartsSymbolName}>{s.name}</div>
                    </div>
                    <div className={styles.chartsSymbolPrice}>
                      {lastPrice
                        ? lastPrice.toLocaleString(undefined, {
                            style: "currency",
                            currency: s.currency,
                          })
                        : "—"}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <section className={styles.chartsMain}>
            <h2 className={styles.sectionTitle}>Price graph</h2>
            <p className={styles.sectionHelp}>
              This graph shows prices collected while this app is open.
            </p>
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <div className={styles.chartTitle}>
                  {chartSymbol || "Select a symbol"}
                </div>
              </div>
              {chartSymbol ? (
                <PriceChart points={priceHistory[chartSymbol] ?? []} />
              ) : (
                <div className={styles.chartEmpty}>
                  Click a symbol on the left to see its graph.
                </div>
              )}
            </div>
          </section>
        </main>
      )}
    </div>
  )
}
