'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { month: 'Sep', thisMonth: 15, previousMonth: 8 },
  { month: 'Aug', thisMonth: 22, previousMonth: 14 },
  { month: 'July', thisMonth: 28, previousMonth: 18 },
  { month: 'June', thisMonth: 35, previousMonth: 25 },
  { month: 'May', thisMonth: 30, previousMonth: 28 },
  { month: 'April', thisMonth: 25, previousMonth: 16 },
  { month: 'March', thisMonth: 32, previousMonth: 20 },
  { month: 'Feb', thisMonth: 28, previousMonth: 24 },
]

export function IncomeChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" stroke="#999" />
        <YAxis stroke="#999" label={{ value: 'Income (k)', angle: -90, position: 'insideLeft' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
          }}
        />
        <Line
          type="monotone"
          dataKey="thisMonth"
          stroke="#5B6FE8"
          strokeWidth={3}
          dot={false}
          name="This month"
        />
        <Line
          type="monotone"
          dataKey="previousMonth"
          stroke="#E85B9F"
          strokeWidth={3}
          dot={false}
          name="Previous month"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
