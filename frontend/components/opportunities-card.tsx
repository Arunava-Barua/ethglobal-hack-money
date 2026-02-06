'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, DollarSign } from 'lucide-react'

interface Opportunity {
  id: string
  title: string
  company: string
  budget: string
  type: string
  location: string
  match: number
}

const opportunities: Opportunity[] = [
  {
    id: '1',
    title: 'Build React Dashboard',
    company: 'TechStart Inc',
    budget: '$2,500 - $4,000',
    type: 'Full-time',
    location: 'Remote',
    match: 95,
  },
  {
    id: '2',
    title: 'Mobile App UI Design',
    company: 'Creative Studio',
    budget: '$1,500 - $2,500',
    type: 'Contract',
    location: 'Remote',
    match: 88,
  },
  {
    id: '3',
    title: 'Backend API Development',
    company: 'Web Solutions LLC',
    budget: '$3,000 - $5,000',
    type: 'Part-time',
    location: 'Remote',
    match: 82,
  },
]

export function OpportunitiesCard() {
  return (
    <div className="space-y-3">
      {opportunities.map((opp) => (
        <div
          key={opp.id}
          className="p-4 border border-muted rounded-lg hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">{opp.title}</h4>
              <p className="text-sm text-muted-foreground">{opp.company}</p>
            </div>
            <Badge className="bg-primary/10 text-primary">{opp.match}% Match</Badge>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="w-4 h-4" />
              <span>{opp.budget}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{opp.location}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Badge variant="outline">{opp.type}</Badge>
            <Button size="sm" className="ml-auto bg-primary hover:bg-primary/90">
              Apply Now
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
