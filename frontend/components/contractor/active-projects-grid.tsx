'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Pause, Play, Square, ExternalLink, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StatusBadge } from '@/components/status-badge'
import { StreamingCounter } from '@/components/streaming-counter'
import { formatEther } from 'viem'
import {
  getStoredProjects,
  queryStream,
  sendStreamAction,
  type StoredProject,
  type StreamState,
} from '@/lib/streaming'
import { useWallet } from '@/components/wallet-provider'

const POLL_INTERVAL = 15_000 // 15 seconds

interface ActiveProjectsGridProps {
  refreshKey?: number
}

export function ActiveProjectsGrid({ refreshKey }: ActiveProjectsGridProps) {
  const { walletId, userToken, executeChallenge } = useWallet()
  const [projects, setProjects] = useState<StoredProject[]>([])
  const [streamStates, setStreamStates] = useState<Record<string, StreamState>>({})
  // Tracks which project has an action in progress (projectId -> action name)
  const [actionInProgress, setActionInProgress] = useState<Record<string, string>>({})

  // Load projects from localStorage
  useEffect(() => {
    setProjects(getStoredProjects())
  }, [refreshKey])

  // Poll on-chain stream state for all active projects
  const pollStreams = useCallback(async () => {
    const stored = getStoredProjects()
    if (stored.length === 0) return

    const newStates: Record<string, StreamState> = {}
    await Promise.all(
      stored.map(async (p) => {
        const state = await queryStream(p.treasuryAddress, p.streamId)
        if (state) {
          newStates[p.id] = state
        }
      }),
    )
    setStreamStates((prev) => ({ ...prev, ...newStates }))
    // Update project statuses from on-chain data
    setProjects((prev) =>
      prev.map((p) => {
        const state = newStates[p.id]
        if (!state) return p
        if (state.paused && p.status === 'active') return { ...p, status: 'paused' as const }
        if (!state.paused && p.status === 'paused') return { ...p, status: 'active' as const }
        return p
      }),
    )
  }, [])

  useEffect(() => {
    pollStreams()
    const interval = setInterval(pollStreams, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [pollStreams, refreshKey])

  /**
   * Compute the current streamed value for a project.
   * Uses on-chain state when available: accrued + ratePerSecond * elapsed since lastTimestamp.
   * Returns a { baseValue, ratePerSecond } pair for StreamingCounter (in human-readable USDC).
   */
  function getStreamingValues(project: StoredProject) {
    const state = streamStates[project.id]

    if (state) {
      // On-chain values are in wei (18 decimals)
      const accruedWei = BigInt(state.accrued)
      const rateWei = BigInt(state.ratePerSecond)
      const elapsed = state.paused
        ? 0n
        : BigInt(Math.floor(Date.now() / 1000) - state.lastTimestamp)
      const totalWei = accruedWei + rateWei * elapsed
      const baseValue = parseFloat(formatEther(totalWei))
      const ratePerSecondHuman = parseFloat(formatEther(rateWei))
      return { baseValue, ratePerSecond: state.paused ? 0 : ratePerSecondHuman }
    }

    // Fallback before first on-chain poll (shows 0 briefly, then resyncs)
    const rateWei = BigInt(project.ratePerSecond)
    const ratePerSecondHuman = parseFloat(formatEther(rateWei))
    return { baseValue: 0, ratePerSecond: ratePerSecondHuman }
  }

  function getTaskCounts(project: StoredProject) {
    const spec = project.taskSpecification as {
      milestones?: { title: string; tasks: string[] }[]
    } | null
    const milestones = spec?.milestones ?? []
    const totalTasks = milestones.reduce((sum, m) => sum + m.tasks.length, 0)
    return { tasksCompleted: 0, totalTasks }
  }

  async function handleStreamAction(
    e: React.MouseEvent,
    project: StoredProject,
    action: 'pauseStream' | 'resumeStream' | 'stopStream',
  ) {
    e.preventDefault()
    e.stopPropagation()
    if (!walletId || !userToken) return

    setActionInProgress((prev) => ({ ...prev, [project.id]: action }))
    try {
      const challengeId = await sendStreamAction(
        action,
        project.streamId,
        project.treasuryAddress,
        walletId,
        userToken,
      )
      await executeChallenge(challengeId)

      // Poll for updated state after a short delay
      let retries = 0
      const maxRetries = 10
      while (retries < maxRetries) {
        await new Promise((r) => setTimeout(r, 5000))
        const state = await queryStream(project.treasuryAddress, project.streamId)
        if (state) {
          setStreamStates((prev) => ({ ...prev, [project.id]: state }))
          // Check if the on-chain state reflects the expected change
          const expectedPaused = action !== 'resumeStream'
          if (state.paused === expectedPaused) {
            setProjects((prev) =>
              prev.map((p) =>
                p.id === project.id
                  ? { ...p, status: state.paused ? 'paused' : 'active' }
                  : p,
              ),
            )
            break
          }
        }
        retries++
      }
    } catch (err) {
      console.error(`Stream ${action} failed:`, err)
    } finally {
      setActionInProgress((prev) => {
        const next = { ...prev }
        delete next[project.id]
        return next
      })
    }
  }

  if (projects.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Active Projects</h2>
        </div>
        <Card className="bg-card border border-dashed border-border shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              No active projects yet. Initiate a new contract to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Active Projects</h2>
        <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">
          View All
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((project) => {
          const { baseValue, ratePerSecond } = getStreamingValues(project)
          const { tasksCompleted, totalTasks } = getTaskCounts(project)
          const progress = totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0

          return (
            <Link key={project.id} href={`/contractor/projects/${project.id}`}>
              <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground leading-tight">
                      {project.name}
                    </CardTitle>
                    <StatusBadge
                      status={project.status === 'active' ? 'live' : project.status}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Freelancer */}
                  <div className="flex items-center gap-2">
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">
                        {project.freelancerInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground font-mono">
                      @{project.freelancerAlias}
                    </span>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">
                        {tasksCompleted}/{totalTasks} tasks
                      </span>
                      <span className="font-medium text-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>

                  {/* Streaming Payout */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Streamed</span>
                    {project.status === 'active' ? (
                      <StreamingCounter
                        baseValue={baseValue}
                        ratePerSecond={ratePerSecond}
                        suffix=" USDC"
                        decimals={6}
                        className="text-sm font-semibold text-emerald-600 dark:text-emerald-400"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-foreground">
                        {baseValue.toFixed(6)} USDC
                      </span>
                    )}
                  </div>

                  {/* Rate display — per-second from contract */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Rate</span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {ratePerSecond.toFixed(10)} USDC/s
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-1">
                    {project.status === 'active' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1 flex-1"
                          disabled={!!actionInProgress[project.id]}
                          onClick={(e) => handleStreamAction(e, project, 'pauseStream')}
                        >
                          {actionInProgress[project.id] === 'pauseStream' ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Pause className="w-3 h-3" />
                          )}
                          Pause
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                          disabled={!!actionInProgress[project.id]}
                          onClick={(e) => handleStreamAction(e, project, 'stopStream')}
                        >
                          {actionInProgress[project.id] === 'stopStream' ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Square className="w-3 h-3" />
                          )}
                          Stop
                        </Button>
                      </>
                    )}
                    {project.status === 'paused' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1 flex-1"
                          disabled={!!actionInProgress[project.id]}
                          onClick={(e) => handleStreamAction(e, project, 'resumeStream')}
                        >
                          {actionInProgress[project.id] === 'resumeStream' ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Play className="w-3 h-3" />
                          )}
                          Resume
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                          disabled={!!actionInProgress[project.id]}
                          onClick={(e) => handleStreamAction(e, project, 'stopStream')}
                        >
                          {actionInProgress[project.id] === 'stopStream' ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Square className="w-3 h-3" />
                          )}
                          Stop
                        </Button>
                      </>
                    )}
                    {project.status === 'completed' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs gap-1 flex-1 text-muted-foreground"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
                      >
                        <ExternalLink className="w-3 h-3" /> View Details
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
