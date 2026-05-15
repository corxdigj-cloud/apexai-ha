import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('contact_messages')
      .insert([{ name, email, message, created_at: new Date().toISOString() }])

    if (error) {
      console.error('Supabase error:', error)
      // Still return success to user - just log the error
    }

    return NextResponse.json({ success: true, message: 'Message received! We\'ll get back to you within 24 hours.' })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
