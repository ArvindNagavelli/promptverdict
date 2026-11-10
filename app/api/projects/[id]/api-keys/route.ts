import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { encryptApiKey, getKeyDisplay } from '@/lib/encryption'

async function getOrgAndProject(userId: string, projectId: string) {
  const { data: org } = await supabase.from('organisations').select('id').eq('clerk_user_id', userId).single()
  if (!org) return null
  const { data: project } = await supabase.from('projects').select('id').eq('id', projectId).eq('organisation_id', org.id).single()
  return project ? org : null
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const org = await getOrgAndProject(userId, params.id)
  if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: key } = await supabase
    .from('api_keys')
    .select('id,provider,key_display,endpoint_url,last_used_at')
    .eq('project_id', params.id)
    .single()
  return NextResponse.json({ key: key ?? null })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const org = await getOrgAndProject(userId, params.id)
  if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { provider, api_key, endpoint_url } = await req.json()
  if (!provider || !api_key) return NextResponse.json({ error: 'Provider and API key required' }, { status: 400 })

  const { data: key, error } = await supabase.from('api_keys').insert({
    project_id: params.id,
    provider,
    encrypted_key: encryptApiKey(api_key),
    key_display: getKeyDisplay(api_key),
    endpoint_url: endpoint_url ?? null
  }).select('id,provider,key_display,endpoint_url,last_used_at').single()

  if (error) return NextResponse.json({ error: 'Failed to save key' }, { status: 500 })
  return NextResponse.json({ key }, { status: 201 })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const org = await getOrgAndProject(userId, params.id)
  if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { provider, api_key, endpoint_url } = await req.json()
  const { data: existing } = await supabase.from('api_keys').select('id').eq('project_id', params.id).single()
  if (!existing) return NextResponse.json({ error: 'Key not found' }, { status: 404 })

  const update: Record<string, unknown> = { provider, endpoint_url: endpoint_url ?? null }
  if (api_key) {
    update.encrypted_key = encryptApiKey(api_key)
    update.key_display = getKeyDisplay(api_key)
  }

  const { data: key, error } = await supabase.from('api_keys').update(update).eq('id', existing.id).select('id,provider,key_display,endpoint_url,last_used_at').single()
  if (error) return NextResponse.json({ error: 'Failed to update key' }, { status: 500 })
  return NextResponse.json({ key })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  const org = await getOrgAndProject(userId, params.id)
  if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const url = new URL(req.url)
  const keyId = url.pathname.split('/').pop()
  await supabase.from('api_keys').delete().eq('id', keyId).eq('project_id', params.id)
  return NextResponse.json({ success: true })
}
