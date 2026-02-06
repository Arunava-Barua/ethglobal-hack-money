'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Dime1', value: 20 },
  { name: 'Dime1', value: 50 },
  { name: 'Dime1', value: 75 },
  { name: 'Dime1', value: 55 },
  { name: 'Dime1', value: 80 },
  { name: 'Dime1', value: 45 },
  { name: 'Dime1', value: 15 },
]

export function TasksChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="name" stroke="#999" axisLine={false} tickLine={false} />
        <YAxis stroke="#999" axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
          }}
        />
        <Bar dataKey="value" fill="#2E3B8C" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
