'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'

interface Client {
  id: string
  name: string
  projectName: string
  avatar: string
}

const clients: Client[] = [
  {
    id: '1',
    name: 'James kirk',
    projectName: 'Project name',
    avatar: '👨',
  },
  {
    id: '2',
    name: 'Tyler minas',
    projectName: 'Project name',
    avatar: '👨',
  },
  {
    id: '3',
    name: 'Nicholas',
    projectName: 'Project name',
    avatar: '👨',
  },
]

export function ClientsList() {
  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Last Clients</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
            More&gt;
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {clients.map((client) => (
          <div key={client.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center text-lg border-2 border-primary/10">
                {client.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{client.name}</p>
                <p className="text-xs text-muted-foreground">{client.projectName}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
