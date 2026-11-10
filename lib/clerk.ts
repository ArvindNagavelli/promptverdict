import { auth } from '@clerk/nextjs/server'

export function getClerkUserId(): string {
  const { userId } = auth()
  if (!userId) throw new Error('User not authenticated')
  return userId
}
