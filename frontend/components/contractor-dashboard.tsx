'use client'

import { Calendar, Plus, MoreHorizontal, Users, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ActiveContractsChart } from './active-contracts-chart'
import { SpendingChart } from './spending-chart'
import { TeamMembersCard } from './team-members-card'
import { JobPostingsCard } from './job-postings-card'

export function ContractorDashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Projects Overview</h1>
          <p className="text-muted-foreground">Manage your active contracts and team</p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          <span>Post New Job</span>
        </Button>
      </div>

      {/* Date Picker */}
      <div className="flex justify-end mb-8">
        <Button variant="outline" className="gap-2 bg-transparent">
          <Calendar className="w-4 h-4" />
          <span>30 August 2024</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Active Contracts</p>
                <p className="text-3xl font-bold text-foreground">12</p>
              </div>
              <CheckCircle className="w-12 h-12 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Pending Proposals</p>
                <p className="text-3xl font-bold text-foreground">8</p>
              </div>
              <Clock className="w-12 h-12 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Total Budget Spent</p>
                <p className="text-3xl font-bold text-foreground">$45.2K</p>
              </div>
              <span className="text-2xl">💰</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Contracts */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">Active Contracts Timeline</CardTitle>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ActiveContractsChart />
            </CardContent>
          </Card>

          {/* Spending Chart */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Budget Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <SpendingChart />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Team Members */}
          <TeamMembersCard />

          {/* Recent Job Postings */}
          <JobPostingsCard />
        </div>
      </div>
    </div>
  )
}
