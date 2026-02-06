'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { date: 'Aug 1', revenue: 45000 },
  { date: 'Aug 5', revenue: 52000 },
  { date: 'Aug 10', revenue: 48000 },
  { date: 'Aug 15', revenue: 61000 },
  { date: 'Aug 20', revenue: 55000 },
  { date: 'Aug 25', revenue: 72000 },
  { date: 'Aug 30', revenue: 80000 },
]

export function RevenueChart() {
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
