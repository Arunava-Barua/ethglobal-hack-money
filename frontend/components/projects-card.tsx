'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Project {
  id: string
  name: string
  subtitle: string
  percentage: number
  color: string
}

const projects: Project[] = [
  {
    id: '1',
    name: 'Dime',
    subtitle: 'Design + Development',
    percentage: 50,
    color: 'from-primary to-primary/80',
  },
  {
    id: '2',
    name: 'Dime 2.0',
    subtitle: 'Maintenance',
    percentage: 25,
    color: 'from-blue-200 to-blue-100',
  },
]

export function ProjectsCard() {
  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Current Projects</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
            More&gt;
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {projects.map((project) => (
          <div key={project.id} className={`bg-gradient-to-br ${project.color} rounded-xl p-4 text-white`}>
            <h4 className="font-bold text-sm mb-1">{project.name}</h4>
            <p className="text-xs opacity-90 mb-3">{project.subtitle}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">{project.percentage}%</span>
              <div className="w-16 h-1.5 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${project.percentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
