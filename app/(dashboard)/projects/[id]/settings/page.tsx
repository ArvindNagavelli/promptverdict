'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

const PROVIDERS = [
  { value: 'openai', label: 'OpenAI (GPT-4, GPT-3.5)' },
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'google', label: 'Google (Gemini)' },
  { value: 'xai', label: 'xAI (Grok)' },
  { value: 'azure', label: 'Azure OpenAI' },
  { value: 'custom', label: 'Custom Endpoint' }
]

type ApiKey = {
  id: string
  provider: string
  key_display: string
  endpoint_url: string | null
  last_used_at: string | null
}

type Message = { type: 'success' | 'error'; text: string }

export default function SettingsPage() {
  const params = useParams()
  const projectId = params.id as string
  const [provider, setProvider] = useState('openai')
  const [apiKey, setApiKey] = useState('')
  const [endpointUrl, setEndpointUrl] = useState('')
  const [existingKey, setExistingKey] = useState<ApiKey | null>(null)
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)

  useEffect(() => {
    fetch(`/api/projects/${projectId}/api-keys`)
      .then(r => r.json())
      .then(d => { if (d.key) { setExistingKey(d.key); setProvider(d.key.provider) } })
      .catch(() => {})
  }, [projectId])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/api-keys`, {
        method: existingKey ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, api_key: apiKey, endpoint_url: endpointUrl || null })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setExistingKey(data.key)
      setApiKey('')
      setMessage({ type: 'success', text: 'API key saved and encrypted successfully.' })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save' })
    } finally { setLoading(false) }
  }

  async function handleTest() {
    setTesting(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/projects/${projectId}/test-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, api_key: apiKey || undefined })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Connection failed')
      setMessage({ type: 'success', text: 'Connection successful! Your AI is reachable.' })
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Connection failed' })
    } finally { setTesting(false) }
  }

  async function handleDelete() {
    if (!existingKey || !confirm('Delete this API key? This cannot be undone.')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/api-keys/${existingKey.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setExistingKey(null)
      setMessage({ type: 'success', text: 'API key deleted.' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete key' })
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-xl">
      <Link href={`/projects/${projectId}`} className="text-blue-600 hover:underline">← Back to project</Link>
      <h1 className="mt-6 text-3xl font-bold text-gray-900">AI Connection</h1>
      <p className="mt-2 text-gray-600">Your API key is encrypted with AES-256 and never stored in plaintext.</p>
      {message && (
        <div className={`mt-4 rounded border p-3 text-sm ${message.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>{message.text}</div>
      )}
      <form onSubmit={handleSave} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Provider</label>
          <select value={provider} onChange={e => setProvider(e.target.value)} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none">
            {PROVIDERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        {provider === 'custom' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Endpoint URL</label>
            <input type="url" value={endpointUrl} onChange={e => setEndpointUrl(e.target.value)} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder="https://api.example.com/v1/chat/completions" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700">{existingKey ? 'Replace API Key (leave blank to keep current)' : 'API Key *'}</label>
          <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none" placeholder={existingKey ? `Current key: ${existingKey.key_display}` : 'Paste your API key'} />
        </div>
        {existingKey?.last_used_at && <p className="text-xs text-gray-500">Last used: {new Date(existingKey.last_used_at).toLocaleString()}</p>}
        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={loading} className="rounded bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50">{loading ? 'Saving...' : 'Save API Key'}</button>
          <button type="button" onClick={handleTest} disabled={testing || (!apiKey && !existingKey)} className="rounded border border-gray-300 px-5 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">{testing ? 'Testing...' : 'Test Connection'}</button>
          {existingKey && <button type="button" onClick={handleDelete} disabled={loading} className="rounded border border-red-300 px-5 py-2 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">Delete Key</button>}
        </div>
      </form>
    </div>
  )
}
