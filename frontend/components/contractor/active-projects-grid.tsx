'use client'

import { Pause, Play, Square, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StatusBadge } from '@/components/status-badge'
import { StreamingCounter } from '@/components/streaming-counter'

interface Project {
  id: string
  name: string
  freelancerAlias: string
  freelancerInitials: string
  status: 'active' | 'paused' | 'pending' | 'completed'
  progress: number
  tasksCompleted: number
  totalTasks: number
  streamRate: number
  streamedTotal: number
}

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'DeFi Dashboard Frontend',
    freelancerAlias: 'alex_dev',
    freelancerInitials: 'AD',
    status: 'active',
    progress: 65,
    tasksCompleted: 13,
    totalTasks: 20,
    streamRate: 0.0002,
    streamedTotal: 2.45,
  },
  {
    id: '2',
    name: 'Smart Contract Audit',
    freelancerAlias: 'sarah_sec',
    freelancerInitials: 'SC',
    status: 'active',
    progress: 40,
    tasksCompleted: 4,
    totalTasks: 10,
    streamRate: 0.0003,
    streamedTotal: 1.89,
  },
  {
    id: '3',
    name: 'NFT Marketplace API',
    freelancerAlias: 'mike_api',
    freelancerInitials: 'MB',
    status: 'paused',
    progress: 80,
    tasksCompleted: 8,
    totalTasks: 10,
    streamRate: 0,
    streamedTotal: 3.12,
  },
  {
    id: '4',
    name: 'Token Bridge Integration',
    freelancerAlias: 'emma_web3',
    freelancerInitials: 'EW',
    status: 'pending',
    progress: 0,
    tasksCompleted: 0,
    totalTasks: 15,
    streamRate: 0,
    streamedTotal: 0,
  },
  {
    id: '5',
    name: 'Governance Portal UI',
    freelancerAlias: 'raj_ui',
    freelancerInitials: 'RU',
    status: 'active',
    progress: 25,
    tasksCompleted: 5,
    totalTasks: 20,
    streamRate: 0.00015,
    streamedTotal: 0.78,
  },
  {
    id: '6',
    name: 'Analytics Microservice',
    freelancerAlias: 'chen_dev',
    freelancerInitials: 'CD',
    status: 'completed',
    progress: 100,
    tasksCompleted: 12,
    totalTasks: 12,
    streamRate: 0,
    streamedTotal: 4.5,
  },
]

export function ActiveProjectsGrid() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Active Projects</h2>
        <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">
          View All
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockProjects.map((project) => (
          <Card
            key={project.id}
            className="bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200 group"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-semibold text-foreground leading-tight">
                  {project.name}
                </CardTitle>
                <StatusBadge status={project.status === 'active' ? 'live' : project.status} />
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
                <span className="text-sm text-muted-foreground font-mono">@{project.freelancerAlias}</span>
              </div>

              {/* Progress */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">
                    {project.tasksCompleted}/{project.totalTasks} tasks
                  </span>
                  <span className="font-medium text-foreground">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-1.5" />
              </div>

              {/* Streaming Payout */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Streamed</span>
                {project.status === 'active' ? (
                  <StreamingCounter
                    baseValue={project.streamedTotal}
                    ratePerSecond={project.streamRate}
                    suffix=" ETH"
                    decimals={4}
                    className="text-sm font-semibold text-emerald-600 dark:text-emerald-400"
                  />
                ) : (
                  <span className="text-sm font-semibold text-foreground">
                    {project.streamedTotal.toFixed(4)} ETH
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 pt-1">
                {project.status === 'active' && (
                  <>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1 flex-1">
                      <Pause className="w-3 h-3" /> Pause
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-destructive hover:text-destructive">
                      <Square className="w-3 h-3" /> Stop
                    </Button>
                  </>
                )}
                {project.status === 'paused' && (
                  <>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1 flex-1">
                      <Play className="w-3 h-3" /> Resume
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-destructive hover:text-destructive">
                      <Square className="w-3 h-3" /> Stop
                    </Button>
                  </>
                )}
                {project.status === 'pending' && (
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1 flex-1">
                    <Play className="w-3 h-3" /> Start
                  </Button>
                )}
                {project.status === 'completed' && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 flex-1 text-muted-foreground">
                    <ExternalLink className="w-3 h-3" /> View Details
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
