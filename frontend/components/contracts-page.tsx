'use client'

import { useState } from 'react'
import { Search, Download, Filter, MoreHorizontal, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ContractDetails } from './contract-details'

interface Contract {
  id: string
  title: string
  client: string
  contractor: string
  value: number
  status: 'active' | 'pending' | 'completed' | 'disputed'
  startDate: string
  endDate: string
  milestone: number
  description: string
}

const contracts: Contract[] = [
  {
    id: '1',
    title: 'Frontend Development Project',
    client: 'TechStart Inc',
    contractor: 'Alex Johnson',
    value: 5000,
    status: 'active',
    startDate: 'Aug 1, 2024',
    endDate: 'Aug 31, 2024',
    milestone: 60,
    description: 'Build responsive landing page with React and Tailwind CSS',
  },
  {
    id: '2',
    title: 'UI/UX Design',
    client: 'Creative Studio',
    contractor: 'Sarah Chen',
    value: 3000,
    status: 'active',
    startDate: 'Aug 5, 2024',
    endDate: 'Sep 5, 2024',
    milestone: 40,
    description: 'Design mobile app interface and user flows',
  },
  {
    id: '3',
    title: 'Backend API Development',
    client: 'Web Solutions LLC',
    contractor: 'Mike Brown',
    value: 6000,
    status: 'pending',
    startDate: 'Aug 15, 2024',
    endDate: 'Sep 30, 2024',
    milestone: 0,
    description: 'Build REST API with Node.js and PostgreSQL',
  },
  {
    id: '4',
    title: 'Data Analysis Dashboard',
    client: 'Analytics Pro',
    contractor: 'Emma Davis',
    value: 4500,
    status: 'completed',
    startDate: 'Jul 1, 2024',
    endDate: 'Aug 10, 2024',
    milestone: 100,
    description: 'Create interactive analytics dashboard',
  },
]

const statusColors = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  disputed: 'bg-red-100 text-red-800',
}

const statusLabels = {
  active: 'Active',
  pending: 'Pending',
  completed: 'Completed',
  disputed: 'Disputed',
}

export function ContractsPage() {
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredContracts = contracts.filter(
    (contract) =>
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.contractor.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Contract Management</h1>
          <p className="text-muted-foreground">Track and manage all your contracts</p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          <span>New Contract</span>
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Contract List */}
        <div className="lg:col-span-2">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-foreground placeholder-muted-foreground"
                />
                <Button variant="ghost" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredContracts.map((contract) => (
                  <div
                    key={contract.id}
                    onClick={() => setSelectedContract(contract)}
                    className={`p-4 border border-muted rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedContract?.id === contract.id ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{contract.title}</h4>
                        <p className="text-sm text-muted-foreground">{contract.client}</p>
                      </div>
                      <Badge className={statusColors[contract.status]}>
                        {statusLabels[contract.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Contract with {contract.contractor}</span>
                      <span className="font-semibold text-foreground">${contract.value.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Contract Details */}
        <div>
          {selectedContract ? (
            <ContractDetails contract={selectedContract} />
          ) : (
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Select a contract to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
