'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface Skill {
  name: string
  level: 'Expert' | 'Intermediate' | 'Beginner'
  endorsements: number
}

const skills: Skill[] = [
  {
    name: 'React.js',
    level: 'Expert',
    endorsements: 45,
  },
  {
    name: 'TypeScript',
    level: 'Expert',
    endorsements: 32,
  },
  {
    name: 'Next.js',
    level: 'Expert',
    endorsements: 28,
  },
  {
    name: 'Tailwind CSS',
    level: 'Intermediate',
    endorsements: 18,
  },
  {
    name: 'Node.js',
    level: 'Intermediate',
    endorsements: 15,
  },
]

const levelColors = {
  Expert: 'bg-green-100 text-green-800',
  Intermediate: 'bg-blue-100 text-blue-800',
  Beginner: 'bg-yellow-100 text-yellow-800',
}

export function SkillsCard() {
  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Skills & Expertise</CardTitle>
          <Button size="icon" className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {skills.map((skill) => (
          <div key={skill.name} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded transition-colors">
            <div className="flex-1">
              <p className="font-semibold text-sm text-foreground">{skill.name}</p>
              <p className="text-xs text-muted-foreground">{skill.endorsements} endorsements</p>
            </div>
            <Badge className={levelColors[skill.level]} variant="outline">
              {skill.level}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
