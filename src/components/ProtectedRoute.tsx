"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
    }
  }, [user, router])

  if (!user) {
    return null // or a loading spinner
  }

  return <>{children}</>
} 