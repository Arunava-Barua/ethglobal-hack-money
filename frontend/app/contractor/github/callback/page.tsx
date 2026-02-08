'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { setStoredInstallation } from '@/lib/github'

function GitHubCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const installationId = searchParams.get('installation_id')

    if (installationId) {
      setStoredInstallation(installationId)
    }

    router.replace('/contractor/dashboard')
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-sm text-muted-foreground">Connecting GitHub...</p>
    </div>
  )
}

export default function GitHubCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Connecting GitHub...</p>
      </div>
    }>
      <GitHubCallbackContent />
    </Suspense>
  )
}
