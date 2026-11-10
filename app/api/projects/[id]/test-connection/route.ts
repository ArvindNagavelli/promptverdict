import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { decryptApiKey } from '@/lib/encryption'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: org } = await supabase.from('organisations').select('id').eq('clerk_user_id', userId).single()
  if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { provider, api_key } = await req.json()

  let keyToUse: string = api_key
  if (!keyToUse) {
    const { data: stored } = await supabase.from('api_keys').select('encrypted_key').eq('project_id', params.id).single()
    if (!stored) return NextResponse.json({ error: 'No API key found. Save a key first.' }, { status: 400 })
    keyToUse = decryptApiKey(stored.encrypted_key)
  }

  try {
    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${keyToUse}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: 'Say hello in one word.' }], max_tokens: 10 })
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || 'OpenAI error') }
    } else if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': keyToUse, 'content-type': 'application/json', 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-haiku-4-5', max_tokens: 10, messages: [{ role: 'user', content: 'Say hello in one word.' }] })
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || 'Anthropic error') }
    } else if (provider === 'google') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${keyToUse}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'Say hello in one word.' }] }] })
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || 'Google error') }
    }
    await supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('project_id', params.id)
    return NextResponse.json({ success: true, message: 'Connection successful' })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Connection failed' }, { status: 400 })
  }
}
