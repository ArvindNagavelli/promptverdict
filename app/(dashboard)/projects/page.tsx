import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'

export default async function ProjectsPage() {
  const { userId } = auth()
  if (!userId) return null

  const { data: org } = await supabase.from('organisations').select('*').eq('clerk_user_id', userId).single()
  const { data: projects } = org
    ? await supabase.from('projects').select('*').eq('organisation_id', org.id).order('created_at', { ascending: false })
    : { data: [] }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <Link href="/projects/new" className="rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700">New Project</Link>
      </div>
      {projects && projects.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="rounded-lg border bg-white p-6 hover:shadow-md">
              <h2 className="font-semibold text-gray-900">{project.name}</h2>
              <p className="mt-1 text-sm text-gray-600">{project.ai_type}</p>
              {project.sprint_label && <p className="mt-1 text-sm text-gray-500">Sprint: {project.sprint_label}</p>}
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No projects yet.</p>
          <Link href="/projects/new" className="mt-2 inline-block text-blue-600 hover:underline">Create your first project →</Link>
        </div>
      )}
    </div>
  )
}
