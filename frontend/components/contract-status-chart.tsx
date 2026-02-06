'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const data = [
  { name: 'Active', value: 450 },
  { name: 'Pending', value: 200 },
  { name: 'Completed', value: 625 },
  { name: 'Disputed', value: 12 },
]

const COLORS = ['#5B6FE8', '#FFD700', '#E85B9F', '#FF6B6B']

export function ContractStatusChart() {
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
