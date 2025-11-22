// app/api/quotes/route.ts
import { NextRequest, NextResponse } from "next/server"

const API_KEY = process.env.FINNHUB_API_KEY

// Mock data for when market is closed or API unavailable
const MOCK_PRICES: Record<string, number> = {
  'AAPL': 178.50,
  'MSFT': 380.25,
  'GOOGL': 140.75,
  'TSLA': 245.80,
  'AMZN': 175.30,
  'META': 485.60,
  'NVDA': 495.20,
  'BHP.AX': 42.85,
  'CBA.AX': 105.30,
  'WBC.AX': 22.45,
  'ANZ.AX': 27.80,
  'NAB.AX': 30.15,
  'RIO.AX': 122.50,
  'WES.AX': 62.30,
  'WOW.AX': 37.90,
}

// Generate realistic mock history data
function generateMockHistory(basePrice: number, range: string): Array<{ t: number; p: number }> {
  const now = Date.now()
  const history: Array<{ t: number; p: number }> = []
  
  let points = 20
  let interval = 30 * 60 * 1000 // 30 minutes
  
  if (range === '1D') {
    points = 24
    interval = 60 * 60 * 1000 // 1 hour
  } else if (range === '1W') {
    points = 20
    interval = 12 * 60 * 60 * 1000 // 12 hours
  } else if (range === '1M') {
    points = 30
    interval = 24 * 60 * 60 * 1000 // 1 day
  } else if (range === 'ALL') {
    points = 50
    interval = 7 * 24 * 60 * 60 * 1000 // 1 week
  }
  
  let price = basePrice * 0.95 // Start 5% lower
  
  for (let i = 0; i < points; i++) {
    // Random walk with slight upward bias
    const change = (Math.random() - 0.48) * basePrice * 0.02
    price = Math.max(price + change, basePrice * 0.8)
    price = Math.min(price, basePrice * 1.1)
    
    history.push({
      t: now - (points - i) * interval,
      p: parseFloat(price.toFixed(2))
    })
  }
  
  // Ensure last price is close to current mock price
  history[history.length - 1].p = basePrice
  
  return history
}

// Check if it's weekend or after hours (for demo purposes, always use mock on weekends)
function shouldUseMockData(): boolean {
  const now = new Date()
  const day = now.getDay() // 0 = Sunday, 6 = Saturday
  const hour = now.getHours()
  
  // Weekend
  if (day === 0 || day === 6) return true
  
  // After hours (before 9:30 AM or after 4 PM EST - simplified)
  // For demo purposes, also use mock if API key is missing
  if (!API_KEY) return true
  
  return false
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const symbolsParam = searchParams.get("symbols")
    const rangeParam = searchParams.get("range") || "1W"
    
    if (!symbolsParam) {
      return NextResponse.json({ prices: {} })
    }

    const symbols = symbolsParam
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)

    // Use mock data if market is closed or API unavailable
    if (shouldUseMockData()) {
      console.log('📊 Using mock data (weekend or API unavailable)')
      const prices: Record<string, { price: number | null, history: Array<{ t: number, p: number }> } | null> = {}
      
      for (const symbol of symbols) {
        const basePrice = MOCK_PRICES[symbol] || 100
        prices[symbol] = {
          price: basePrice,
          history: generateMockHistory(basePrice, rangeParam)
        }
      }
      
      return NextResponse.json({ prices, _mock: true })
    }
    
    // Real API call for market hours
    if (!API_KEY) {
      return NextResponse.json(
        { error: "FINNHUB_API_KEY is not set on the server" },
        { status: 500 },
      )
    }

    // Helper to get Finnhub candle resolution and time window
    function getCandleParams(range: string) {
      const now = Math.floor(Date.now() / 1000)
      let resolution = "D"
      let from = now - 7 * 24 * 60 * 60 // default 1W
      if (range === "1D") {
        resolution = "5"
        from = now - 24 * 60 * 60
      } else if (range === "1W") {
        resolution = "30"
        from = now - 7 * 24 * 60 * 60
      } else if (range === "1M") {
        resolution = "D"
        from = now - 31 * 24 * 60 * 60
      } else if (range === "ALL") {
        resolution = "W"
        from = now - 365 * 5 * 24 * 60 * 60 // 5 years
      }
      return { resolution, from, to: now }
    }

    const entries = await Promise.all(
      symbols.map(async symbol => {
        try {
          // If requesting historical data, use /stock/candle
          const { resolution, from, to } = getCandleParams(rangeParam)
          const candleUrl = `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${to}&token=${API_KEY}`
          const resp = await fetch(candleUrl)

          if (!resp.ok) {
            console.warn(`Finnhub API error for ${symbol}, using mock data`)
            const basePrice = MOCK_PRICES[symbol] || 100
            return [symbol, {
              price: basePrice,
              history: generateMockHistory(basePrice, rangeParam)
            }] as const
          }

          const data = await resp.json()
          // Finnhub returns { c: [close], t: [timestamp], ... }
          if (data.s !== "ok" || !Array.isArray(data.c) || !Array.isArray(data.t)) {
            console.warn(`No data from Finnhub for ${symbol}, using mock data`)
            const basePrice = MOCK_PRICES[symbol] || 100
            return [symbol, {
              price: basePrice,
              history: generateMockHistory(basePrice, rangeParam)
            }] as const
          }
          // Return array of { t, p } for chart
          const history = data.t.map((t: number, i: number) => ({ t: t * 1000, p: data.c[i] }))
          // Also return latest price for convenience
          const price = data.c.length > 0 ? data.c[data.c.length - 1] : null
          return [symbol, { price, history }] as const
        } catch (err) {
          console.error(`Error fetching data for ${symbol}, using mock data:`, err)
          const basePrice = MOCK_PRICES[symbol] || 100
          return [symbol, {
            price: basePrice,
            history: generateMockHistory(basePrice, rangeParam)
          }] as const
        }
      }),
    )

    const prices: Record<string, { price: number | null, history: Array<{ t: number, p: number }> } | null> = {}
    for (const [sym, value] of entries) {
      prices[sym] = value
    }

    return NextResponse.json({ prices })
  } catch (err) {
    console.error("Unexpected error in /api/quotes", err)
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 },
    )
  }
}
