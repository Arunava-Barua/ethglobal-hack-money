'use client'

import { Calendar, Briefcase, TrendingUp, Star, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OpportunitiesCard } from './opportunities-card'
import { FreelancerEarningsChart } from './freelancer-earnings-chart'
import { SkillsCard } from './skills-card'
import { OngoingProjectsCard } from './ongoing-projects-card'
import { ReviewsCard } from './reviews-card'

export function FreelancerDashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">My Opportunities</h1>
          <p className="text-muted-foreground">Track your projects and earnings</p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-primary/90">
          <Briefcase className="w-4 h-4" />
          <span>Find Jobs</span>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Active Projects</p>
                <p className="text-3xl font-bold text-foreground">5</p>
              </div>
              <Briefcase className="w-12 h-12 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">This Month Earned</p>
                <p className="text-3xl font-bold text-foreground">$8.5K</p>
              </div>
              <TrendingUp className="w-12 h-12 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Rating</p>
                <p className="text-3xl font-bold text-foreground">4.9</p>
              </div>
              <Star className="w-12 h-12 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Job Applications</p>
                <p className="text-3xl font-bold text-foreground">23</p>
              </div>
              <span className="text-2xl">📋</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Earnings Chart */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Monthly Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <FreelancerEarningsChart />
            </CardContent>
          </Card>

          {/* Opportunities */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold">Recommended Opportunities</CardTitle>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <OpportunitiesCard />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Skills */}
          <SkillsCard />

          {/* Ongoing Projects */}
          <OngoingProjectsCard />

          {/* Reviews */}
          <ReviewsCard />
        </div>
      </div>
    </div>
  )
}
