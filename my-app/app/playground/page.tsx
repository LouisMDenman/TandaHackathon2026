"use client"
import React, { useEffect, useMemo, useState } from "react"
import { useUser, UserButton, SignInButton, SignUpButton } from "@clerk/nextjs"
import usePriceFeed from "./usePriceFeed"
import TickerCard from "./components/TickerCard"
import TradeForm from "./components/TradeForm"
import Portfolio from "./components/Portfolio"
import HistoryList from "./components/HistoryList"
import StockChart from "./StockChart"
import styles from "./playground.module.css"

type SymbolConfig = {
  symbol: string
  name: string
  currency: string
}

type PricePoint = { t: number; p: number }

// ...existing code...

export default function PlaygroundPage() {
  const { user, isLoaded } = useUser()
  
  // ===== ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS =====
  // This is the "Rules of Hooks" - hooks must be called in the same order every render
  
  // markets you track
  const [symbols, setSymbols] = useState<SymbolConfig[]>([
    { symbol: "BHP.AX", name: "BHP Group", currency: "AUD" },
    { symbol: "CBA.AX", name: "Commonwealth Bank", currency: "AUD" },
    { symbol: "AAPL", name: "Apple Inc", currency: "USD" },
  ])
  const [newSymbol, setNewSymbol] = useState("")

  // tab: trading or charts
  const [activeTab, setActiveTab] = useState<"trading" | "charts">("trading")

  // live prices and history feed from API (price + history)
  const feed = usePriceFeed(symbols.map(s => s.symbol), /* range */ '1W')

  // derived map of latest numeric prices for components that expect numbers
  const latestPrices = useMemo(() => {
    const m: Record<string, number> = {}
    for (const s of symbols) {
      const v = feed[s.symbol]
      m[s.symbol] = v && typeof v === 'object' && typeof v.price === 'number' ? v.price : 0
    }
    return m
  }, [feed, symbols])

  const [chartSymbol, setChartSymbol] = useState<string | null>(null)
  const [chartRange, setChartRange] = useState<'1D' | '1W' | '1M' | 'ALL'>('1W')

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

  // wallet state (persisted to database)
  const [balance, setBalance] = useState<number | null>(null)
  const [holdings, setHoldings] = useState<
    Record<string, { qty: number; avg: number }>
  >({})
  const [history, setHistory] = useState<any[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  // Load portfolio from database
  useEffect(() => {
    if (!isLoaded || !user) return

    async function loadPortfolio() {
      try {
        const response = await fetch('/api/portfolio')
        
        // Check if response is ok
        if (!response.ok) {
          // If it's a 401, 404, or 500, use defaults
          // This allows the app to work even without database setup
          if (response.status === 401 || response.status === 404 || response.status === 500) {
            console.warn(`Portfolio API returned ${response.status}, using defaults. This is normal if database is not set up yet.`)
            setBalance(100000)
            setHoldings({})
            setHistory([])
            setIsHydrated(true)
            return
          }
          throw new Error(`Failed to load portfolio: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Portfolio loaded from database:', data)
        setBalance(data.balance || 100000)
        setHoldings(data.holdings || {})
        setHistory(data.history || [])
        setIsHydrated(true)
      } catch (error) {
        console.warn('Error loading portfolio, using defaults:', error)
        // Set defaults if loading fails - don't block the user
        // Portfolio will work with localStorage-like behavior
        setBalance(100000)
        setHoldings({})
        setHistory([])
        setIsHydrated(true)
      }
    }

    loadPortfolio()
  }, [isLoaded, user])

  // Save portfolio to database (debounced)
  useEffect(() => {
    if (!isHydrated || !user || isSaving) return

    const timeoutId = setTimeout(async () => {
      setIsSaving(true)
      try {
        const response = await fetch('/api/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ balance, holdings, history }),
        })
        
        if (response.ok) {
          console.log('Portfolio saved successfully')
        } else {
          console.warn('Portfolio save failed, but continuing (app works without database)')
        }
      } catch (error) {
        console.warn('Error saving portfolio (app continues to work):', error)
        // Don't throw - app continues to work without persistence
      } finally {
        setIsSaving(false)
      }
    }, 1000) // Debounce for 1 second

    return () => clearTimeout(timeoutId)
  }, [balance, holdings, history, isHydrated, user, isSaving])
  
  // ===== HANDLER FUNCTIONS =====
  
  // Add new symbol to watchlist
  function handleAddSymbol() {
    const trimmed = newSymbol.trim().toUpperCase()
    if (!trimmed) return
    
    // Check if symbol already exists
    if (symbols.some(s => s.symbol === trimmed)) {
      alert(`${trimmed} is already in your watchlist`)
      return
    }
    
    // Determine currency based on symbol suffix
    const currency = trimmed.endsWith('.AX') ? 'AUD' : 'USD'
    
    // Add new symbol
    setSymbols(prev => [...prev, { 
      symbol: trimmed, 
      name: trimmed, // Will show actual name once price loads
      currency 
    }])
    setNewSymbol('')
  }
  
  // Trade execution function
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
      
      // Trigger confetti animation and success popup on successful buy
      setShowConfetti(true)
      setShowSuccessPopup(true)
      setTimeout(() => {
        setShowConfetti(false)
        setShowSuccessPopup(false)
      }, 3000)
    } else {
      const prevHold = holdings[symbol] || { qty: 0, avg: 0 }
      if (qty > prevHold.qty) {
        alert("You're trying to sell more than you own.")
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
  
  // ===== CONDITIONAL RENDERING BASED ON AUTH STATE =====
  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading...</p>
        </div>
      </div>
    )
  }
  
  // Show sign-in page if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-30 animate-float" 
             style={{
               boxShadow: '0 0 100px 50px rgba(139, 92, 246, 0.3)'
             }}></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl opacity-30 animate-float" 
             style={{
               boxShadow: '0 0 100px 50px rgba(6, 182, 212, 0.3)',
               animationDelay: '2s'
             }}></div>
        
        <div className="relative z-10 max-w-md w-full mx-4 p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎮</div>
            <h1 className="text-4xl font-black text-white mb-4">
              Join the Trading Playground
            </h1>
            <p className="text-slate-300 text-lg">
              Sign in to start practicing with <span className="text-cyan-400 font-bold">$100,000</span> in play money
            </p>
          </div>
          
          <div className="space-y-4">
            <SignUpButton mode="modal">
              <button className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-bold shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105">
                Sign Up - It's Free
              </button>
            </SignUpButton>
            
            <SignInButton mode="modal">
              <button className="w-full px-8 py-4 rounded-xl bg-white/10 backdrop-blur-md border-2 border-white/20 text-white text-lg font-bold hover:bg-white/20 transition-all duration-300">
                Already have an account? Sign In
              </button>
            </SignInButton>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-white font-semibold mb-3 text-center">What you'll get:</h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>$100,000 starting balance in play money</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Real-time market prices from live exchanges</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Track your portfolio and trading history</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>Practice risk-free with virtual money</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // Main playground UI (authenticated users only)
  return (
    <div className={styles.root} style={{ position: 'relative' }}>
      {/* Success Popup */}
      {showSuccessPopup && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100000,
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          padding: '32px 48px',
          borderRadius: '24px',
          boxShadow: '0 20px 80px rgba(16, 185, 129, 0.6), 0 0 0 2px rgba(255,255,255,0.5) inset',
          animation: 'popup-bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          textAlign: 'center',
          minWidth: '300px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
          <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Trade Executed!</div>
          <div style={{ fontSize: '16px', fontWeight: 600, opacity: 0.9 }}>Your purchase was successful</div>
        </div>
      )}
      
      {/* Animated background gradients */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float 20s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '10%',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float 18s ease-in-out infinite',
          animationDelay: '-5s'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '50%',
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'float 22s ease-in-out infinite',
          animationDelay: '-10s'
        }} />
      </div>
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

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className={styles.balance} style={{ position: 'relative' }}>
            <span className={styles.balanceLabel}>Play money balance</span>
            <div className={styles.balanceValue}>
              {balance == null
                ? "—"
                : balance.toLocaleString(undefined, {
                    style: "currency",
                    currency: "USD",
                  })}
            </div>
            
            {/* Confetti Animation */}
            {showConfetti && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '300px',
                height: '300px',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                zIndex: 10000
              }}>
                {[...Array(50)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      width: i % 2 === 0 ? '12px' : '8px',
                      height: i % 2 === 0 ? '12px' : '8px',
                      background: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][i % 6],
                      left: '50%',
                      top: '50%',
                      borderRadius: i % 3 === 0 ? '50%' : '2px',
                      animation: `confetti-${i % 6} 2.5s ease-out forwards`,
                      opacity: 1,
                      boxShadow: '0 0 8px rgba(0,0,0,0.3)'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-12 h-12 ring-2 ring-blue-500/20 hover:ring-blue-500/40 transition-all"
                }
              }}
            />
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
                    price={latestPrices[s.symbol]}
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
                  prices={latestPrices}
                  onExecute={executeTrade}
                />
              </div>
              <div className={styles.portfolioWrapper}>
                <h3 className={styles.subSectionTitle}>Your practice wallet</h3>
                <p className={styles.sectionHelpSmall}>
                  What you currently own and its market value.
                </p>
                <Portfolio holdings={holdings} prices={latestPrices} />
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
        <main className={`${styles.chartsLayout} fade-in`}>
          <section className={styles.chartsSidebar}>
            <h2 className={styles.sectionTitle}>Your markets</h2>
            <p className={styles.sectionHelp}>
              Select a symbol to view its recent price movement.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', justifyContent: 'center' }}>
              {['1D', '1W', '1M', 'ALL'].map(range => (
                <button
                  key={range}
                  className="cool-btn"
                  style={{
                    background: chartRange === range ? 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)' : 'rgba(255,255,255,0.18)',
                    color: chartRange === range ? '#fff' : '#222',
                    fontWeight: chartRange === range ? 700 : 500,
                    border: chartRange === range ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                    boxShadow: chartRange === range ? '0 8px 32px rgba(59,130,246,0.22)' : '0 2px 8px rgba(59,130,246,0.10)',
                    cursor: 'pointer',
                    position: 'relative',
                    zIndex: 10,
                  }}
                  onClick={() => setChartRange(range as typeof chartRange)}
                >
                  {range}
                </button>
              ))}
            </div>
            <div className={styles.chartsSymbolList}>
              {symbols.map(s => {
                const lastPrice = feed[s.symbol] ? feed[s.symbol]!.price : null
                const isActive = chartSymbol === s.symbol
                return (
                  <button
                    key={s.symbol}
                    className="cool-btn"
                    style={{
                      marginBottom: '12px',
                      boxShadow: isActive ? '0 8px 32px rgba(59,130,246,0.22)' : '0 2px 8px rgba(59,130,246,0.10)',
                      border: isActive ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                      background: isActive ? 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)' : 'rgba(255,255,255,0.18)',
                      color: isActive ? '#fff' : '#222',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '16px 20px',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      position: 'relative',
                      zIndex: 10,
                    }}
                    onClick={() => setChartSymbol(s.symbol)}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '1.1em', fontWeight: 700 }}>{s.symbol}</div>
                      <div style={{ fontSize: '0.95em', color: isActive ? '#e0f2fe' : '#555' }}>{s.name}</div>
                    </div>
                      <div style={{ fontSize: '1.1em', fontWeight: 600 }}>
                      {typeof lastPrice === 'number'
                        ? new Intl.NumberFormat(undefined, { style: 'currency', currency: s.currency }).format(lastPrice)
                        : "—"}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <section className={`${styles.chartsMain} fade-in`}>
            <h2 className={styles.sectionTitle}>Price graph</h2>
            <p className={styles.sectionHelp}>
              This graph shows prices collected while this app is open.
            </p>
            <div className={`${styles.chartCard} glass-card`} style={{ minHeight: '340px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <div className={styles.chartHeader}>
                <div className={styles.chartTitle} style={{ fontSize: '1.3em', fontWeight: 700, marginBottom: '8px' }}>
                  {chartSymbol || "Select a symbol"}
                </div>
              </div>
              {chartSymbol ? (
                feed[chartSymbol] && feed[chartSymbol]!.history && feed[chartSymbol]!.history.length > 1 ? (
                  <StockChart
                    symbol={chartSymbol}
                    history={feed[chartSymbol]!.history.map((p: { t: number; p: number }) => ({
                      time: chartRange === '1D'
                        ? new Date(p.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : new Date(p.t).toLocaleDateString(),
                      price: p.p
                    }))}
                  />
                ) : (
                  <div className={styles.chartEmpty} style={{ color: '#555', fontSize: '1.1em', marginTop: '24px' }}>
                    Not enough price data yet. Leave this tab open for a bit.
                  </div>
                )
              ) : (
                <div className={styles.chartEmpty} style={{ color: '#555', fontSize: '1.1em', marginTop: '24px' }}>
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
