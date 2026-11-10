import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  if (!process.env.CLERK_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }
  try {
    const body = await req.text()
    const evt = JSON.parse(body)
    if (evt.type === 'user.created') {
      const { id: clerkUserId, email_addresses } = evt.data
      const email = email_addresses?.[0]?.email_address || 'unknown'
      const { error } = await supabaseAdmin.from('organisations').insert({
        clerk_user_id: clerkUserId,
        name: email.split('@')[0]
      })
      if (error) {
        console.error('Failed to create organisation:', error)
        return NextResponse.json({ error: 'Failed to create organisation' }, { status: 500 })
      }
      console.log('Organisation created for:', clerkUserId)
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
