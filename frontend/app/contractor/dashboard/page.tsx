'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ContractorOverviewCards } from '@/components/contractor/overview-cards'
import { ActiveProjectsGrid } from '@/components/contractor/active-projects-grid'
import { BudgetAnalytics } from '@/components/contractor/budget-analytics'
import { NewContractModal } from '@/components/new-contract-modal'

export default function ContractorDashboardPage() {
  const [showNewContract, setShowNewContract] = useState(false)

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Overview of your projects and streaming payouts
          </p>
        </div>
        <Button
          onClick={() => setShowNewContract(true)}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Initiate New Contract
        </Button>
      </div>

      {/* Overview Cards */}
      <ContractorOverviewCards />

      {/* Active Projects Grid */}
      <ActiveProjectsGrid />

      {/* Budget & Streaming Analytics */}
      <BudgetAnalytics />

      {/* New Contract Modal */}
      <NewContractModal open={showNewContract} onOpenChange={setShowNewContract} />
    </div>
  )
}
