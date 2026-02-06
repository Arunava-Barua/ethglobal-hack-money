'use client'

import { FileText, Upload, Download, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/empty-state'

const documents = [
  { id: '1', name: 'defi_dashboard_specs.pdf', project: 'DeFi Dashboard Frontend', uploadedAt: 'Jan 15, 2026', size: '2.4 MB' },
  { id: '2', name: 'audit_requirements.pdf', project: 'Smart Contract Audit', uploadedAt: 'Jan 20, 2026', size: '1.8 MB' },
  { id: '3', name: 'nft_api_scope.pdf', project: 'NFT Marketplace API', uploadedAt: 'Dec 1, 2025', size: '3.1 MB' },
  { id: '4', name: 'governance_wireframes.pdf', project: 'Governance Portal UI', uploadedAt: 'Feb 1, 2026', size: '5.2 MB' },
]

export default function DocumentsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Documents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Task specifications and contract documents</p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Upload className="w-4 h-4" /> Upload Document
        </Button>
      </div>

      <div className="space-y-3">
        {documents.map((doc) => (
          <Card key={doc.id} className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">{doc.project} &middot; {doc.uploadedAt} &middot; {doc.size}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
