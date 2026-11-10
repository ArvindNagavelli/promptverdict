'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [aiType, setAiType] = useState('chatbot')
  const [sprint, setSprint] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ai_type: aiType, sprint_label: sprint })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create project')
      router.push(`/projects/${data.projectId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl">
      <Link href="/projects" className="text-blue-600 hover:underline">← Back to projects</Link>
      <h1 className="mt-6 text-3xl font-bold text-gray-900">New Project</h1>
      {error && <div className="mt-4 rounded bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Project Name *</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="e.g. Customer Support Chatbot" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">AI Type *</label>
          <select value={aiType} onChange={e => setAiType(e.target.value)} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none">
            <option value="chatbot">Chatbot</option>
            <option value="rag">RAG</option>
            <option value="summariser">Summariser</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Sprint (optional)</label>
          <input type="text" value={sprint} onChange={e => setSprint(e.target.value)} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="e.g. Sprint 1" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="rounded bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50">{loading ? 'Creating...' : 'Create Project'}</button>
          <Link href="/projects" className="rounded border border-gray-300 px-6 py-2 font-medium text-gray-700 hover:bg-gray-50">Cancel</Link>
        </div>
      </form>
    </div>
  )
}
