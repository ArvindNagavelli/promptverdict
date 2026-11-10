import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { userId } = auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: org } = await supabase.from('organisations').select('id').eq('clerk_user_id', userId).single()
  if (!org) return NextResponse.json({ error: 'Organisation not found' }, { status: 404 })

  const { name, ai_type, sprint_label } = await req.json()
  if (!name || !ai_type) return NextResponse.json({ error: 'Name and AI type required' }, { status: 400 })

  const { data: project, error } = await supabase.from('projects').insert({
    organisation_id: org.id, name, ai_type, sprint_label: sprint_label || null
  }).select('id').single()

  if (error || !project) return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  return NextResponse.json({ projectId: project.id }, { status: 201 })
}
