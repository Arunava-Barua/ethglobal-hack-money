'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  getInstallationUrl,
  getStoredInstallation,
  setStoredInstallation,
  clearInstallation,
} from '@/lib/github'

type GitHubContextValue = {
  isConnected: boolean
  installationId: string | null
  connect: () => void
  disconnect: () => void
}

const GitHubContext = createContext<GitHubContextValue | null>(null)

export function GitHubProvider({ children }: { children: React.ReactNode }) {
  const [installationId, setInstallationId] = useState<string | null>(null)

  useEffect(() => {
    const stored = getStoredInstallation()
    if (stored) {
      setInstallationId(stored.installationId)
    }
  }, [])

  const connect = useCallback(() => {
    window.location.href = getInstallationUrl()
  }, [])

  const disconnect = useCallback(() => {
    clearInstallation()
    setInstallationId(null)
  }, [])

  return (
    <GitHubContext.Provider
      value={{
        isConnected: installationId !== null,
        installationId,
        connect,
        disconnect,
      }}
    >
      {children}
    </GitHubContext.Provider>
  )
}

export function useGitHub(): GitHubContextValue {
  const context = useContext(GitHubContext)
  if (!context) {
    throw new Error('useGitHub must be used within a GitHubProvider')
  }
  return context
}

/** Re-hydrate state after the callback page stores the installation */
export function useGitHubHydrate(id: string) {
  const context = useContext(GitHubContext)
  useEffect(() => {
    if (id) {
      setStoredInstallation(id)
      // context may be null on the callback page if it's outside the provider,
      // but localStorage is already set so the next mount will pick it up.
    }
  }, [id, context])
}
