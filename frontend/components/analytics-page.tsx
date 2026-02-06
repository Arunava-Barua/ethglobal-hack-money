'use client'

import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlatformMetricsChart } from './platform-metrics-chart'
import { UserActivityChart } from './user-activity-chart'
import { ContractStatusChart } from './contract-status-chart'
import { TopContractorsChart } from './top-contractors-chart'
import { RevenueChart } from './revenue-chart'

export function AnalyticsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Analytics & Reports</h1>
          <p className="text-muted-foreground">Platform metrics and insights</p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Calendar className="w-4 h-4" />
          <span>Last 30 Days</span>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Users</p>
            <p className="text-3xl font-bold text-foreground mb-2">2,450</p>
            <p className="text-xs text-green-600">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Active Contracts</p>
            <p className="text-3xl font-bold text-foreground mb-2">847</p>
            <p className="text-xs text-green-600">+8% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Volume</p>
            <p className="text-3xl font-bold text-foreground mb-2">$2.3M</p>
            <p className="text-xs text-green-600">+15% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Avg. Contract Value</p>
            <p className="text-3xl font-bold text-foreground mb-2">$2,718</p>
            <p className="text-xs text-green-600">+3% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        {/* User Activity */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <UserActivityChart />
          </CardContent>
        </Card>

        {/* Platform Metrics */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Platform Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <PlatformMetricsChart />
          </CardContent>
        </Card>

        {/* Contract Status Distribution */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Contract Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ContractStatusChart />
          </CardContent>
        </Card>
      </div>

      {/* Top Contractors */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <TopContractorsChart />
        </CardContent>
      </Card>
    </div>
  )
}
