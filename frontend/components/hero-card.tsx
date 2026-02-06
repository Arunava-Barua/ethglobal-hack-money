'use client'

import { Card, CardContent } from '@/components/ui/card'

export function HeroCard() {
  return (
    <Card className="bg-gradient-to-br from-primary to-primary/80 border-0 shadow-lg overflow-hidden">
      <CardContent className="p-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-4">Hello Samridhi !</h2>
            <p className="text-white/90 leading-relaxed">
              You have 2 projects to finish and already completed 50 % from your monthly target. Keep going to your goal!
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {/* Avatar Circle */}
              <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-4 border-white/30">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-pink-300 to-pink-400 flex items-center justify-center text-3xl">
                  👤
                </div>
              </div>
              {/* Laptop */}
              <div className="absolute bottom-4 right-0 w-20 h-12 bg-white/30 rounded-lg flex items-center justify-center transform -rotate-12">
                <div className="w-16 h-8 bg-white/50 rounded-sm flex items-center justify-center text-xs font-semibold text-primary">
                  💻
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative plants/details */}
        <div className="absolute bottom-0 left-8 w-16 h-16 opacity-20">
          <div className="text-4xl">🌿</div>
        </div>
        <div className="absolute bottom-0 right-12 w-8 h-8 opacity-30">
          <div className="text-2xl">🍎</div>
        </div>
      </CardContent>
    </Card>
  )
}
