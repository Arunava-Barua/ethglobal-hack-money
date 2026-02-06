'use client'

import { Wallet, Send, Zap, TrendingUp, Copy, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StreamingFlowChart } from './streaming-flow-chart'
import { WalletTransactionsCard } from './wallet-transactions-card'
import { StreamingPaymentsCard } from './streaming-payments-card'

export function WalletPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Web3 Wallet & Streaming</h1>
          <p className="text-muted-foreground">Manage crypto payments and streaming contracts</p>
        </div>
      </div>

      {/* Wallet Connect Section */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 shadow-sm mb-8">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Wallet className="w-12 h-12 text-primary" />
              <div>
                <h3 className="text-xl font-bold text-foreground mb-1">Connected Wallet</h3>
                <p className="text-sm text-muted-foreground">0x742d...e8aF</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Copy className="w-4 h-4" />
                Copy
              </Button>
              <Button variant="outline" className="gap-2 text-destructive hover:text-destructive bg-transparent">
                <LogOut className="w-4 h-4" />
                Disconnect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Available Balance</p>
                <p className="text-3xl font-bold text-foreground">2.5 ETH</p>
                <p className="text-xs text-muted-foreground mt-1">≈ $4,250</p>
              </div>
              <Wallet className="w-12 h-12 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Streaming Balance</p>
                <p className="text-3xl font-bold text-foreground">0.8 ETH</p>
                <p className="text-xs text-muted-foreground mt-1">≈ $1,360/month</p>
              </div>
              <Zap className="w-12 h-12 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Received</p>
                <p className="text-3xl font-bold text-foreground">15.8 ETH</p>
                <p className="text-xs text-green-600 mt-1">+5.2% this month</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Streaming Flow */}
        <div className="lg:col-span-2">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Money Streaming Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <StreamingFlowChart />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full gap-2 bg-primary hover:bg-primary/90">
                <Send className="w-4 h-4" />
                Send Payment
              </Button>
              <Button variant="outline" className="w-full gap-2 bg-transparent">
                <Zap className="w-4 h-4" />
                Start Stream
              </Button>
              <Button variant="outline" className="w-full gap-2 bg-transparent">
                Withdraw Funds
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Network</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chain:</span>
                  <span className="font-semibold text-foreground">Ethereum</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Network:</span>
                  <span className="font-semibold text-foreground">Mainnet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gas Price:</span>
                  <span className="font-semibold text-foreground">45 Gwei</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Transactions and Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <WalletTransactionsCard />
        <StreamingPaymentsCard />
      </div>
    </div>
  )
}
