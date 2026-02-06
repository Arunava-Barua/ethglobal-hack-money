'use client'

import { Calendar, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HeroCard } from './hero-card'
import { IncomeChart } from './income-chart'
import { ProfileSection } from './profile-section'
import { ProjectsCard } from './projects-card'
import { InquiriesChart } from './inquiries-chart'
import { TasksChart } from './tasks-chart'
import { ClientsList } from './clients-list'

export function Dashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Calendar className="w-4 h-4" />
          <span>30 August 2024</span>
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Card */}
          <HeroCard />

          {/* Income Chart */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-foreground">Income</CardTitle>
                <div className="flex gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    <span className="text-muted-foreground">This month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-accent"></span>
                    <span className="text-muted-foreground">Previous month</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <IncomeChart />
            </CardContent>
          </Card>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Top Inquiries */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold">Top inquiries</CardTitle>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <InquiriesChart />
              </CardContent>
            </Card>

            {/* Tasks */}
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <TasksChart />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Profile & Projects */}
        <div className="space-y-8">
          {/* Profile */}
          <ProfileSection />

          {/* Projects */}
          <ProjectsCard />

          {/* Clients */}
          <ClientsList />
        </div>
      </div>
    </div>
  )
}
