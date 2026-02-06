'use client'

import { FileText, FolderOpen, Users, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateType = 'projects' | 'contracts' | 'freelancers' | 'payments' | 'documents' | 'general'

const icons: Record<EmptyStateType, React.ElementType> = {
  projects: FolderOpen,
  contracts: FileText,
  freelancers: Users,
  payments: Wallet,
  documents: FileText,
  general: FolderOpen,
}

interface EmptyStateProps {
  type?: EmptyStateType
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ type = 'general', title, description, action, className }: EmptyStateProps) {
  const Icon = icons[type]

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {action}
    </div>
  )
}
