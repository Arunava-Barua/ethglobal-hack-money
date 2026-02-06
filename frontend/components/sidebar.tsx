'use client'

import { LayoutGrid, Calendar, Wallet, MessageSquare, Users, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  return (
    <aside
      className={`${
        isOpen ? 'w-20' : 'w-0'
      } bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 flex flex-col items-center py-8 gap-8`}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      >
        <LayoutGrid className="w-6 h-6" />
      </Button>

      <nav className="space-y-4 flex flex-col items-center">
        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Calendar className="w-6 h-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Wallet className="w-6 h-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Users className="w-6 h-6" />
        </Button>
      </nav>

      <div className="mt-auto">
        <Button
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Settings className="w-6 h-6" />
        </Button>
      </div>
    </aside>
  )
}
