'use client'

interface Contractor {
  name: string
  contracts: number
  rating: number
  revenue: number
}

const data: Contractor[] = [
  { name: 'Alex Johnson', contracts: 45, rating: 4.9, revenue: 125000 },
  { name: 'Sarah Chen', contracts: 38, rating: 4.8, revenue: 98000 },
  { name: 'Mike Brown', contracts: 32, rating: 4.7, revenue: 85000 },
  { name: 'Emma Davis', contracts: 28, rating: 4.9, revenue: 72000 },
  { name: 'John Smith', contracts: 24, rating: 4.6, revenue: 64000 },
]

export function TopContractorsChart() {
  return (
    <div className="space-y-3">
      {data.map((contractor, index) => (
        <div key={contractor.name} className="p-4 border border-muted rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-primary">#{index + 1}</span>
              <div>
                <p className="font-semibold text-foreground">{contractor.name}</p>
                <p className="text-sm text-muted-foreground">{contractor.contracts} contracts completed</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-foreground">{contractor.rating}/5.0</p>
              <p className="text-sm text-muted-foreground">${(contractor.revenue / 1000).toFixed(0)}K earned</p>
            </div>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent"
              style={{ width: `${(contractor.contracts / 50) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  )
}
