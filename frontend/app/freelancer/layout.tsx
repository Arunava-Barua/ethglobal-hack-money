'use client'

import { FreelancerSidebar } from '@/components/freelancer-sidebar'
import { TopBar } from '@/components/top-bar'

export default function FreelancerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <FreelancerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar role="freelancer" />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
