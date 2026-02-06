'use client'

import { cn } from '@/lib/utils'

type Status = 'live' | 'paused' | 'pending' | 'completed' | 'active' | 'cancelled'

const statusConfig: Record<Status, { label: string; dotClass: string; bgClass: string; textClass: string }> = {
  live: {
    label: 'Live',
    dotClass: 'bg-emerald-500 animate-live-dot',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
    textClass: 'text-emerald-700 dark:text-emerald-400',
  },
  active: {
    label: 'Active',
    dotClass: 'bg-emerald-500 animate-live-dot',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
    textClass: 'text-emerald-700 dark:text-emerald-400',
  },
  paused: {
    label: 'Paused',
    dotClass: 'bg-amber-500',
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    textClass: 'text-amber-700 dark:text-amber-400',
  },
  pending: {
    label: 'Pending',
    dotClass: 'bg-blue-500',
    bgClass: 'bg-blue-50 dark:bg-blue-950/30',
    textClass: 'text-blue-700 dark:text-blue-400',
  },
  completed: {
    label: 'Completed',
    dotClass: 'bg-slate-400',
    bgClass: 'bg-slate-50 dark:bg-slate-950/30',
    textClass: 'text-slate-600 dark:text-slate-400',
  },
  cancelled: {
    label: 'Cancelled',
    dotClass: 'bg-red-500',
    bgClass: 'bg-red-50 dark:bg-red-950/30',
    textClass: 'text-red-700 dark:text-red-400',
  },
}

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const config = statusConfig[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        config.bgClass,
        config.textClass,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dotClass)} />
      {config.label}
    </span>
  )
}
