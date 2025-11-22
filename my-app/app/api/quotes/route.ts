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
    if (!symbolsParam) {
      return NextResponse.json({ prices: {} })
    }

    const symbols = symbolsParam
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)

    const entries = await Promise.all(
      symbols.map(async symbol => {
        try {
          const resp = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(
              symbol,
            )}&token=${API_KEY}`,
          )

          if (!resp.ok) {
            console.error("Quote error status", symbol, resp.status)
            return [symbol, null] as const
          }

          const data = await resp.json()
          const price =
            typeof data.c === "number" && !Number.isNaN(data.c) ? data.c : null

          return [symbol, price] as const
        } catch (err) {
          console.error("Error fetching quote", symbol, err)
          return [symbol, null] as const
        }
      }),
    )

    const prices: Record<string, number | null> = {}
    for (const [sym, price] of entries) {
      prices[sym] = price
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
