'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Project {
  id: string
  name: string
  client: string
  progress: number
  deadline: string
  status: 'on-track' | 'at-risk' | 'completed'
}

const projects: Project[] = [
  {
    id: '1',
    name: 'E-Commerce Platform',
    client: 'StartupXYZ',
    progress: 75,
    deadline: 'Aug 30, 2024',
    status: 'on-track',
  },
  {
    id: '2',
    name: 'Dashboard Redesign',
    client: 'TechCorp',
    progress: 45,
    deadline: 'Sep 15, 2024',
    status: 'on-track',
  },
  {
    id: '3',
    name: 'Mobile App UI',
    client: 'Creative Studio',
    progress: 100,
    deadline: 'Aug 25, 2024',
    status: 'completed',
  },
]

const statusColors = {
  'on-track': 'bg-green-100 text-green-800',
  'at-risk': 'bg-orange-100 text-orange-800',
  'completed': 'bg-gray-100 text-gray-800',
}

const statusLabels = {
  'on-track': 'On Track',
  'at-risk': 'At Risk',
  'completed': 'Completed',
}

export function OngoingProjectsCard() {
  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Active Projects</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {projects.map((project) => (
          <div key={project.id} className="p-3 border border-muted rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-sm text-foreground">{project.name}</p>
                <p className="text-xs text-muted-foreground">{project.client}</p>
              </div>
              <Badge className={statusColors[project.status]}>
                {statusLabels[project.status]}
              </Badge>
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold text-foreground">{project.progress}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Due: {project.deadline}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
