'use client'

import { use, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, FileText, Github, Video, Pause, Play, Square,
  CheckCircle, Clock, AlertCircle, Bot, MessageSquare,
  ShieldCheck, ShieldAlert, ShieldQuestion, TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatusBadge } from '@/components/status-badge'
import { StreamingCounter } from '@/components/streaming-counter'
import { StreamedAmountChart } from '@/components/streamed-amount-chart'
import { getProjectDetail } from '@/lib/mock-project'
import { queryStream, type StreamState } from '@/lib/streaming'
import { formatEther } from 'viem'

const POLL_INTERVAL = 15_000

export default function ContractorProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const project = getProjectDetail(id)
  const [streamState, setStreamState] = useState<StreamState | null>(null)

  // Poll on-chain stream state
  const pollStream = useCallback(async () => {
    if (!project?.treasuryAddress || project.streamId == null) return
    const state = await queryStream(project.treasuryAddress, project.streamId)
    if (state) setStreamState(state)
  }, [project?.treasuryAddress, project?.streamId])

  useEffect(() => {
    pollStream()
    const interval = setInterval(pollStream, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [pollStream])

  if (!project) {
    return (
      <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
        <Link href="/contractor/projects">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground -ml-2">
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Button>
        </Link>
        <div className="mt-12 text-center text-muted-foreground">Project not found.</div>
      </div>
    )
  }

  // Compute live values from on-chain state when available
  const liveRate = streamState
    ? parseFloat(formatEther(BigInt(streamState.ratePerSecond)))
    : project.streamRate

  const liveStreamed = (() => {
    if (streamState) {
      const accruedWei = BigInt(streamState.accrued)
      const rateWei = BigInt(streamState.ratePerSecond)
      const elapsed = streamState.paused
        ? 0n
        : BigInt(Math.floor(Date.now() / 1000) - streamState.lastTimestamp)
      const totalWei = accruedWei + rateWei * elapsed
      return parseFloat(formatEther(totalWei))
    }
    return project.streamed
  })()

  const completedMilestones = project.milestones.filter((m) => m.status === 'completed').length
  const budgetUsedPct = Math.round((liveStreamed / project.budget) * 100)

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Back */}
      <Link href="/contractor/projects">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {project.freelancerInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{project.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-muted-foreground font-mono">@{project.freelancerAlias}</span>
              <StatusBadge status={project.status === 'active' ? 'live' : project.status} />
              <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium capitalize">
                {project.mode}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {project.status === 'active' && (
            <>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Pause className="w-3.5 h-3.5" /> Pause
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive">
                <Square className="w-3.5 h-3.5" /> Stop
              </Button>
            </>
          )}
          {project.status === 'paused' && (
            <>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Play className="w-3.5 h-3.5" /> Resume
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive">
                <Square className="w-3.5 h-3.5" /> Stop
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Budget</p>
            <p className="text-lg font-bold">{project.budget} {project.currency}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Milestones</p>
            <p className="text-lg font-bold">{completedMilestones}/{project.milestones.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Tasks Done</p>
            <p className="text-lg font-bold">{project.tasksCompleted}/{project.totalTasks}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Stream Rate</p>
            <p className="text-lg font-bold font-mono">{liveRate.toFixed(10)} <span className="text-xs font-normal text-muted-foreground">{project.currency}/s</span></p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Details */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{project.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Duration</span>
                  <p className="font-semibold text-foreground">{project.startDate} — {project.endDate}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Freelancer Wallet</span>
                  <p className="font-mono text-xs text-foreground truncate">{project.freelancerWallet}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Overall Progress</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={project.progress} className="h-2 flex-1" />
                    <span className="font-semibold text-foreground text-xs">{project.progress}%</span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Budget Used</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={budgetUsedPct} className="h-2 flex-1" />
                    <span className="font-semibold text-foreground text-xs">{budgetUsedPct}%</span>
                  </div>
                </div>
              </div>
              {/* Documents */}
              <Separator />
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm" className="gap-2">
                  <FileText className="w-4 h-4" /> {project.pdfName}
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

          {/* Tabs: Milestones / Agentic Approvals / Agentic Comments */}
          <Tabs defaultValue="milestones">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="approvals" className="gap-1.5">
                <Bot className="w-3.5 h-3.5" /> Approvals
              </TabsTrigger>
              <TabsTrigger value="comments" className="gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Agent Comments
              </TabsTrigger>
            </TabsList>

            {/* Milestones */}
            <TabsContent value="milestones">
              <Card className="bg-card border border-border shadow-sm">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {project.milestones.map((ms) => (
                      <div
                        key={ms.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background"
                      >
                        {ms.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        ) : ms.status === 'in-progress' ? (
                          <Clock className="w-5 h-5 text-accent flex-shrink-0 animate-pulse-stream" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${ms.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                            {ms.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Due: {ms.dueDate}</span>
                            {ms.completedDate && <span>· Done: {ms.completedDate}</span>}
                            {ms.approvedBy && (
                              <Badge variant="outline" className="text-[10px] gap-1">
                                <Bot className="w-3 h-3" /> {ms.approvedBy === 'agent' ? 'Agent verified' : 'Manual'}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            ms.status === 'completed'
                              ? 'text-emerald-600 border-emerald-200'
                              : ms.status === 'in-progress'
                              ? 'text-accent border-accent/30'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {ms.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Agentic Approvals */}
            <TabsContent value="approvals">
              <Card className="bg-card border border-border shadow-sm">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {project.agenticApprovals.map((approval) => (
                      <div
                        key={approval.id}
                        className="p-4 rounded-lg border border-border bg-background space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {approval.verdict === 'approved' ? (
                              <ShieldCheck className="w-5 h-5 text-emerald-500" />
                            ) : approval.verdict === 'rejected' ? (
                              <ShieldAlert className="w-5 h-5 text-red-500" />
                            ) : (
                              <ShieldQuestion className="w-5 h-5 text-amber-500" />
                            )}
                            <span className="text-sm font-medium text-foreground">{approval.milestoneTitle}</span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-[10px] capitalize ${
                              approval.verdict === 'approved'
                                ? 'text-emerald-600 border-emerald-200'
                                : approval.verdict === 'rejected'
                                ? 'text-red-600 border-red-200'
                                : 'text-amber-600 border-amber-200'
                            }`}
                          >
                            {approval.verdict.replace('-', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{approval.reason}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{approval.timestamp}</span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {approval.confidence}% confidence
                          </span>
                        </div>
                      </div>
                    ))}
                    {project.agenticApprovals.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No agentic approvals yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Agentic Comments */}
            <TabsContent value="comments">
              <Card className="bg-card border border-border shadow-sm">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {project.agenticComments.map((c) => {
                      const categoryColors: Record<string, string> = {
                        'code-quality': 'text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/30',
                        progress: 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30',
                        suggestion: 'text-violet-600 border-violet-200 bg-violet-50 dark:bg-violet-950/30',
                        risk: 'text-red-600 border-red-200 bg-red-50 dark:bg-red-950/30',
                      }
                      return (
                        <div
                          key={c.id}
                          className="p-4 rounded-lg border border-border bg-background space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <Bot className="w-4 h-4 text-muted-foreground" />
                            <Badge variant="outline" className={`text-[10px] capitalize ${categoryColors[c.category] ?? ''}`}>
                              {c.category.replace('-', ' ')}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground ml-auto">{c.timestamp}</span>
                          </div>
                          <p className="text-sm text-foreground">{c.comment}</p>
                        </div>
                      )
                    })}
                    {project.agenticComments.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No agent comments yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column — 1/3 */}
        <div className="space-y-6">
          {/* Streaming Status */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                Streaming Status
                {project.status === 'active' && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-live-dot" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                      {project.status === 'active' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                      )}
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 py-0.5 rounded text-[9px] font-mono text-muted-foreground border border-border">
                      {project.status === 'active' ? 'streaming' : project.status}
                    </div>
                  </div>
                  <div className="text-center">
                    <Avatar className="w-10 h-10 mx-auto mb-1">
                      <AvatarFallback className="text-xs bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                        {project.freelancerInitials}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-[10px] text-muted-foreground">@{project.freelancerAlias}</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Streamed</p>
                  {project.status === 'active' ? (
                    <StreamingCounter
                      baseValue={liveStreamed}
                      ratePerSecond={liveRate}
                      suffix={` ${project.currency}`}
                      decimals={6}
                      className="text-xl font-bold text-foreground"
                    />
                  ) : (
                    <span className="text-xl font-bold text-foreground font-mono">
                      {liveStreamed.toFixed(6)} {project.currency}
                    </span>
                  )}
                </div>
              </div>
              {/* Streamed Amount Chart */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Streamed Over Time</p>
                <StreamedAmountChart
                  startTimestamp={project.startTimestamp}
                  ratePerSecond={liveRate}
                  currency={project.currency}
                  paused={project.status === 'paused'}
                />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-medium font-mono">{liveRate.toFixed(10)} {project.currency}/sec</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget Used</span>
                  <span className="font-medium">{budgetUsedPct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-medium font-mono">{(project.budget - liveStreamed).toFixed(4)} {project.currency}</span>
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
                {project.activityLog.slice().reverse().map((log) => (
                  <div key={log.id} className="flex gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      log.type === 'success' ? 'bg-emerald-500' :
                      log.type === 'warning' ? 'bg-amber-500' :
                      log.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
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
