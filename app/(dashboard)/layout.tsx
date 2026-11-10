import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/projects" className="text-lg font-bold text-gray-900">PromptVerdict</Link>
          <Link href="/projects" className="text-sm text-gray-600 hover:text-gray-900">Projects</Link>
        </div>
        <UserButton afterSignOutUrl="/" />
      </nav>
      <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
    </div>
  )
}
