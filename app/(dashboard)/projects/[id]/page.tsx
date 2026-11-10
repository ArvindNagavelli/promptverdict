import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { userId } = auth()
  if (!userId) return null

  const { data: org } = await supabase.from('organisations').select('id').eq('clerk_user_id', userId).single()
  if (!org) return <div>Organisation not found</div>

  const { data: project } = await supabase.from('projects').select('*').eq('id', params.id).eq('organisation_id', org.id).single()
  if (!project) return <div>Project not found</div>

  const { data: testCases } = await supabase.from('test_cases').select('id').eq('project_id', project.id)
  const { data: testRuns } = await supabase.from('test_runs').select('*').eq('project_id', project.id).order('created_at', { ascending: false }).limit(5)

  return (
    <div>
      <Link href="/projects" className="text-blue-600 hover:underline">← Back to projects</Link>
      <div className="mt-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <p className="mt-1 text-gray-600">Type: {project.ai_type}{project.sprint_label ? ` · Sprint: ${project.sprint_label}` : ''}</p>
        </div>
        <Link href={`/projects/${project.id}/settings`} className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">AI Connection Settings</Link>
      </div>
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900">Test Cases ({testCases?.length || 0})</h2>
        <div className="mt-4 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center text-gray-500">Test case management coming in Phase 2</div>
      </div>
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900">Recent Runs</h2>
        {testRuns && testRuns.length > 0 ? (
          <div className="mt-4 space-y-3">
            {testRuns.map(run => (
              <div key={run.id} className="rounded-lg border bg-white p-4 flex justify-between items-center">
                <p className="text-sm text-gray-700">{new Date(run.created_at).toLocaleString()}</p>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">{run.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center text-gray-500">No test runs yet</div>
        )}
      </div>
    </div>
  )
}
