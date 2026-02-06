'use client'

import { FreelancerOverviewCards } from '@/components/freelancer/overview-cards'
import { IncomingRequests } from '@/components/freelancer/incoming-requests'
import { FreelancerActiveProjects } from '@/components/freelancer/active-projects'
import { EarningsAnalytics } from '@/components/freelancer/earnings-analytics'
import { WalletSection } from '@/components/freelancer/wallet-section'

export default function FreelancerDashboardPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track your projects, earnings, and streaming payouts
        </p>
      </div>

      {/* Overview Cards + GitHub Connect */}
      <FreelancerOverviewCards />

      {/* Incoming Contract Requests */}
      <IncomingRequests />

      {/* Active Projects */}
      <FreelancerActiveProjects />

      {/* Earnings Analytics */}
      <EarningsAnalytics />

      {/* Wallet & Payments */}
      <WalletSection />
    </div>
  )
}
