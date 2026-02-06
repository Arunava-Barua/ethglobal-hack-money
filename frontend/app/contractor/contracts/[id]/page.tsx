'use client'

import { use } from 'react'
import { ArrowLeft, FileText, Github, Video, Pause, Play, Square, ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StatusBadge } from '@/components/status-badge'
import { StreamingCounter } from '@/components/streaming-counter'
import { Separator } from '@/components/ui/separator'

const contractData = {
  id: '1',
  title: 'DeFi Dashboard Frontend',
  freelancerAlias: 'alex_dev',
  freelancerInitials: 'AD',
  freelancerWallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f2e8aF',
  status: 'active' as const,
  mode: 'agentic' as const,
  budget: '5.0 ETH',
  streamed: 2.45,
  streamRate: 0.0002,
  progress: 65,
  startDate: 'Jan 15, 2026',
  endDate: 'Mar 15, 2026',
  githubUrl: 'https://github.com/example/defi-dashboard',
  meetLink: 'https://meet.google.com/abc-defg-hij',
  pdfName: 'defi_dashboard_specs.pdf',
  milestones: [
    { id: '1', title: 'Project Setup & Architecture', status: 'completed', dueDate: 'Jan 20' },
    { id: '2', title: 'Wallet Integration Module', status: 'completed', dueDate: 'Jan 28' },
    { id: '3', title: 'Dashboard Charts & Analytics', status: 'completed', dueDate: 'Feb 5' },
    { id: '4', title: 'Token Swap Interface', status: 'in-progress', dueDate: 'Feb 15' },
    { id: '5', title: 'Responsive Design & Mobile', status: 'pending', dueDate: 'Feb 25' },
    { id: '6', title: 'Testing & Documentation', status: 'pending', dueDate: 'Mar 10' },
  ],
  activityLog: [
    { id: '1', event: 'Contract created', timestamp: 'Jan 15, 2026 10:30 AM', type: 'info' },
    { id: '2', event: 'Streaming payout initiated', timestamp: 'Jan 15, 2026 10:35 AM', type: 'success' },
    { id: '3', event: 'Milestone 1 completed - verified by agent', timestamp: 'Jan 20, 2026 3:15 PM', type: 'success' },
    { id: '4', event: 'Milestone 2 completed - verified by agent', timestamp: 'Jan 28, 2026 5:00 PM', type: 'success' },
    { id: '5', event: 'Stream paused for review', timestamp: 'Feb 1, 2026 2:00 PM', type: 'warning' },
    { id: '6', event: 'Stream resumed', timestamp: 'Feb 1, 2026 4:30 PM', type: 'info' },
    { id: '7', event: 'Milestone 3 completed - verified by agent', timestamp: 'Feb 5, 2026 11:00 AM', type: 'success' },
  ],
}

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Back Button */}
      <Link href="/contractor/contracts">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back to Contracts
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {contractData.freelancerInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{contractData.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-muted-foreground font-mono">@{contractData.freelancerAlias}</span>
              <StatusBadge status="live" />
              <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium capitalize">
                {contractData.mode}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Pause className="w-3.5 h-3.5" /> Pause
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive">
            <Square className="w-3.5 h-3.5" /> Stop
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contract Metadata */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Budget</span>
                  <p className="font-semibold text-foreground">{contractData.budget}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration</span>
                  <p className="font-semibold text-foreground">{contractData.startDate} - {contractData.endDate}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Wallet</span>
                  <p className="font-mono text-xs text-foreground truncate">{contractData.freelancerWallet}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Progress</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={contractData.progress} className="h-2 flex-1" />
                    <span className="font-semibold text-foreground text-xs">{contractData.progress}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents & Links */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Documents & Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm" className="gap-2">
                  <FileText className="w-4 h-4" /> {contractData.pdfName}
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Github className="w-4 h-4" /> GitHub Repo
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Video className="w-4 h-4" /> Google Meet
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Milestones & Task Checklist */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Milestones & Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contractData.milestones.map((milestone, i) => (
                  <div
                    key={milestone.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background"
                  >
                    {milestone.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    ) : milestone.status === 'in-progress' ? (
                      <Clock className="w-5 h-5 text-accent flex-shrink-0 animate-pulse-stream" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${milestone.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {milestone.title}
                      </p>
                      <p className="text-xs text-muted-foreground">Due: {milestone.dueDate}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        milestone.status === 'completed'
                          ? 'text-emerald-600 border-emerald-200'
                          : milestone.status === 'in-progress'
                          ? 'text-accent border-accent/30'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {milestone.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Streaming Status */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                Streaming Status
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-live-dot" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stream Visualization */}
              <div className="relative p-4 rounded-lg bg-gradient-to-r from-primary/5 to-emerald-500/5 border border-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1">
                      <span className="text-xs font-bold text-primary">You</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Contractor</p>
                  </div>
                  <div className="flex-1 mx-4 relative">
                    <div className="h-[2px] bg-gradient-to-r from-primary to-emerald-500 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 py-0.5 rounded text-[9px] font-mono text-muted-foreground border border-border">
                      streaming
                    </div>
                  </div>
                  <div className="text-center">
                    <Avatar className="w-10 h-10 mx-auto mb-1">
                      <AvatarFallback className="text-xs bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                        {contractData.freelancerInitials}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-[10px] text-muted-foreground">@{contractData.freelancerAlias}</p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Streamed</p>
                  <StreamingCounter
                    baseValue={contractData.streamed}
                    ratePerSecond={contractData.streamRate}
                    suffix=" ETH"
                    decimals={6}
                    className="text-xl font-bold text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-medium font-mono">{contractData.streamRate} ETH/sec</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget Used</span>
                  <span className="font-medium">{Math.round((contractData.streamed / 5) * 100)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contractData.activityLog.slice().reverse().map((log) => (
                  <div key={log.id} className="flex gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      log.type === 'success' ? 'bg-emerald-500' :
                      log.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="text-foreground text-xs">{log.event}</p>
                      <p className="text-[10px] text-muted-foreground">{log.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
