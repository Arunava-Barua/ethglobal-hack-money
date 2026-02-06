'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const data = [
  { name: 'Frontend Developers', value: 35 },
  { name: 'Backend Developers', value: 25 },
  { name: 'Designers', value: 20 },
  { name: 'Quality Assurance', value: 20 },
]

const COLORS = ['#5B6FE8', '#E85B9F', '#FFD700', '#FFA500']

export function SpendingChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value}%`} />
      </PieChart>
    </ResponsiveContainer>
  )
}
