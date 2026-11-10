import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'

export default function Home() {
  const { userId } = auth()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="text-center max-w-2xl px-4">
        <h1 className="text-4xl font-bold text-gray-900">PromptVerdict</h1>
        <p className="mt-4 text-lg text-gray-600">TestRail for AI — Test execution and sign-off platform for QA professionals</p>
        <div className="mt-8 flex justify-center gap-4">
          {userId ? (
            <Link href="/projects" className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">Go to Dashboard</Link>
          ) : (
            <>
              <Link href="/sign-in" className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50">Sign In</Link>
              <Link href="/sign-up" className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
