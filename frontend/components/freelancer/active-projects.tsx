'use client'

import Link from 'next/link'
import { FileText, Github, Video, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/status-badge'
import { StreamingCounter } from '@/components/streaming-counter'

interface ActiveProject {
  id: string
  name: string
  contractor: string
  status: 'live' | 'paused' | 'pending'
  currentEarnings: number
  streamRate: number
  hasPdf: boolean
  hasGithub: boolean
  hasMeet: boolean
}

const mockProjects: ActiveProject[] = [
  {
    id: '1',
    name: 'DeFi Dashboard Frontend',
    contractor: 'TechStart Inc',
    status: 'live',
    currentEarnings: 2.45,
    streamRate: 0.0002,
    hasPdf: true,
    hasGithub: true,
    hasMeet: true,
  },
  {
    id: '2',
    name: 'Smart Contract Audit',
    contractor: 'CryptoSafe DAO',
    status: 'live',
    currentEarnings: 1.89,
    streamRate: 0.0003,
    hasPdf: true,
    hasGithub: true,
    hasMeet: false,
  },
  {
    id: '3',
    name: 'Governance Portal UI',
    contractor: 'DeFi Labs',
    status: 'live',
    currentEarnings: 0.78,
    streamRate: 0.00015,
    hasPdf: true,
    hasGithub: true,
    hasMeet: true,
  },
  {
    id: '4',
    name: 'NFT Marketplace API',
    contractor: 'Web3 Studio',
    status: 'paused',
    currentEarnings: 3.12,
    streamRate: 0,
    hasPdf: true,
    hasGithub: true,
    hasMeet: false,
  },
  {
    id: '5',
    name: 'Token Bridge Integration',
    contractor: 'Bridge Protocol',
    status: 'pending',
    currentEarnings: 0,
    streamRate: 0,
    hasPdf: true,
    hasGithub: false,
    hasMeet: true,
  },
]

export function FreelancerActiveProjects() {
  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Active Projects</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockProjects.map((project) => (
            <Link key={project.id} href={`/freelancer/projects/${project.id}`}>
            <div
              className="mt-2 p-4 rounded-lg border border-border bg-background hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-sm text-foreground">{project.name}</p>
                  <p className="text-xs text-muted-foreground">{project.contractor}</p>
                </div>
                <StatusBadge status={project.status} />
              </div>

              <div className="flex items-center justify-between">
                {/* Earnings */}
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Current Earnings</p>
                  {project.status === 'live' ? (
                    <StreamingCounter
                      baseValue={project.currentEarnings}
                      ratePerSecond={project.streamRate}
                      suffix=" ETH"
                      decimals={5}
                      className="text-lg font-bold text-emerald-600 dark:text-emerald-400"
                    />
                  ) : (
                    <span className="text-lg font-bold text-foreground">
                      {project.currentEarnings.toFixed(4)} ETH
                    </span>
                  )}
                </div>

                {/* Access Links */}
                <div className="flex items-center gap-1.5">
                  {project.hasPdf && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <FileText className="w-4 h-4" />
                    </Button>
                  )}
                  {project.hasGithub && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Github className="w-4 h-4" />
                    </Button>
                  )}
                  {project.hasMeet && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <Video className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
