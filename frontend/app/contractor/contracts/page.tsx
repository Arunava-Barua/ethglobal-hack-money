'use client'

import { useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/status-badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { NewContractModal } from '@/components/new-contract-modal'

interface Contract {
  id: string
  title: string
  freelancerAlias: string
  freelancerInitials: string
  status: 'active' | 'paused' | 'pending' | 'completed'
  mode: 'agentic' | 'manual'
  budget: string
  progress: number
  startDate: string
  endDate: string
}

const contracts: Contract[] = [
  { id: '1', title: 'DeFi Dashboard Frontend', freelancerAlias: 'alex_dev', freelancerInitials: 'AD', status: 'active', mode: 'agentic', budget: '5.0 ETH', progress: 65, startDate: 'Jan 15, 2026', endDate: 'Mar 15, 2026' },
  { id: '2', title: 'Smart Contract Audit', freelancerAlias: 'sarah_sec', freelancerInitials: 'SC', status: 'active', mode: 'manual', budget: '3.0 ETH', progress: 40, startDate: 'Jan 20, 2026', endDate: 'Feb 28, 2026' },
  { id: '3', title: 'NFT Marketplace API', freelancerAlias: 'mike_api', freelancerInitials: 'MB', status: 'paused', mode: 'agentic', budget: '8.0 ETH', progress: 80, startDate: 'Dec 1, 2025', endDate: 'Feb 15, 2026' },
  { id: '4', title: 'Token Bridge Integration', freelancerAlias: 'emma_web3', freelancerInitials: 'EW', status: 'pending', mode: 'agentic', budget: '6.5 ETH', progress: 0, startDate: 'Feb 10, 2026', endDate: 'Apr 10, 2026' },
  { id: '5', title: 'Governance Portal UI', freelancerAlias: 'raj_ui', freelancerInitials: 'RU', status: 'active', mode: 'manual', budget: '4.0 ETH', progress: 25, startDate: 'Feb 1, 2026', endDate: 'Mar 30, 2026' },
  { id: '6', title: 'Analytics Microservice', freelancerAlias: 'chen_dev', freelancerInitials: 'CD', status: 'completed', mode: 'agentic', budget: '4.5 ETH', progress: 100, startDate: 'Nov 1, 2025', endDate: 'Jan 10, 2026' },
]

export default function ContractsPage() {
  const [search, setSearch] = useState('')
  const [showNewContract, setShowNewContract] = useState(false)

  const filtered = contracts.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.freelancerAlias.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Contracts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage all your active and past contracts</p>
        </div>
        <Button onClick={() => setShowNewContract(true)} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4" /> New Contract
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search contracts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* Contract List */}
      <div className="space-y-3">
        {filtered.map((contract) => (
          <Link key={contract.id} href={`/contractor/contracts/${contract.id}`}>
            <Card className="bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 cursor-pointer mb-3">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                        {contract.freelancerInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{contract.title}</h3>
                      <p className="text-xs text-muted-foreground font-mono">@{contract.freelancerAlias}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium capitalize">
                      {contract.mode}
                    </span>
                    <StatusBadge status={contract.status === 'active' ? 'live' : contract.status} />
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{contract.progress}%</span>
                    </div>
                    <Progress value={contract.progress} className="h-1.5" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{contract.budget}</p>
                    <p className="text-[10px] text-muted-foreground">{contract.startDate} - {contract.endDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <NewContractModal open={showNewContract} onOpenChange={setShowNewContract} />
    </div>
  )
}
