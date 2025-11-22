import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

// GET - Fetch user's portfolio
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If no portfolio exists, create a new one with default values
    if (!data) {
      const newPortfolio = {
        user_id: userId,
        balance: 100000,
        holdings: {},
        history: [],
      }

      const { data: created, error: createError } = await supabase
        .from('portfolios')
        .insert(newPortfolio)
        .select()
        .single()

      if (createError) {
        console.error('Create error:', createError)
        return NextResponse.json({ error: createError.message }, { status: 500 })
      }

      return NextResponse.json(created)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Update user's portfolio
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { balance, holdings, history } = body

    const { data, error } = await supabase
      .from('portfolios')
      .update({
        balance,
        holdings,
        history,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
