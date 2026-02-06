'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'

interface Transaction {
  id: string
  type: 'sent' | 'received'
  description: string
  amount: number
  date: string
  hash: string
}

const transactions: Transaction[] = [
  {
    id: '1',
    type: 'received',
    description: 'Payment for Frontend Project',
    amount: 2.5,
    date: 'Aug 24, 2024',
    hash: '0x7f3c...a9d2',
  },
  {
    id: '2',
    type: 'sent',
    description: 'Contractor Payment',
    amount: 1.2,
    date: 'Aug 23, 2024',
    hash: '0x2a1b...c4e5',
  },
  {
    id: '3',
    type: 'received',
    description: 'Contract Completion Bonus',
    amount: 0.8,
    date: 'Aug 22, 2024',
    hash: '0x9e4d...f8b1',
  },
  {
    id: '4',
    type: 'sent',
    description: 'Withdrawal to Coinbase',
    amount: 0.5,
    date: 'Aug 21, 2024',
    hash: '0x3c7a...d2e9',
  },
]

export function WalletTransactionsCard() {
  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between p-3 border border-muted rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3 flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.type === 'received'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-blue-100 text-blue-600'
                }`}
              >
                {tx.type === 'received' ? (
                  <ArrowDownLeft className="w-5 h-5" />
                ) : (
                  <ArrowUpRight className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{tx.description}</p>
                <p className="text-xs text-muted-foreground">{tx.date}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold text-sm ${tx.type === 'received' ? 'text-green-600' : 'text-foreground'}`}>
                {tx.type === 'received' ? '+' : '-'}{tx.amount} ETH
              </p>
              <p className="text-xs text-muted-foreground">{tx.hash}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
