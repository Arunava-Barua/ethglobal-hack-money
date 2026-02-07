'use client'

import { useState } from 'react'
import { Plus, Vault, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ContractorOverviewCards } from '@/components/contractor/overview-cards'
import { ActiveProjectsGrid } from '@/components/contractor/active-projects-grid'
import { BudgetAnalytics } from '@/components/contractor/budget-analytics'
import { NewContractModal } from '@/components/new-contract-modal'

export default function ContractorDashboardPage() {
  const [showNewContract, setShowNewContract] = useState(false)
  const [treasuryCreated, setTreasuryCreated] = useState(false)
  const [isCreatingTreasury, setIsCreatingTreasury] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')

  const handleCreateTreasury = () => {
    setIsCreatingTreasury(true)
    console.log('Create Treasury:', { action: 'TreasuryFactory.createTreasury()' })
    // Simulate creation
    setTimeout(() => {
      setTreasuryCreated(true)
      setIsCreatingTreasury(false)
    }, 1000)
  }

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount)
    if (!amount || amount <= 0) return
    console.log('Deposit USDC:', {
      action: 'StreamingTreasury.deposit()',
      amount,
      currency: 'USDC',
    })
    setDepositAmount('')
  }

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

      {/* Treasury Card */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Vault className="w-5 h-5" />
            Treasury
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!treasuryCreated ? (
            <div className="flex items-center justify-between p-4 rounded-lg border border-dashed border-border bg-muted/30">
              <div>
                <p className="text-sm font-medium text-foreground">No treasury created yet</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Create a treasury to start depositing USDC and streaming payments
                </p>
              </div>
              <Button
                onClick={handleCreateTreasury}
                disabled={isCreatingTreasury}
                className="gap-2"
              >
                {isCreatingTreasury ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Vault className="w-4 h-4" />
                )}
                Create Treasury
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Treasury active</span>
                <span className="font-mono text-xs text-muted-foreground ml-auto">0x7a2d...3f8B</span>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  placeholder="Amount in USDC"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleDeposit}
                  disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                  className="gap-2"
                >
                  Deposit USDC
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
