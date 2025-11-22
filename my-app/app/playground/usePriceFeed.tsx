"use client"
import { useEffect, useState } from "react"

export type Prices = Record<string, number>

export default function usePriceFeed(symbols: string[]): Prices {
  const [prices, setPrices] = useState<Prices>({})

  useEffect(() => {
    if (!symbols || symbols.length === 0) return

    let cancelled = false

    async function fetchPrices() {
      try {
        const query = encodeURIComponent(symbols.join(","))
        const res = await fetch(`/api/quotes?symbols=${query}`)
        const data = await res.json()
        const raw = data?.prices ?? {}

        // Normalise to Record<string, number>
        const next: Prices = {}
        for (const sym of symbols) {
          const v = raw[sym]
          next[sym] = typeof v === "number" && !Number.isNaN(v) ? v : 0
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
    const id = setInterval(fetchPrices, 5000)

    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [symbols.join(",")])

  return prices
}
