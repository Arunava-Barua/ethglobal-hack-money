'use client'

import { Search, Filter, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StatusBadge } from '@/components/status-badge'

const freelancers = [
  { id: '1', alias: 'alex_dev', initials: 'AD', role: 'Frontend Developer', activeProjects: 2, totalEarned: '7.5 ETH', status: 'active' as const, rating: 4.9 },
  { id: '2', alias: 'sarah_sec', initials: 'SC', role: 'Security Auditor', activeProjects: 1, totalEarned: '4.2 ETH', status: 'active' as const, rating: 5.0 },
  { id: '3', alias: 'mike_api', initials: 'MB', role: 'Backend Developer', activeProjects: 1, totalEarned: '6.8 ETH', status: 'paused' as const, rating: 4.7 },
  { id: '4', alias: 'emma_web3', initials: 'EW', role: 'Smart Contract Dev', activeProjects: 0, totalEarned: '0 ETH', status: 'pending' as const, rating: 4.8 },
  { id: '5', alias: 'raj_ui', initials: 'RU', role: 'UI/UX Designer', activeProjects: 1, totalEarned: '2.1 ETH', status: 'active' as const, rating: 4.6 },
  { id: '6', alias: 'chen_dev', initials: 'CD', role: 'Full Stack Developer', activeProjects: 0, totalEarned: '4.5 ETH', status: 'completed' as const, rating: 4.9 },
]

export default function FreelancersPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Freelancers</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your team of freelancers and their status</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search freelancers..." className="pl-10" />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {freelancers.map((f) => (
          <Card key={f.id} className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-11 h-11">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                      {f.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground text-sm">@{f.alias}</p>
                    <p className="text-xs text-muted-foreground">{f.role}</p>
                  </div>
                </div>
                <StatusBadge status={f.status} />
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold text-foreground">{f.activeProjects}</p>
                  <p className="text-[10px] text-muted-foreground">Active</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{f.totalEarned}</p>
                  <p className="text-[10px] text-muted-foreground">Earned</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{f.rating}</p>
                  <p className="text-[10px] text-muted-foreground">Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
