'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'

const streamingData = [
  { date: 'Jan', payout: 4.2 },
  { date: 'Feb', payout: 6.8 },
  { date: 'Mar', payout: 5.5 },
  { date: 'Apr', payout: 8.1 },
  { date: 'May', payout: 9.3 },
  { date: 'Jun', payout: 7.6 },
  { date: 'Jul', payout: 11.2 },
  { date: 'Aug', payout: 10.5 },
  { date: 'Sep', payout: 12.8 },
  { date: 'Oct', payout: 14.1 },
  { date: 'Nov', payout: 13.2 },
  { date: 'Dec', payout: 15.4 },
]

const burnData = [
  { month: 'Jul', burn: 8200 },
  { month: 'Aug', burn: 9400 },
  { month: 'Sep', burn: 7800 },
  { month: 'Oct', burn: 11200 },
  { month: 'Nov', burn: 10500 },
  { month: 'Dec', burn: 12800 },
]

export function BudgetAnalytics() {
  const budgetUsed = 84500
  const budgetTotal = 124500
  const utilization = Math.round((budgetUsed / budgetTotal) * 100)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Budget & Streaming Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Streaming Payout Line Chart */}
        <Card className="lg:col-span-2 bg-card border border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Payout Streamed Over Time (ETH)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={streamingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="payout"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Budget Gauge */}
        <Card className="bg-card border border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Budget Utilization
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${utilization * 2.64} ${264 - utilization * 2.64}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-foreground">{utilization}%</span>
                <span className="text-[10px] text-muted-foreground">utilized</span>
              </div>
            </div>
            <div className="mt-3 text-center">
              <p className="text-sm font-semibold text-foreground">
                ${(budgetUsed / 1000).toFixed(1)}K / ${(budgetTotal / 1000).toFixed(1)}K
              </p>
              <p className="text-xs text-muted-foreground">
                ${((budgetTotal - budgetUsed) / 1000).toFixed(1)}K remaining
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Burn Histogram */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monthly Burn Rate ($)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={burnData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="burn" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
