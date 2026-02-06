'use client'

import { EarningsAnalytics } from '@/components/freelancer/earnings-analytics'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, Zap, Clock, BarChart3 } from 'lucide-react'
import { StreamingCounter } from '@/components/streaming-counter'

export default function EarningsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Earnings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Detailed breakdown of your earnings and payouts</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-xs text-muted-foreground mb-1">Total Earnings</p>
            <p className="text-2xl font-bold text-foreground">24.8 ETH</p>
            <p className="text-xs text-emerald-600 mt-1">~$42,160</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <p className="text-xs text-muted-foreground mb-1">Currently Streaming</p>
            <div className="text-2xl font-bold text-foreground">
              <StreamingCounter baseValue={5.12} ratePerSecond={0.0005} suffix=" ETH" decimals={4} />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mb-1">This Month</p>
            <p className="text-2xl font-bold text-foreground">4.8 ETH</p>
            <p className="text-xs text-emerald-600 mt-1">+15% vs last month</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-5">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-3">
              <BarChart3 className="w-5 h-5 text-violet-600" />
            </div>
            <p className="text-xs text-muted-foreground mb-1">Avg per Contract</p>
            <p className="text-2xl font-bold text-foreground">3.1 ETH</p>
            <p className="text-xs text-muted-foreground mt-1">8 completed</p>
          </CardContent>
        </Card>
      </div>

      <EarningsAnalytics />
    </div>
  )
}
