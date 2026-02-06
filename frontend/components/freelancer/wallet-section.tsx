'use client'

import { Wallet, Zap, ExternalLink, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'

const activeStreams = [
  { id: '1', from: 'TechStart Inc', rate: '0.0002 ETH/sec', status: 'live' as const, total: '2.45 ETH' },
  { id: '2', from: 'CryptoSafe DAO', rate: '0.0003 ETH/sec', status: 'live' as const, total: '1.89 ETH' },
  { id: '3', from: 'DeFi Labs', rate: '0.00015 ETH/sec', status: 'live' as const, total: '0.78 ETH' },
]

const pastPayouts = [
  { id: '1', project: 'Analytics Microservice', amount: '4.5 ETH', date: 'Jan 10, 2026', type: 'completed' },
  { id: '2', project: 'Landing Page Redesign', amount: '2.0 ETH', date: 'Dec 20, 2025', type: 'completed' },
  { id: '3', project: 'API Gateway', amount: '3.8 ETH', date: 'Nov 30, 2025', type: 'completed' },
  { id: '4', project: 'Mobile App MVP', amount: '6.2 ETH', date: 'Oct 15, 2025', type: 'completed' },
]

export function WalletSection() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Wallet & Payments</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Connected Wallet */}
        <Card className="bg-card border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Wallet className="w-4 h-4" /> Connected Wallet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-background border border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Address</span>
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">
                  Connected
                </Badge>
              </div>
              <p className="font-mono text-sm text-foreground">0x742d35Cc6634C0532925a3b844Bc9e7595f2e8aF</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-background border border-border">
                <p className="text-xs text-muted-foreground mb-1">Available</p>
                <p className="text-lg font-bold text-foreground">2.5 ETH</p>
                <p className="text-[10px] text-muted-foreground">~$4,250</p>
              </div>
              <div className="p-3 rounded-lg bg-background border border-border">
                <p className="text-xs text-muted-foreground mb-1">Total Received</p>
                <p className="text-lg font-bold text-foreground">24.8 ETH</p>
                <p className="text-[10px] text-emerald-600">Lifetime</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Streams */}
        <Card className="bg-card border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4" /> Active Streams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {activeStreams.map((stream) => (
                <div key={stream.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{stream.from}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{stream.rate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{stream.total}</p>
                    <StatusBadge status={stream.status} className="text-[9px]" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Past Payouts */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pastPayouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <ArrowDownRight className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{payout.project}</p>
                    <p className="text-[10px] text-muted-foreground">{payout.date}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground">{payout.amount}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
