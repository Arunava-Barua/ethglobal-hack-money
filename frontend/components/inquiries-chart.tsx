'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const data = [
  { name: 'Design', value: 25 },
  { name: 'Development', value: 25 },
  { name: 'Backend', value: 25 },
  { name: 'Maintenance', value: 25 },
]

const COLORS = ['#5B6FE8', '#FFD700', '#FFA500', '#E85B9F']

export function InquiriesChart() {
  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value}%`} />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-6 w-full space-y-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></span>
              <span className="text-foreground font-medium">{item.name}</span>
            </div>
            <span className="text-muted-foreground">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
