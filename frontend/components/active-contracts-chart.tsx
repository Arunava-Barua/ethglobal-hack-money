'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Jan', value: 4, completed: 2 },
  { name: 'Feb', value: 6, completed: 3 },
  { name: 'Mar', value: 8, completed: 5 },
  { name: 'Apr', value: 12, completed: 8 },
  { name: 'May', value: 15, completed: 10 },
  { name: 'Jun', value: 18, completed: 14 },
  { name: 'Jul', value: 22, completed: 16 },
  { name: 'Aug', value: 25, completed: 18 },
]

export function ActiveContractsChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" stroke="#999" />
        <YAxis stroke="#999" />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Bar dataKey="value" fill="#5B6FE8" name="Active" radius={[8, 8, 0, 0]} />
        <Bar dataKey="completed" fill="#E85B9F" name="Completed" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
