'use client'

import { FreelancerActiveProjects } from '@/components/freelancer/active-projects'
import { IncomingRequests } from '@/components/freelancer/incoming-requests'

export default function FreelancerProjectsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Projects</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your active projects and incoming requests</p>
      </div>

      <IncomingRequests />
      <FreelancerActiveProjects />
    </div>
  )
}
