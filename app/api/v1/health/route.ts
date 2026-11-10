import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { error } = await supabase.from('organisations').select('id').limit(1)
    if (error) return NextResponse.json({ status: 'error', message: error.message }, { status: 503 })
    return NextResponse.json({ status: 'healthy', timestamp: new Date().toISOString(), database: 'connected' })
  } catch {
    return NextResponse.json({ status: 'error', message: 'Health check failed' }, { status: 503 })
  }
}
