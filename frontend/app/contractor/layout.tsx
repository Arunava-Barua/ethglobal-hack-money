'use client'

import { ContractorSidebar } from '@/components/contractor-sidebar'
import { TopBar } from '@/components/top-bar'
import { GitHubProvider } from '@/components/github-provider'

export default function ContractorLayout({ children }: { children: React.ReactNode }) {
  return (
    <GitHubProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        <ContractorSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar role="contractor" />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </GitHubProvider>
  )
}
