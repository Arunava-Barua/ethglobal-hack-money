'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, Pause, Play, X } from 'lucide-react'

interface StreamingPayment {
  id: string
  recipient: string
  amount: number
  rate: string
  status: 'active' | 'paused' | 'ended'
  startDate: string
  endDate: string
  totalStreamed: number
}

const streamingPayments: StreamingPayment[] = [
  {
    id: '1',
    recipient: 'Alex Johnson',
    amount: 0.3,
    rate: '0.01 ETH/day',
    status: 'active',
    startDate: 'Aug 1, 2024',
    endDate: 'Aug 31, 2024',
    totalStreamed: 0.24,
  },
  {
    id: '2',
    recipient: 'Sarah Chen',
    amount: 0.25,
    rate: '0.008 ETH/day',
    status: 'active',
    startDate: 'Aug 5, 2024',
    endDate: 'Sep 5, 2024',
    totalStreamed: 0.16,
  },
  {
    id: '3',
    recipient: 'Mike Brown',
    amount: 0.2,
    rate: '0.005 ETH/day',
    status: 'paused',
    startDate: 'Jul 15, 2024',
    endDate: 'Aug 15, 2024',
    totalStreamed: 0.18,
  },
]

const statusColors = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  ended: 'bg-gray-100 text-gray-800',
}

export function StreamingPaymentsCard() {
  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            Active Money Streams
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {streamingPayments.map((stream) => (
          <div key={stream.id} className="p-4 border border-muted rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="font-semibold text-foreground mb-1">{stream.recipient}</p>
                <p className="text-sm text-muted-foreground">{stream.rate}</p>
              </div>
              <Badge className={statusColors[stream.status]}>
                {stream.status.charAt(0).toUpperCase() + stream.status.slice(1)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
              <div>
                <p className="text-muted-foreground">Total Amount</p>
                <p className="font-semibold text-foreground">{stream.amount} ETH</p>
              </div>
              <div>
                <p className="text-muted-foreground">Streamed</p>
                <p className="font-semibold text-foreground">{stream.totalStreamed} ETH</p>
              </div>
            </div>

            <div className="mb-3">
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  style={{ width: `${(stream.totalStreamed / stream.amount) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex gap-2">
              {stream.status === 'active' ? (
                <>
                  <Button size="sm" variant="outline" className="flex-1 gap-1 bg-transparent">
                    <Pause className="w-4 h-4" />
                    Pause
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-1 bg-transparent">
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button size="sm" className="w-full gap-1 bg-primary hover:bg-primary/90">
                  <Play className="w-4 h-4" />
                  Resume
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
