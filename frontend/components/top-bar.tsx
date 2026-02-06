'use client'

import { useState } from 'react'
import { Bell, Download, Moon, Sun, Wallet, ChevronDown, LogOut, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from 'next-themes'

interface Notification {
  id: string
  title: string
  message: string
  time: string
  unread: boolean
}

const mockNotifications: Notification[] = [
  { id: '1', title: 'Contract Started', message: 'Streaming payout initiated for Frontend Project', time: '2m ago', unread: true },
  { id: '2', title: 'Milestone Completed', message: 'Task #3 verified by agentic evaluation', time: '1h ago', unread: true },
  { id: '3', title: 'Payment Received', message: '0.5 ETH received from TechStart Inc', time: '3h ago', unread: false },
]

export function TopBar({ role }: { role: 'contractor' | 'freelancer' }) {
  const { theme, setTheme } = useTheme()
  const [walletConnected, setWalletConnected] = useState(false)
  const [copied, setCopied] = useState(false)
  const unreadCount = mockNotifications.filter(n => n.unread).length

  const handleCopyAddress = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">F</span>
          </div>
          <span className="font-semibold text-foreground text-lg tracking-tight">StarcPay</span>
        </div>
        <Badge variant="outline" className="text-xs font-medium capitalize border-border">
          {role}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        {/* Export Data */}
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Download className="w-4 h-4" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-muted-foreground hover:text-foreground"
        >
          <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-3 py-2 border-b border-border">
              <p className="font-semibold text-sm">Notifications</p>
            </div>
            {mockNotifications.map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                <div className="flex items-center gap-2 w-full">
                  <span className="font-medium text-sm">{n.title}</span>
                  {n.unread && <span className="w-2 h-2 rounded-full bg-accent ml-auto flex-shrink-0" />}
                </div>
                <span className="text-xs text-muted-foreground">{n.message}</span>
                <span className="text-xs text-muted-foreground/60">{n.time}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Wallet Connect */}
        {walletConnected ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 h-9 px-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-live-dot" />
                <span className="text-sm font-mono">0x742d...e8aF</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyAddress} className="gap-2 cursor-pointer">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Address'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setWalletConnected(false)} className="gap-2 text-destructive cursor-pointer">
                <LogOut className="w-4 h-4" />
                Disconnect
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            onClick={() => setWalletConnected(true)}
            className="gap-2 h-9 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Wallet className="w-4 h-4" />
            <span className="text-sm">Connect Wallet</span>
          </Button>
        )}
      </div>
    </header>
  )
}
