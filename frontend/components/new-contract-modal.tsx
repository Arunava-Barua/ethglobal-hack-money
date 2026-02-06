'use client'

import { useState } from 'react'
import {
  Upload,
  Github,
  Video,
  Wallet,
  Zap,
  Hand,
  CalendarDays,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface NewContractModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewContractModal({ open, onOpenChange }: NewContractModalProps) {
  const [paymentMode, setPaymentMode] = useState<'agentic' | 'manual'>('agentic')
  const [fileName, setFileName] = useState<string>('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setFileName(file.name)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Initiate New Contract</DialogTitle>
          <DialogDescription>
            Set up a new streaming contract with a freelancer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Freelancer Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Freelancer Alias</Label>
              <Input placeholder="e.g. alex_dev" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Wallet Address</Label>
              <div className="relative">
                <Input placeholder="0x... or ENS name" className="pr-10 font-mono text-sm" />
                <Wallet className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Upload PDF */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Task Specifications (PDF)</Label>
            <div className="relative">
              <label className="flex items-center gap-3 px-4 py-3 border border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <Upload className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {fileName || 'Click to upload task specification PDF'}
                </span>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Github className="w-4 h-4" />
                GitHub Repository
              </Label>
              <Input placeholder="https://github.com/..." />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Video className="w-4 h-4" />
                Google Meet Link
              </Label>
              <Input placeholder="https://meet.google.com/..." />
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Total Budget</Label>
              <div className="flex gap-2">
                <Select defaultValue="eth">
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eth">ETH</SelectItem>
                    <SelectItem value="usdc">USDC</SelectItem>
                    <SelectItem value="usdt">USDT</SelectItem>
                    <SelectItem value="dai">DAI</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="0.00" className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Streaming Rate
              </Label>
              <div className="flex gap-2">
                <Input type="number" placeholder="0.00" className="flex-1" />
                <Select defaultValue="day">
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hour">/ hour</SelectItem>
                    <SelectItem value="day">/ day</SelectItem>
                    <SelectItem value="week">/ week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Payment Mode Toggle */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Payment Mode</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMode('agentic')}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                  paymentMode === 'agentic'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  paymentMode === 'agentic' ? 'bg-primary/15' : 'bg-muted'
                }`}>
                  <Zap className={`w-5 h-5 ${paymentMode === 'agentic' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Agentic</p>
                  <p className="text-xs text-muted-foreground">AI-evaluated milestones</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode('manual')}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                  paymentMode === 'manual'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  paymentMode === 'manual' ? 'bg-primary/15' : 'bg-muted'
                }`}>
                  <Hand className={`w-5 h-5 ${paymentMode === 'manual' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Manual</p>
                  <p className="text-xs text-muted-foreground">Contractor-controlled</p>
                </div>
              </button>
            </div>
          </div>

          {/* Tenure */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Tentative Tenure
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Start Date</span>
                <Input type="date" />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">End Date</span>
                <Input type="date" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Zap className="w-4 h-4" />
              Start Streaming Payout
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
