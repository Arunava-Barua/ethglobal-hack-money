'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { metric: 'Contracts', value: 847 },
  { metric: 'Users', value: 2450 },
  { metric: 'Disputes', value: 12 },
  { metric: 'Completed', value: 625 },
]

export function PlatformMetricsChart() {
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
