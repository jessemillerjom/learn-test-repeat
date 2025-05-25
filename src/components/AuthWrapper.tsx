'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/auth/signin')
      } else {
        setIsLoading(false)
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/auth/signin')
      } else {
        setIsLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <>{children}</>
} 