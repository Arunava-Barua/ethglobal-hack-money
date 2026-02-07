'use client'

import { useState } from 'react'
import { Wallet, ChevronDown, LogOut, Copy, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useWallet } from '@/components/wallet-provider'

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function ConnectWallet({ variant = 'default' }: { variant?: 'default' | 'landing' }) {
  const { isConnected, isConnecting, address, connect, disconnect, error } = useWallet()
  const [copied, setCopied] = useState(false)

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 h-9 px-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-live-dot" />
            <span className="text-sm font-mono">{truncateAddress(address)}</span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCopyAddress} className="gap-2 cursor-pointer">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Address'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={disconnect} className="gap-2 text-destructive cursor-pointer">
            <LogOut className="w-4 h-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <Button
        onClick={connect}
        disabled={isConnecting}
        className={
          variant === 'landing'
            ? 'gap-2'
            : 'gap-2 h-9 bg-primary hover:bg-primary/90 text-primary-foreground'
        }
        variant={variant === 'landing' ? 'outline' : 'default'}
      >
        {isConnecting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Wallet className="w-4 h-4" />
        )}
        <span className="text-sm">
          {isConnecting ? 'Connecting...' : 'Sign in with Google'}
        </span>
      </Button>
      {error && (
        <p className="text-xs text-destructive max-w-[200px] text-center">{error}</p>
      )}
    </div>
  )
}
