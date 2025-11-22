"use client"
import { useEffect, useState } from "react"

export type PriceHistoryPoint = { t: number; p: number }
export type PriceFeed = Record<string, { price: number | null; history: PriceHistoryPoint[] } | null>

export default function usePriceFeed(symbols: string[], range: '1D' | '1W' | '1M' | 'ALL' = '1W'): PriceFeed {
  const [prices, setPrices] = useState<PriceFeed>({})

  useEffect(() => {
    if (!symbols || symbols.length === 0) return

    let cancelled = false

    async function fetchPrices() {
      try {
        const query = encodeURIComponent(symbols.join(","))
        const res = await fetch(`/api/quotes?symbols=${query}&range=${range}`)
        const data = await res.json()
        const raw = data?.prices ?? {}

        // Normalise to Record<string, { price, history }>
        const next: PriceFeed = {}
        for (const sym of symbols) {
          const v = raw[sym]
          next[sym] = v && typeof v === 'object' ? v : { price: null, history: [] }
        }

        if (!cancelled) {
          setPrices(next)
        }
      } catch (err) {
        console.error("Failed to fetch prices", err)
      }
    }

    // initial fetch + polling
    fetchPrices()
    const id = setInterval(fetchPrices, 10000)

    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [symbols.join(","), range])

  return prices
}
