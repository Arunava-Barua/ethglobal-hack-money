'use client'

import { WalletSection } from '@/components/freelancer/wallet-section'

export default function FreelancerWalletPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Wallet & Payments</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your wallet, streams, and payment history</p>
      </div>

      <WalletSection />
    </div>
  )
}
