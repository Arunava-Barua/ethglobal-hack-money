export const GITHUB_APP_SLUG = 'starcpay'

export const STORAGE_KEY = 'github-installation'

export type GitHubInstallation = {
  installationId: string
  connectedAt: string
}

export function getInstallationUrl(): string {
  return `https://github.com/apps/${GITHUB_APP_SLUG}/installations/new`
}

export function getStoredInstallation(): GitHubInstallation | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as GitHubInstallation
  } catch {
    return null
  }
}

export function setStoredInstallation(installationId: string): void {
  const installation: GitHubInstallation = {
    installationId,
    connectedAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(installation))
}

export function clearInstallation(): void {
  localStorage.removeItem(STORAGE_KEY)
}
