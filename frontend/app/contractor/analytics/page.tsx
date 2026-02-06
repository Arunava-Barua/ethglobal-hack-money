'use client'

import { BudgetAnalytics } from '@/components/contractor/budget-analytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Users, FileText } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Detailed insights into your spending and project performance</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Spent (YTD)', value: '$84.5K', icon: TrendingDown, change: '+12% vs last year', color: 'text-primary' },
          { label: 'Avg Contract Value', value: '$10.6K', icon: TrendingUp, change: '+5% vs Q3', color: 'text-emerald-600' },
          { label: 'Freelancer Retention', value: '87%', icon: Users, change: '3 returning', color: 'text-blue-600' },
          { label: 'Contracts Completed', value: '14', icon: FileText, change: 'This quarter', color: 'text-accent' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card border border-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <BudgetAnalytics />
    </div>
  )
}
