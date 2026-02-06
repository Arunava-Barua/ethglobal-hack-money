'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { day: 'Mon', contractors: 120, freelancers: 180 },
  { day: 'Tue', contractors: 150, freelancers: 200 },
  { day: 'Wed', contractors: 180, freelancers: 220 },
  { day: 'Thu', contractors: 170, freelancers: 210 },
  { day: 'Fri', contractors: 200, freelancers: 240 },
  { day: 'Sat', contractors: 130, freelancers: 160 },
  { day: 'Sun', contractors: 100, freelancers: 140 },
]

export function UserActivityChart() {
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
