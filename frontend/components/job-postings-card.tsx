'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface JobPosting {
  id: string
  title: string
  applications: number
  budget: string
  status: 'open' | 'in-progress' | 'closed'
}

const jobPostings: JobPosting[] = [
  {
    id: '1',
    title: 'React Developer',
    applications: 12,
    budget: '$5K - $8K',
    status: 'open',
  },
  {
    id: '2',
    title: 'UI/UX Designer',
    applications: 8,
    budget: '$3K - $5K',
    status: 'in-progress',
  },
  {
    id: '3',
    title: 'Backend Engineer',
    applications: 0,
    budget: '$8K - $12K',
    status: 'closed',
  },
]

const statusColors: Record<string, string> = {
  open: 'bg-green-100 text-green-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  closed: 'bg-gray-100 text-gray-800',
}

export function JobPostingsCard() {
  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Recent Job Postings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {jobPostings.map((job) => (
          <div key={job.id} className="p-3 border border-muted rounded-lg hover:bg-muted/30 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-sm text-foreground">{job.title}</h4>
              <Badge className={statusColors[job.status]}>
                {job.status === 'in-progress' ? 'In Progress' : job.status === 'open' ? 'Open' : 'Closed'}
              </Badge>
            </div>
            <div className="space-y-1 text-xs text-muted-foreground mb-2">
              <p>Budget: {job.budget}</p>
              <p>Applications: {job.applications}</p>
            </div>
            <Button variant="outline" size="sm" className="w-full text-primary border-primary hover:bg-primary/10 bg-transparent">
              View Details
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
