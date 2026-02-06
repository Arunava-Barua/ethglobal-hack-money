'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

const data = [
  { week: 'Week 1', earnings: 1200 },
  { week: 'Week 2', earnings: 2100 },
  { week: 'Week 3', earnings: 1800 },
  { week: 'Week 4', earnings: 3400 },
]

export function FreelancerEarningsChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#5B6FE8" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#5B6FE8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="week" stroke="#999" />
        <YAxis stroke="#999" label={{ value: 'Earnings ($)', angle: -90, position: 'insideLeft' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
          }}
          formatter={(value) => `$${value}`}
        />
        <Area
          type="monotone"
          dataKey="earnings"
          stroke="#5B6FE8"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorEarnings)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
