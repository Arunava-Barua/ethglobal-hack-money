'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Files,
  Settings,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/contractor/dashboard' },
  { label: 'Projects', icon: FolderKanban, href: '/contractor/projects' },
  { label: 'Freelancers', icon: Users, href: '/contractor/freelancers' },
  { label: 'Contracts', icon: FileText, href: '/contractor/contracts' },
  { label: 'Payments & Streams', icon: CreditCard, href: '/contractor/payments' },
  { label: 'Analytics', icon: BarChart3, href: '/contractor/analytics' },
  { label: 'Documents', icon: Files, href: '/contractor/documents' },
  { label: 'Settings', icon: Settings, href: '/contractor/settings' },
]

export function ContractorSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-all duration-300 sticky top-0',
        collapsed ? 'w-[68px]' : 'w-[240px]'
      )}
    >
      {/* Logo — links to homepage */}
      <Link href="/" className="h-16 flex items-center px-4 border-b border-sidebar-border hover:bg-sidebar-accent transition-colors">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center flex-shrink-0">
              <span className="text-sidebar-primary-foreground font-bold text-sm">F</span>
            </div>
            <span className="font-semibold text-sidebar-foreground text-base tracking-tight">StarcPay</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center mx-auto">
            <span className="text-sidebar-primary-foreground font-bold text-sm">F</span>
          </div>
        )}
      </Link>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                )}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-sidebar-primary')} />
                {!collapsed && <span>{item.label}</span>}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <Link href="/">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200">
            <ArrowLeftRight className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Switch Role</span>}
          </div>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
    </aside>
  )
}
