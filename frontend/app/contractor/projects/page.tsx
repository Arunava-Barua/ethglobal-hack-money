'use client'

import { useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ActiveProjectsGrid } from '@/components/contractor/active-projects-grid'
import { NewContractModal } from '@/components/new-contract-modal'

export default function ContractorProjectsPage() {
  const [showNewContract, setShowNewContract] = useState(false)

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage and monitor all your active projects</p>
        </div>
        <Button onClick={() => setShowNewContract(true)} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4" /> New Project
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search projects..." className="pl-10" />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      <ActiveProjectsGrid />
      <NewContractModal open={showNewContract} onOpenChange={setShowNewContract} />
    </div>
  )
}
