'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface StreamedAmountChartProps {
  startTimestamp: number // unix seconds
  ratePerSecond: number // human-readable (e.g. 0.0002)
  currency: string
  paused?: boolean
}

export function StreamedAmountChart({
  startTimestamp,
  ratePerSecond,
  currency,
  paused = false,
}: StreamedAmountChartProps) {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000))

  // Tick every 5s so the chart visibly grows while streaming
  useEffect(() => {
    if (paused) return
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000))
    }, 5000)
    return () => clearInterval(interval)
  }, [paused])

  const data = useMemo(() => {
    const elapsed = now - startTimestamp
    if (elapsed <= 0) return []

    const POINTS = 24
    const step = elapsed / POINTS
    const result = []

    for (let i = 0; i <= POINTS; i++) {
      const secondsElapsed = Math.floor(step * i)
      const streamed = ratePerSecond * secondsElapsed

      let label: string
      if (elapsed < 3600) {
        label = `${Math.floor(secondsElapsed / 60)}m`
      } else if (elapsed < 86400) {
        label = `${(secondsElapsed / 3600).toFixed(1)}h`
      } else {
        label = `${(secondsElapsed / 86400).toFixed(1)}d`
      }

      result.push({ time: label, streamed: parseFloat(streamed.toFixed(6)) })
    }

    return result
  }, [startTimestamp, ratePerSecond, now])

  if (data.length === 0) return null

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorStreamed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="time"
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 10 }}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          tick={{ fontSize: 10 }}
          width={55}
          tickFormatter={(v: number) => v.toFixed(2)}
        />
        <Tooltip
          formatter={(value: number) => [
            `${value.toFixed(6)} ${currency}`,
            'Streamed',
          ]}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            borderColor: 'hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Area
          type="monotone"
          dataKey="streamed"
          stroke="#10b981"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorStreamed)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
