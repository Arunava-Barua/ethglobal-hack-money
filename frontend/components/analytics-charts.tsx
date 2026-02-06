'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

// Revenue Trend
export function RevenueChart() {
  const data = [
    { date: 'Aug 1', revenue: 45000 },
    { date: 'Aug 5', revenue: 52000 },
    { date: 'Aug 10', revenue: 48000 },
    { date: 'Aug 15', revenue: 61000 },
    { date: 'Aug 20', revenue: 55000 },
    { date: 'Aug 25', revenue: 72000 },
    { date: 'Aug 30', revenue: 80000 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" stroke="#999" />
        <YAxis stroke="#999" />
        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
        <Line type="monotone" dataKey="revenue" stroke="#5B6FE8" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

// User Activity
export function UserActivityChart() {
  const data = [
    { day: 'Mon', contractors: 120, freelancers: 180 },
    { day: 'Tue', contractors: 150, freelancers: 200 },
    { day: 'Wed', contractors: 180, freelancers: 220 },
    { day: 'Thu', contractors: 170, freelancers: 210 },
    { day: 'Fri', contractors: 200, freelancers: 240 },
    { day: 'Sat', contractors: 130, freelancers: 160 },
    { day: 'Sun', contractors: 100, freelancers: 140 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="day" stroke="#999" />
        <YAxis stroke="#999" />
        <Tooltip />
        <Legend />
        <Bar dataKey="contractors" fill="#5B6FE8" radius={[8, 8, 0, 0]} />
        <Bar dataKey="freelancers" fill="#E85B9F" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Platform Metrics
export function PlatformMetricsChart() {
  const data = [
    { metric: 'Contracts', value: 847 },
    { metric: 'Users', value: 2450 },
    { metric: 'Disputes', value: 12 },
    { metric: 'Completed', value: 625 },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis type="number" stroke="#999" />
        <YAxis dataKey="metric" type="category" stroke="#999" width={100} />
        <Tooltip />
        <Bar dataKey="value" fill="#5B6FE8" radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// Contract Status
export function ContractStatusChart() {
  const data = [
    { name: 'Active', value: 450 },
    { name: 'Pending', value: 200 },
    { name: 'Completed', value: 625 },
    { name: 'Disputed', value: 12 },
  ]

  const COLORS = ['#5B6FE8', '#FFD700', '#E85B9F', '#FF6B6B']

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

// Top Contractors
export function TopContractorsChart() {
  const data = [
    { name: 'Alex Johnson', contracts: 45, rating: 4.9, revenue: 125000 },
    { name: 'Sarah Chen', contracts: 38, rating: 4.8, revenue: 98000 },
    { name: 'Mike Brown', contracts: 32, rating: 4.7, revenue: 85000 },
    { name: 'Emma Davis', contracts: 28, rating: 4.9, revenue: 72000 },
    { name: 'John Smith', contracts: 24, rating: 4.6, revenue: 64000 },
  ]

  return (
    <div className="space-y-3">
      {data.map((contractor, index) => (
        <div key={contractor.name} className="p-4 border border-muted rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-primary">#{index + 1}</span>
              <div>
                <p className="font-semibold text-foreground">{contractor.name}</p>
                <p className="text-sm text-muted-foreground">{contractor.contracts} contracts completed</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-foreground">{contractor.rating}/5.0</p>
              <p className="text-sm text-muted-foreground">${(contractor.revenue / 1000).toFixed(0)}K earned</p>
            </div>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent"
              style={{ width: `${(contractor.contracts / 50) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  )
}
