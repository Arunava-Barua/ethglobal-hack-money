'use client'

import { Card, CardContent } from '@/components/ui/card'

export function ProfileSection() {
  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardContent className="p-8 text-center">
        {/* Avatar */}
        <div className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-primary/20 flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-100 to-pink-200">
          <div className="text-4xl">👤</div>
        </div>

        {/* Name */}
        <h3 className="text-xl font-bold text-foreground mb-1">Samridhi</h3>
        <p className="text-sm text-muted-foreground mb-6">Frontend developer</p>

        {/* Stats */}
        <div className="space-y-3 text-left">
          <div className="flex justify-between py-2 border-b border-muted">
            <span className="text-sm text-muted-foreground">Total Earnings</span>
            <span className="font-semibold text-foreground">$12,500</span>
          </div>
          <div className="flex justify-between py-2 border-b border-muted">
            <span className="text-sm text-muted-foreground">Projects Done</span>
            <span className="font-semibold text-foreground">24</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-muted-foreground">Completion Rate</span>
            <span className="font-semibold text-foreground">98%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
