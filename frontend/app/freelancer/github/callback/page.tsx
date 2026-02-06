'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { setStoredInstallation } from '@/lib/github'

export default function GitHubCallbackPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const installationId = searchParams.get('installation_id')

    if (installationId) {
      setStoredInstallation(installationId)
    }

    router.replace('/freelancer/dashboard')
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-sm text-muted-foreground">Connecting GitHub...</p>
    </div>
  )
}
