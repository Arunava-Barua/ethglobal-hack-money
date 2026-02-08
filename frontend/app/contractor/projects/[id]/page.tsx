'use client'

import { use, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, FileText, Github, Video, Pause, Play, Square,
  CheckCircle, Clock, AlertCircle, Bot, MessageSquare,
  ShieldCheck, ShieldAlert, ShieldQuestion, TrendingUp, Loader2, Webhook,
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
import { queryStream, sendStreamAction, type StreamState } from '@/lib/streaming'
import {
  getProject,
  updateWebhook,
  getProjectPushEvents,
  getProjectAnalyses,
  type BackendProject,
  type PushEvent,
  type CommitAnalysis,
} from '@/lib/api'
import { useWallet } from '@/components/wallet-provider'
import { formatEther } from 'viem'

const POLL_INTERVAL = 15_000

export default function ContractorProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { walletId, userToken, executeChallenge } = useWallet()

  const [project, setProject] = useState<BackendProject | null>(null)
  const [isLoadingProject, setIsLoadingProject] = useState(true)
  const [streamState, setStreamState] = useState<StreamState | null>(null)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)

  // Webhook state
  const [isRegisteringWebhook, setIsRegisteringWebhook] = useState(false)
  const [webhookMsg, setWebhookMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Approvals (push-events) and Agent Comments (analyses)
  const [pushEvents, setPushEvents] = useState<PushEvent[]>([])
  const [analyses, setAnalyses] = useState<CommitAnalysis[]>([])
  const [isLoadingEvents, setIsLoadingEvents] = useState(true)

  // Fetch project from backend
  useEffect(() => {
    async function load() {
      try {
        const data = await getProject(id)
        setProject(data)
      } catch (err) {
        console.error('Failed to fetch project:', err)
      } finally {
        setIsLoadingProject(false)
      }
    }
    load()
  }, [id])

  // Fetch push-events and analyses
  useEffect(() => {
    async function loadEvents() {
      try {
        const [eventsRes, analysesRes] = await Promise.all([
          getProjectPushEvents(id),
          getProjectAnalyses(id),
        ])
        setPushEvents(eventsRes.push_events)
        setAnalyses(analysesRes.analyses)
      } catch (err) {
        console.error('Failed to fetch events/analyses:', err)
      } finally {
        setIsLoadingEvents(false)
      }
    }
    loadEvents()
  }, [id])

  // Poll on-chain stream state
  const pollStream = useCallback(async () => {
    if (!project?.treasury_address || project.stream_id == null) return
    const state = await queryStream(project.treasury_address, parseInt(project.stream_id, 10))
    if (state) setStreamState(state)
  }, [project?.treasury_address, project?.stream_id])

  useEffect(() => {
    pollStream()
    const interval = setInterval(pollStream, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [pollStream])

  // Stream actions (pause/resume/stop)
  async function handleStreamAction(action: 'pauseStream' | 'resumeStream' | 'stopStream') {
    if (!walletId || !userToken || !project?.treasury_address || project.stream_id == null) return

    setActionInProgress(action)
    try {
      const challengeId = await sendStreamAction(
        action,
        parseInt(project.stream_id, 10),
        project.treasury_address,
        walletId,
        userToken,
      )
      await executeChallenge(challengeId)

      let retries = 0
      const maxRetries = 10
      while (retries < maxRetries) {
        await new Promise((r) => setTimeout(r, 5000))
        const state = await queryStream(project.treasury_address, parseInt(project.stream_id, 10))
        if (state) {
          const expectedPaused = action !== 'resumeStream'
          if (state.paused === expectedPaused) {
            setStreamState(state)
            break
          }
        }
        retries++
      }
    } catch (err) {
      console.error(`Stream ${action} failed:`, err)
    } finally {
      setActionInProgress(null)
    }
  }

  // Register Webhook
  async function handleRegisterWebhook() {
    if (!project) return
    setIsRegisteringWebhook(true)
    setWebhookMsg(null)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''
      const result = await updateWebhook({
        project_id: project.project_id,
        new_webhook_url: `${backendUrl}/api/webhooks/github`,
      })
      setWebhookMsg({ type: 'success', text: result.message || 'Webhook registered successfully' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to register webhook'
      setWebhookMsg({ type: 'error', text: msg })
    } finally {
      setIsRegisteringWebhook(false)
    }
  }

  if (isLoadingProject) {
    return (
      <div className="p-6 lg:p-8 max-w-[1400px] mx-auto flex items-center justify-center py-24 gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading project...
      </div>
    )
  }

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

  // Derived values
  const streamId = project.stream_id != null ? parseInt(project.stream_id, 10) : null
  const spec = project.milestone_specification as {
    projectTitle?: string
    description?: string
    milestones?: { title: string; tasks: string[] }[]
  } | null
  const projectName = spec?.projectTitle ?? `Contract with ${project.freelance_alias}`
  const description = spec?.description ?? ''
  const milestones = spec?.milestones ?? []
  const initials = project.freelance_alias
    .split(/[_\s-]/)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2)

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString()
    } catch {
      return d
    }
  }

  // Live status from on-chain state
  const liveStatus: 'active' | 'paused' | 'completed' = streamState
    ? streamState.paused
      ? BigInt(streamState.ratePerSecond) === 0n ? 'completed' : 'paused'
      : 'active'
    : (project.status as 'active' | 'paused' | 'completed')

  const liveRate = streamState
    ? parseFloat(formatEther(BigInt(streamState.ratePerSecond)))
    : 0

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
    return 0
  })()

  const budgetUsedPct = project.total_budget > 0 ? Math.round((liveStreamed / project.total_budget) * 100) : 0
  const startTimestamp = Math.floor(new Date(project.start_date).getTime() / 1000)

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Back */}
      <Link href="/contractor/projects">
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground -ml-2">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Button>
      </Link>

      {/* Webhook message */}
      {webhookMsg && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
          webhookMsg.type === 'success'
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600'
            : 'bg-destructive/10 border border-destructive/20 text-destructive'
        }`}>
          {webhookMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {webhookMsg.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">{projectName}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-muted-foreground font-mono">@{project.freelance_alias}</span>
              <StatusBadge status={liveStatus === 'active' ? 'live' : liveStatus} />
              <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium capitalize">
                {project.evaluation_mode}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={isRegisteringWebhook}
            onClick={handleRegisterWebhook}
          >
            {isRegisteringWebhook ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Webhook className="w-3.5 h-3.5" />
            )}
            Register Webhook
          </Button>
          {liveStatus === 'active' && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={!!actionInProgress}
                onClick={() => handleStreamAction('pauseStream')}
              >
                {actionInProgress === 'pauseStream' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Pause className="w-3.5 h-3.5" />
                )}
                Pause
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive"
                disabled={!!actionInProgress}
                onClick={() => handleStreamAction('stopStream')}
              >
                {actionInProgress === 'stopStream' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Square className="w-3.5 h-3.5" />
                )}
                Stop
              </Button>
            </>
          )}
          {liveStatus === 'paused' && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={!!actionInProgress}
                onClick={() => handleStreamAction('resumeStream')}
              >
                {actionInProgress === 'resumeStream' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                Resume
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-destructive hover:text-destructive"
                disabled={!!actionInProgress}
                onClick={() => handleStreamAction('stopStream')}
              >
                {actionInProgress === 'stopStream' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Square className="w-3.5 h-3.5" />
                )}
                Stop
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
            <p className="text-lg font-bold">{project.total_budget} USDC</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Milestones</p>
            <p className="text-lg font-bold">{milestones.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Earned (Pending)</p>
            <p className="text-lg font-bold">{project.earned_pending.toFixed(2)} USDC</p>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border shadow-sm">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Stream Rate</p>
            <p className="text-lg font-bold font-mono">{liveRate.toFixed(10)} <span className="text-xs font-normal text-muted-foreground">USDC/s</span></p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Details */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Duration</span>
                  <p className="font-semibold text-foreground">{formatDate(project.start_date)} — {formatDate(project.end_date)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Freelancer Wallet</span>
                  <p className="font-mono text-xs text-foreground truncate">{project.employee_wallet_address}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Budget Used</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={budgetUsedPct} className="h-2 flex-1" />
                    <span className="font-semibold text-foreground text-xs">{budgetUsedPct}%</span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Paid</span>
                  <p className="font-semibold text-foreground">{project.total_paid.toFixed(2)} USDC</p>
                </div>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4" /> GitHub Repo
                  </a>
                </Button>
                {project.gmeet_link && (
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <a href={project.gmeet_link} target="_blank" rel="noopener noreferrer">
                      <Video className="w-4 h-4" /> Google Meet
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs: Milestones / Approvals / Agent Comments */}
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
                    {milestones.map((ms, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background"
                      >
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{ms.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {ms.tasks?.length ?? 0} tasks
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">
                          pending
                        </Badge>
                      </div>
                    ))}
                    {milestones.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No milestones defined.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Approvals (from push-events) */}
            <TabsContent value="approvals">
              <Card className="bg-card border border-border shadow-sm">
                <CardContent className="pt-6">
                  {isLoadingEvents ? (
                    <div className="flex items-center justify-center py-8 gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading push events...
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pushEvents.map((evt) => (
                        <div
                          key={evt.push_id}
                          className="p-4 rounded-lg border border-border bg-background space-y-2"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {evt.status === 'analyzed' || evt.status === 'processed' ? (
                                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                              ) : evt.status === 'pending_analysis' ? (
                                <Clock className="w-5 h-5 text-amber-500" />
                              ) : (
                                <ShieldQuestion className="w-5 h-5 text-blue-500" />
                              )}
                              <span className="text-sm font-medium text-foreground">
                                Push by @{evt.pusher}
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-[10px] capitalize ${
                                evt.status === 'analyzed' || evt.status === 'processed'
                                  ? 'text-emerald-600 border-emerald-200'
                                  : evt.status === 'pending_analysis'
                                  ? 'text-amber-600 border-amber-200'
                                  : 'text-blue-600 border-blue-200'
                              }`}
                            >
                              {evt.status.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {evt.ref} &middot; {evt.commit_shas.length} commit{evt.commit_shas.length !== 1 ? 's' : ''}
                          </div>
                          {evt.commits_details.length > 0 && (
                            <div className="space-y-1 pl-2 border-l-2 border-border ml-2">
                              {evt.commits_details.slice(0, 5).map((c) => (
                                <div key={c.sha} className="text-xs">
                                  <span className="font-mono text-muted-foreground">{c.sha.slice(0, 7)}</span>
                                  {' '}<span className="text-foreground">{c.message}</span>
                                  <span className="text-muted-foreground ml-2">
                                    +{c.additions} -{c.deletions}
                                  </span>
                                </div>
                              ))}
                              {evt.commits_details.length > 5 && (
                                <p className="text-[10px] text-muted-foreground">
                                  ... and {evt.commits_details.length - 5} more
                                </p>
                              )}
                            </div>
                          )}
                          <div className="text-[10px] text-muted-foreground">
                            {new Date(evt.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))}
                      {pushEvents.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No push events yet.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Agent Comments (from analyses) */}
            <TabsContent value="comments">
              <Card className="bg-card border border-border shadow-sm">
                <CardContent className="pt-6">
                  {isLoadingEvents ? (
                    <div className="flex items-center justify-center py-8 gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" /> Loading analyses...
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {analyses.map((a) => {
                        const statusColors: Record<string, string> = {
                          approved: 'text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30',
                          pending: 'text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/30',
                          rejected: 'text-red-600 border-red-200 bg-red-50 dark:bg-red-950/30',
                          paid: 'text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/30',
                        }
                        return (
                          <div
                            key={a.push_id}
                            className="p-4 rounded-lg border border-border bg-background space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Bot className="w-4 h-4 text-muted-foreground" />
                                <Badge variant="outline" className={`text-[10px] capitalize ${statusColors[a.analysis_status] ?? ''}`}>
                                  {a.analysis_status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">by @{a.author}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <TrendingUp className="w-3 h-3" />
                                {Math.round(a.confidence * 100)}% confidence
                              </div>
                            </div>
                            {a.commits_summary && (
                              <p className="text-sm font-medium text-foreground">{a.commits_summary}</p>
                            )}
                            <p className="text-sm text-muted-foreground">{a.reasoning}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{a.total_commits} commit{a.total_commits !== 1 ? 's' : ''}</span>
                              <span>Payout: {(a.total_payout_amount ?? 0).toFixed(2)} USDC</span>
                              {a.flags.length > 0 && (
                                <span className="text-amber-600">
                                  Flags: {a.flags.join(', ')}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {new Date(a.created_at).toLocaleString()}
                            </div>
                          </div>
                        )
                      })}
                      {analyses.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">No agent analyses yet.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Streaming Status */}
          <Card className="bg-card border border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                Streaming Status
                {liveStatus === 'active' && (
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
                      {liveStatus === 'active' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                      )}
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 py-0.5 rounded text-[9px] font-mono text-muted-foreground border border-border">
                      {liveStatus === 'active' ? 'streaming' : liveStatus}
                    </div>
                  </div>
                  <div className="text-center">
                    <Avatar className="w-10 h-10 mx-auto mb-1">
                      <AvatarFallback className="text-xs bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-[10px] text-muted-foreground">@{project.freelance_alias}</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Streamed</p>
                  {liveStatus === 'active' ? (
                    <StreamingCounter
                      baseValue={liveStreamed}
                      ratePerSecond={liveRate}
                      suffix=" USDC"
                      decimals={6}
                      className="text-xl font-bold text-foreground"
                    />
                  ) : (
                    <span className="text-xl font-bold text-foreground font-mono">
                      {liveStreamed.toFixed(6)} USDC
                    </span>
                  )}
                </div>
              </div>
              {/* Streamed Amount Chart */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Streamed Over Time</p>
                <StreamedAmountChart
                  startTimestamp={startTimestamp}
                  ratePerSecond={liveRate}
                  currency="USDC"
                  paused={liveStatus !== 'active'}
                />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-medium font-mono">{liveRate.toFixed(10)} USDC/sec</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget Used</span>
                  <span className="font-medium">{budgetUsedPct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-medium font-mono">{(project.total_budget - liveStreamed).toFixed(4)} USDC</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
