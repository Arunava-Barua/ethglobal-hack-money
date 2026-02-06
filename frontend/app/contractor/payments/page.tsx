'use client'

import { Zap, ArrowUpRight, ArrowDownRight, Pause, Play, Square } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { StreamingCounter } from '@/components/streaming-counter'

const activeStreams = [
  { id: '1', to: 'alex_dev', project: 'DeFi Dashboard Frontend', rate: '0.0002 ETH/sec', total: 2.45, ratePerSec: 0.0002, status: 'live' as const },
  { id: '2', to: 'sarah_sec', project: 'Smart Contract Audit', rate: '0.0003 ETH/sec', total: 1.89, ratePerSec: 0.0003, status: 'live' as const },
  { id: '3', to: 'raj_ui', project: 'Governance Portal UI', rate: '0.00015 ETH/sec', total: 0.78, ratePerSec: 0.00015, status: 'live' as const },
  { id: '4', to: 'mike_api', project: 'NFT Marketplace API', rate: '0.00025 ETH/sec', total: 3.12, ratePerSec: 0, status: 'paused' as const },
]

const pastPayments = [
  { id: '1', to: 'chen_dev', project: 'Analytics Microservice', amount: '4.5 ETH', date: 'Jan 10, 2026', tx: '0xabc...' },
  { id: '2', to: 'alex_dev', project: 'Landing Page V2', amount: '2.0 ETH', date: 'Dec 20, 2025', tx: '0xdef...' },
  { id: '3', to: 'sarah_sec', project: 'Security Audit Q4', amount: '3.8 ETH', date: 'Nov 30, 2025', tx: '0xghi...' },
]

export default function PaymentsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Payments & Streams</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your outgoing streams and payment history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1">Active Streams</p>
            <p className="text-2xl font-bold text-foreground">3</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Currently streaming</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1">Total Streaming</p>
            <div className="text-2xl font-bold text-foreground">
              <StreamingCounter baseValue={5.12} ratePerSecond={0.0005} suffix=" ETH" decimals={4} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Combined outflow</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-1">Total Paid (All time)</p>
            <p className="text-2xl font-bold text-foreground">45.8 ETH</p>
            <p className="text-xs text-muted-foreground mt-1">~$77,860</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Streams */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4" /> Active Streams
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeStreams.map((stream) => (
              <div key={stream.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-background">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">@{stream.to}</p>
                    <p className="text-xs text-muted-foreground">{stream.project}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground font-mono">{stream.rate}</p>
                    {stream.status === 'live' ? (
                      <StreamingCounter
                        baseValue={stream.total}
                        ratePerSecond={stream.ratePerSec}
                        suffix=" ETH"
                        decimals={5}
                        className="text-sm font-semibold text-foreground"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-foreground">{stream.total.toFixed(4)} ETH</span>
                    )}
                  </div>
                  <StatusBadge status={stream.status} />
                  <div className="flex gap-1">
                    {stream.status === 'live' ? (
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Pause className="w-3.5 h-3.5" /></Button>
                    ) : (
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Play className="w-3.5 h-3.5" /></Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Square className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Past Payments */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pastPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">@{p.to} — {p.project}</p>
                    <p className="text-[10px] text-muted-foreground">{p.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{p.amount}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{p.tx}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
