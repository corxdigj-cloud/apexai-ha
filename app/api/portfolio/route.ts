import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { userId, name, holdings } = await request.json()
    if (!userId || !holdings) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('portfolios')
      .upsert([{
        user_id: userId,
        name: name || 'My Portfolio',
        holdings: JSON.stringify(holdings),
        updated_at: new Date().toISOString(),
      }])
      .select()

    if (error) throw error
    return NextResponse.json({ success: true, portfolio: data?.[0] })
  } catch (error) {
    console.error('Portfolio save error:', error)
    return NextResponse.json({ error: 'Failed to save portfolio' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)

    if (error) throw error
    return NextResponse.json({ portfolio: data?.[0] || null })
  } catch (error) {
    console.error('Portfolio fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 })
  }
}
