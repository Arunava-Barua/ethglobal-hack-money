'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star } from 'lucide-react'

interface Review {
  id: string
  client: string
  rating: number
  comment: string
  date: string
}

const reviews: Review[] = [
  {
    id: '1',
    client: 'John Doe',
    rating: 5,
    comment: 'Excellent work! Very professional and on time.',
    date: 'Aug 24, 2024',
  },
  {
    id: '2',
    client: 'Sarah Johnson',
    rating: 5,
    comment: 'Great communication and quality code.',
    date: 'Aug 18, 2024',
  },
]

export function ReviewsCard() {
  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Recent Reviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="p-3 border border-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-sm text-foreground">{review.client}</p>
              <div className="flex gap-1">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{review.comment}</p>
            <p className="text-xs text-muted-foreground">{review.date}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
