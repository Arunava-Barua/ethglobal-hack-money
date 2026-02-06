'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  role: string
  status: 'active' | 'idle'
  avatar: string
}

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    role: 'Frontend Lead',
    status: 'active',
    avatar: '👨‍💻',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    role: 'Backend Dev',
    status: 'active',
    avatar: '👩‍💻',
  },
  {
    id: '3',
    name: 'Mike Brown',
    role: 'Designer',
    status: 'idle',
    avatar: '🎨',
  },
  {
    id: '4',
    name: 'Emma Davis',
    role: 'QA Engineer',
    status: 'active',
    avatar: '🧪',
  },
]

export function TeamMembersCard() {
  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Members
          </CardTitle>
          <Button size="icon" className="h-8 w-8 rounded-full bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-lg">
                {member.avatar}
              </div>
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                  member.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                }`}
              ></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">{member.name}</p>
              <p className="text-xs text-muted-foreground">{member.role}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

import { Users } from 'lucide-react'
