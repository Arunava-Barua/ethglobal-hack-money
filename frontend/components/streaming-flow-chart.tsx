'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { time: '00:00', inflow: 0, outflow: 0 },
  { time: '04:00', inflow: 0.2, outflow: 0.05 },
  { time: '08:00', inflow: 0.4, outflow: 0.1 },
  { time: '12:00', inflow: 0.6, outflow: 0.15 },
  { time: '16:00', inflow: 0.8, outflow: 0.2 },
  { time: '20:00', inflow: 0.8, outflow: 0.25 },
  { time: '23:59', inflow: 0.8, outflow: 0.3 },
]

export function StreamingFlowChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#5B6FE8" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#5B6FE8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#E85B9F" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#E85B9F" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="time" stroke="#999" />
        <YAxis stroke="#999" label={{ value: 'ETH', angle: -90, position: 'insideLeft' }} />
        <Tooltip formatter={(value) => `${value} ETH`} />
        <Area
          type="monotone"
          dataKey="inflow"
          stroke="#5B6FE8"
          fillOpacity={1}
          fill="url(#colorInflow)"
          name="Inflow"
        />
        <Area
          type="monotone"
          dataKey="outflow"
          stroke="#E85B9F"
          fillOpacity={1}
          fill="url(#colorOutflow)"
          name="Outflow"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
