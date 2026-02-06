'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, FileText, Download, MessageSquare } from 'lucide-react'

interface ContractDetailsProps {
  contract: {
    id: string
    title: string
    client: string
    contractor: string
    value: number
    status: string
    startDate: string
    endDate: string
    milestone: number
    description: string
  }
}

export function ContractDetails({ contract }: ContractDetailsProps) {
  return (
    <Card className="bg-white border-0 shadow-sm sticky top-8">
      <CardHeader className="border-b border-muted">
        <CardTitle className="text-lg font-bold">Contract Details</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Status */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Status</p>
          <Badge
            className={`${
              contract.status === 'active'
                ? 'bg-green-100 text-green-800'
                : contract.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : contract.status === 'completed'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
            }`}
          >
            {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
          </Badge>
        </div>

        {/* Parties */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Client</p>
          <p className="font-semibold text-foreground">{contract.client}</p>
          <p className="text-sm text-muted-foreground mb-3">Contractor</p>
          <p className="font-semibold text-foreground">{contract.contractor}</p>
        </div>

        {/* Value */}
        <div className="p-4 bg-primary/10 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Contract Value</p>
          <p className="text-2xl font-bold text-primary">${contract.value.toLocaleString()}</p>
        </div>

        {/* Timeline */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Timeline</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start Date:</span>
              <span className="font-semibold text-foreground">{contract.startDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">End Date:</span>
              <span className="font-semibold text-foreground">{contract.endDate}</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between mb-2">
            <p className="text-sm text-muted-foreground">Progress</p>
            <span className="font-semibold text-foreground">{contract.milestone}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent"
              style={{ width: `${contract.milestone}%` }}
            ></div>
          </div>
        </div>

        {/* Description */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Description</p>
          <p className="text-sm text-foreground leading-relaxed">{contract.description}</p>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-4 border-t border-muted">
          <Button className="w-full gap-2 bg-primary hover:bg-primary/90">
            <FileText className="w-4 h-4" />
            View Full Contract
          </Button>
          <Button variant="outline" className="w-full gap-2 bg-transparent">
            <MessageSquare className="w-4 h-4" />
            Message Party
          </Button>
          <Button variant="outline" className="w-full gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>

        {contract.status === 'disputed' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-red-800">Dispute in Progress</p>
              <p className="text-xs text-red-700 mt-1">Contact support for more information</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
