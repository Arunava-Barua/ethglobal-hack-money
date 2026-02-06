'use client'

import { useEffect, useState } from 'react'

interface StreamingCounterProps {
  baseValue: number
  ratePerSecond: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}

export function StreamingCounter({
  baseValue,
  ratePerSecond,
  prefix = '',
  suffix = '',
  decimals = 6,
  className = '',
}: StreamingCounterProps) {
  const [value, setValue] = useState(baseValue)

  useEffect(() => {
    const interval = setInterval(() => {
      setValue((prev) => prev + ratePerSecond / 10)
    }, 100)
    return () => clearInterval(interval)
  }, [ratePerSecond])

  return (
    <span className={`font-mono tabular-nums animate-count-up ${className}`}>
      {prefix}{value.toFixed(decimals)}{suffix}
    </span>
  )
}
