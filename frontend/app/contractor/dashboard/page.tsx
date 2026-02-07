'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Vault, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ContractorOverviewCards } from '@/components/contractor/overview-cards'
import { ActiveProjectsGrid } from '@/components/contractor/active-projects-grid'
import { BudgetAnalytics } from '@/components/contractor/budget-analytics'
import { NewContractModal } from '@/components/new-contract-modal'
import { useWallet } from '@/components/wallet-provider'
import { TREASURY_FACTORY_ADDRESS } from '@/contract/contractDetails'
import { getTreasuryAddress, getTreasuryBalance } from '@/lib/treasury'
import { formatEther, parseEther } from 'viem'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export default function ContractorDashboardPage() {
  const { address, walletId, userToken, executeChallenge } = useWallet()

  const [showNewContract, setShowNewContract] = useState(false)
  const [treasuryAddress, setTreasuryAddress] = useState<string | null>(null)
  const [treasuryBalance, setTreasuryBalance] = useState<bigint>(0n)
  const [isLoadingTreasury, setIsLoadingTreasury] = useState(true)
  const [isCreatingTreasury, setIsCreatingTreasury] = useState(false)
  const [isDepositing, setIsDepositing] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [txError, setTxError] = useState<string | null>(null)
  const [txSuccess, setTxSuccess] = useState<string | null>(null)

  const clearMessages = () => {
    setTxError(null)
    setTxSuccess(null)
  }

  // Check if treasury already exists for this wallet
  const checkTreasury = useCallback(async () => {
    if (!address) {
      setIsLoadingTreasury(false)
      return
    }
    try {
      setIsLoadingTreasury(true)
      const treasAddr = await getTreasuryAddress(address)
      if (treasAddr && treasAddr !== ZERO_ADDRESS) {
        setTreasuryAddress(treasAddr)
        const balance = await getTreasuryBalance(treasAddr)
        setTreasuryBalance(balance)
      } else {
        setTreasuryAddress(null)
      }
    } catch (err) {
      console.error('Failed to check treasury:', err)
    } finally {
      setIsLoadingTreasury(false)
    }
  }, [address])

  useEffect(() => {
    checkTreasury()
  }, [checkTreasury])

  const handleCreateTreasury = async () => {
    if (!walletId || !userToken) {
      setTxError('Wallet not connected or session expired. Please reconnect.')
      return
    }

    clearMessages()
    setIsCreatingTreasury(true)

    try {
      // Step 1: Request contract execution challenge from Circle
      const res = await fetch('/api/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'contractExecution',
          userToken,
          walletId,
          contractAddress: TREASURY_FACTORY_ADDRESS,
          abiFunctionSignature: 'createTreasury()',
          abiParameters: [],
          feeLevel: 'MEDIUM',
        }),
      })

      const data = await res.json()

      console.log('❤️Create treasury response:', data)
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to create transaction')
      }

      const { challengeId } = data
      if (!challengeId) {
        throw new Error('No challengeId returned from API')
      }

      // Step 2: Execute challenge (user signs via Circle SDK)
      console.log('[Treasury] Executing challenge:', challengeId)
      await executeChallenge(challengeId)
      console.log('[Treasury] Challenge executed successfully')

      setTxSuccess('Treasury created! Fetching address...')

      // Step 3: Poll for the treasury address (give the chain a moment to confirm)
      let retries = 0
      const maxRetries = 12
      while (retries < maxRetries) {
        await new Promise((r) => setTimeout(r, 5000))
        const treasAddr = await getTreasuryAddress(address!)
        console.log(`[Treasury poll ${retries + 1}/${maxRetries}] result:`, treasAddr)
        if (treasAddr && treasAddr !== ZERO_ADDRESS) {
          setTreasuryAddress(treasAddr)
          const balance = await getTreasuryBalance(treasAddr)
          setTreasuryBalance(balance)
          setTxSuccess(`Treasury created at ${treasAddr}`)
          break
        }
        retries++
      }

      if (retries >= maxRetries) {
        setTxSuccess('Treasury transaction submitted. Checking again shortly...')
        // Schedule a background re-check after a longer delay
        setTimeout(() => checkTreasury(), 10000)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Treasury creation failed'
      setTxError(message)
      console.error('Create treasury error:', err)
    } finally {
      setIsCreatingTreasury(false)
    }
  }

  const handleDeposit = async () => {
    const amount = parseFloat(depositAmount)
    if (!amount || amount <= 0) return
    if (!walletId || !userToken || !treasuryAddress) {
      setTxError('Wallet not connected or treasury not found.')
      return
    }

    clearMessages()
    setIsDepositing(true)

    try {
      // Step 1: Request contract execution challenge for deposit
      const res = await fetch('/api/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'contractExecution',
          userToken,
          walletId,
          contractAddress: treasuryAddress,
          abiFunctionSignature: 'deposit()',
          abiParameters: [],
          feeLevel: 'MEDIUM',
          amount: depositAmount,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to create deposit transaction')
      }

      const { challengeId } = data
      if (!challengeId) {
        throw new Error('No challengeId returned from API')
      }

      // Step 2: Execute challenge
      await executeChallenge(challengeId)

      setTxSuccess(`Deposited ${depositAmount} USDC into treasury`)
      setDepositAmount('')

      // Refresh balance after a short delay
      setTimeout(async () => {
        try {
          const balance = await getTreasuryBalance(treasuryAddress)
          setTreasuryBalance(balance)
        } catch {
          // silent
        }
      }, 5000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Deposit failed'
      setTxError(message)
      console.error('Deposit error:', err)
    } finally {
      setIsDepositing(false)
    }
  }

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`

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

      {/* Status Messages */}
      {txError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {txError}
        </div>
      )}
      {txSuccess && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {txSuccess}
        </div>
      )}

      {/* Treasury Card */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Vault className="w-5 h-5" />
            Treasury
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingTreasury ? (
            <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking treasury status...
            </div>
          ) : !treasuryAddress ? (
            <div className="flex items-center justify-between p-4 rounded-lg border border-dashed border-border bg-muted/30">
              <div>
                <p className="text-sm font-medium text-foreground">No treasury created yet</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Create a treasury to start depositing USDC and streaming payments
                </p>
              </div>
              <Button
                onClick={handleCreateTreasury}
                disabled={isCreatingTreasury || !address}
                className="gap-2"
              >
                {isCreatingTreasury ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Vault className="w-4 h-4" />
                )}
                {isCreatingTreasury ? 'Creating...' : 'Create Treasury'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Treasury active</span>
                <span className="font-mono text-xs text-muted-foreground ml-auto">
                  {truncateAddress(treasuryAddress)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Balance:</span>
                <span className="font-semibold">
                  {formatEther(treasuryBalance)} USDC
                </span>
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
                  disabled={isDepositing || !depositAmount || parseFloat(depositAmount) <= 0}
                  className="gap-2"
                >
                  {isDepositing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  {isDepositing ? 'Depositing...' : 'Deposit USDC'}
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
