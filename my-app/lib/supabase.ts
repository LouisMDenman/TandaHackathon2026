import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Portfolio = {
  id: string
  user_id: string
  balance: number
  holdings: Record<string, { qty: number; avg: number }>
  history: Array<{
    time: string
    symbol: string
    side: 'buy' | 'sell'
    qty: number
    price: number
  }>
  created_at: string
  updated_at: string
}
