// app/api/quotes/route.ts
import { NextRequest, NextResponse } from "next/server"

const API_KEY = process.env.FINNHUB_API_KEY

export async function GET(req: NextRequest) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { error: "FINNHUB_API_KEY is not set on the server" },
        { status: 500 },
      )
    }

    const { searchParams } = new URL(req.url)
    const symbolsParam = searchParams.get("symbols") // e.g. "AAPL,MSFT,BHP.AX"
    const rangeParam = searchParams.get("range") || "1W" // e.g. "1D", "1W", "1M", "ALL"
    if (!symbolsParam) {
      return NextResponse.json({ prices: {} })
    }

    const symbols = symbolsParam
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)

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
            console.error("Candle error status", symbol, resp.status)
            return [symbol, null] as const
          }

          const data = await resp.json()
          // Finnhub returns { c: [close], t: [timestamp], ... }
          if (data.s !== "ok" || !Array.isArray(data.c) || !Array.isArray(data.t)) {
            return [symbol, null] as const
          }
          // Return array of { t, p } for chart
          const history = data.t.map((t: number, i: number) => ({ t: t * 1000, p: data.c[i] }))
          // Also return latest price for convenience
          const price = data.c.length > 0 ? data.c[data.c.length - 1] : null
          return [symbol, { price, history }] as const
        } catch (err) {
          console.error("Error fetching candle", symbol, err)
          return [symbol, null] as const
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
