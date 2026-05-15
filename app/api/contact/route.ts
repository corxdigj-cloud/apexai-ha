import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }
    try {
      await getSupabaseAdmin()
        .from('contact_messages')
        .insert([{ name, email, message }])
    } catch (e) {
      console.error('DB error:', e)
    }
    return NextResponse.json({ success: true, message: "Message received! We'll get back to you within 24 hours." })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
