export interface Milestone {
  id: string
  title: string
  status: 'completed' | 'in-progress' | 'pending'
  dueDate: string
  completedDate?: string
  approvedBy: 'agent' | 'contractor' | null
}

export interface AgenticApproval {
  id: string
  milestoneId: string
  milestoneTitle: string
  verdict: 'approved' | 'rejected' | 'needs-revision'
  reason: string
  timestamp: string
  confidence: number
}

export interface AgenticComment {
  id: string
  milestoneId?: string
  comment: string
  category: 'code-quality' | 'progress' | 'suggestion' | 'risk'
  timestamp: string
}

export interface ActivityEvent {
  id: string
  event: string
  timestamp: string
  type: 'info' | 'success' | 'warning' | 'error'
}

export interface ProjectDetail {
  id: string
  name: string
  description: string
  freelancerAlias: string
  freelancerInitials: string
  freelancerWallet: string
  contractorName: string
  contractorInitials: string
  status: 'active' | 'paused' | 'pending' | 'completed'
  mode: 'agentic' | 'manual'
  budget: number
  currency: string
  streamed: number
  streamRate: number
  progress: number
  tasksCompleted: number
  totalTasks: number
  startDate: string
  endDate: string
  githubUrl: string
  meetLink: string
  startTimestamp: number
  treasuryAddress: string | null
  streamId: number | null
  pdfName: string
  milestones: Milestone[]
  agenticApprovals: AgenticApproval[]
  agenticComments: AgenticComment[]
  activityLog: ActivityEvent[]
}

export const mockProjectDetails: Record<string, ProjectDetail> = {
  '1': {
    id: '1',
    name: 'DeFi Dashboard Frontend',
    description:
      'Build a comprehensive DeFi dashboard with wallet integration, token swap interface, portfolio analytics, and real-time price feeds. The UI should be responsive and support dark/light themes.',
    freelancerAlias: 'alex_dev',
    freelancerInitials: 'AD',
    freelancerWallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f2e8aF',
    contractorName: 'TechStart Inc',
    contractorInitials: 'TS',
    status: 'active',
    mode: 'agentic',
    budget: 5.0,
    currency: 'ETH',
    streamed: 2.45,
    streamRate: 0.0002,
    progress: 65,
    tasksCompleted: 13,
    totalTasks: 20,
    startDate: 'Jan 15, 2026',
    endDate: 'Mar 15, 2026',
    startTimestamp: Math.floor(new Date('Jan 15, 2026').getTime() / 1000),
    treasuryAddress: null,
    streamId: null,
    githubUrl: 'https://github.com/example/defi-dashboard',
    meetLink: 'https://meet.google.com/abc-defg-hij',
    pdfName: 'defi_dashboard_specs.pdf',
    milestones: [
      { id: 'm1', title: 'Project Setup & Architecture', status: 'completed', dueDate: 'Jan 20', completedDate: 'Jan 19', approvedBy: 'agent' },
      { id: 'm2', title: 'Wallet Integration Module', status: 'completed', dueDate: 'Jan 28', completedDate: 'Jan 27', approvedBy: 'agent' },
      { id: 'm3', title: 'Dashboard Charts & Analytics', status: 'completed', dueDate: 'Feb 5', completedDate: 'Feb 5', approvedBy: 'agent' },
      { id: 'm4', title: 'Token Swap Interface', status: 'in-progress', dueDate: 'Feb 15', approvedBy: null },
      { id: 'm5', title: 'Responsive Design & Mobile', status: 'pending', dueDate: 'Feb 25', approvedBy: null },
      { id: 'm6', title: 'Testing & Documentation', status: 'pending', dueDate: 'Mar 10', approvedBy: null },
    ],
    agenticApprovals: [
      {
        id: 'a1',
        milestoneId: 'm1',
        milestoneTitle: 'Project Setup & Architecture',
        verdict: 'approved',
        reason: 'Repository structure follows Next.js best practices. CI/CD pipeline configured correctly. TypeScript strict mode enabled. All linting rules pass.',
        timestamp: 'Jan 19, 2026 4:30 PM',
        confidence: 96,
      },
      {
        id: 'a2',
        milestoneId: 'm2',
        milestoneTitle: 'Wallet Integration Module',
        verdict: 'approved',
        reason: 'WalletConnect and MetaMask integrations tested. Error handling covers edge cases. Session persistence works across page reloads.',
        timestamp: 'Jan 27, 2026 2:15 PM',
        confidence: 93,
      },
      {
        id: 'a3',
        milestoneId: 'm3',
        milestoneTitle: 'Dashboard Charts & Analytics',
        verdict: 'approved',
        reason: 'Recharts integration complete. Real-time data feeds connected. Performance benchmarks met — renders 1000+ data points at 60fps.',
        timestamp: 'Feb 5, 2026 11:45 AM',
        confidence: 91,
      },
      {
        id: 'a4',
        milestoneId: 'm4',
        milestoneTitle: 'Token Swap Interface',
        verdict: 'needs-revision',
        reason: 'Core swap logic implemented but slippage tolerance UI missing. Price impact warning not shown for swaps >2%. Recommend adding confirmation modal.',
        timestamp: 'Feb 12, 2026 3:00 PM',
        confidence: 78,
      },
    ],
    agenticComments: [
      {
        id: 'c1',
        milestoneId: 'm1',
        comment: 'Clean architecture with clear separation of concerns. The modular folder structure will scale well as more features are added.',
        category: 'code-quality',
        timestamp: 'Jan 19, 2026 4:32 PM',
      },
      {
        id: 'c2',
        milestoneId: 'm2',
        comment: 'Wallet connection flow is smooth. Consider adding a retry mechanism for failed RPC calls to improve reliability on congested networks.',
        category: 'suggestion',
        timestamp: 'Jan 27, 2026 2:20 PM',
      },
      {
        id: 'c3',
        comment: 'Project is tracking ahead of schedule. 3 of 6 milestones completed before due dates. Current velocity suggests on-time delivery.',
        category: 'progress',
        timestamp: 'Feb 6, 2026 9:00 AM',
      },
      {
        id: 'c4',
        milestoneId: 'm4',
        comment: 'The swap router integration uses an outdated API version. This may cause issues when Uniswap V4 rolls out. Recommend upgrading to the latest SDK.',
        category: 'risk',
        timestamp: 'Feb 12, 2026 3:05 PM',
      },
      {
        id: 'c5',
        milestoneId: 'm4',
        comment: 'Test coverage for the swap module is at 72%. Target is 85% per project requirements. Missing tests for edge cases: zero-amount swaps, same-token swaps, and insufficient balance.',
        category: 'code-quality',
        timestamp: 'Feb 13, 2026 10:15 AM',
      },
    ],
    activityLog: [
      { id: 'e1', event: 'Contract created and signed by both parties', timestamp: 'Jan 15, 2026 10:30 AM', type: 'info' },
      { id: 'e2', event: 'Streaming payout initiated at 0.0002 ETH/sec', timestamp: 'Jan 15, 2026 10:35 AM', type: 'success' },
      { id: 'e3', event: 'Milestone 1 completed — approved by agent (96% confidence)', timestamp: 'Jan 19, 2026 4:30 PM', type: 'success' },
      { id: 'e4', event: 'Milestone 2 completed — approved by agent (93% confidence)', timestamp: 'Jan 27, 2026 2:15 PM', type: 'success' },
      { id: 'e5', event: 'Stream paused for scheduled review', timestamp: 'Feb 1, 2026 2:00 PM', type: 'warning' },
      { id: 'e6', event: 'Stream resumed after review', timestamp: 'Feb 1, 2026 4:30 PM', type: 'info' },
      { id: 'e7', event: 'Milestone 3 completed — approved by agent (91% confidence)', timestamp: 'Feb 5, 2026 11:45 AM', type: 'success' },
      { id: 'e8', event: 'Agent flagged Token Swap Interface for revision', timestamp: 'Feb 12, 2026 3:00 PM', type: 'warning' },
      { id: 'e9', event: 'Agent risk alert: outdated swap router API detected', timestamp: 'Feb 12, 2026 3:05 PM', type: 'error' },
    ],
  },
  '2': {
    id: '2',
    name: 'Smart Contract Audit',
    description:
      'Comprehensive security audit of a Solidity smart contract suite including token contracts, staking mechanisms, and governance module. Deliverables include a detailed report with severity classifications.',
    freelancerAlias: 'sarah_sec',
    freelancerInitials: 'SC',
    freelancerWallet: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    contractorName: 'CryptoSafe DAO',
    contractorInitials: 'CS',
    status: 'active',
    mode: 'agentic',
    budget: 8.0,
    currency: 'ETH',
    streamed: 1.89,
    streamRate: 0.0003,
    progress: 40,
    tasksCompleted: 4,
    totalTasks: 10,
    startDate: 'Jan 20, 2026',
    endDate: 'Mar 20, 2026',
    startTimestamp: Math.floor(new Date('Jan 20, 2026').getTime() / 1000),
    treasuryAddress: null,
    streamId: null,
    githubUrl: 'https://github.com/example/contract-audit',
    meetLink: 'https://meet.google.com/xyz-abcd-efg',
    pdfName: 'audit_scope.pdf',
    milestones: [
      { id: 'm1', title: 'Codebase Review & Threat Model', status: 'completed', dueDate: 'Jan 28', completedDate: 'Jan 26', approvedBy: 'agent' },
      { id: 'm2', title: 'Automated Analysis (Slither/Mythril)', status: 'completed', dueDate: 'Feb 5', completedDate: 'Feb 4', approvedBy: 'agent' },
      { id: 'm3', title: 'Manual Vulnerability Assessment', status: 'in-progress', dueDate: 'Feb 18', approvedBy: null },
      { id: 'm4', title: 'Governance Module Deep Dive', status: 'pending', dueDate: 'Feb 28', approvedBy: null },
      { id: 'm5', title: 'Final Report & Remediation Guide', status: 'pending', dueDate: 'Mar 15', approvedBy: null },
    ],
    agenticApprovals: [
      {
        id: 'a1',
        milestoneId: 'm1',
        milestoneTitle: 'Codebase Review & Threat Model',
        verdict: 'approved',
        reason: 'Threat model document covers all attack surfaces. STRIDE analysis complete. Dependencies catalogued with known CVE check.',
        timestamp: 'Jan 26, 2026 5:00 PM',
        confidence: 94,
      },
      {
        id: 'a2',
        milestoneId: 'm2',
        milestoneTitle: 'Automated Analysis (Slither/Mythril)',
        verdict: 'approved',
        reason: 'Both tools run successfully. 14 findings reported with proper severity classification. False positives documented and explained.',
        timestamp: 'Feb 4, 2026 3:30 PM',
        confidence: 89,
      },
    ],
    agenticComments: [
      {
        id: 'c1',
        milestoneId: 'm1',
        comment: 'Thorough threat model. The STRIDE categorization helps prioritize the manual review phase.',
        category: 'code-quality',
        timestamp: 'Jan 26, 2026 5:05 PM',
      },
      {
        id: 'c2',
        comment: 'Audit is on track. The automated tool phase completed a day early, giving extra buffer for the manual assessment.',
        category: 'progress',
        timestamp: 'Feb 5, 2026 9:00 AM',
      },
    ],
    activityLog: [
      { id: 'e1', event: 'Audit contract initiated', timestamp: 'Jan 20, 2026 9:00 AM', type: 'info' },
      { id: 'e2', event: 'Streaming payout started at 0.0003 ETH/sec', timestamp: 'Jan 20, 2026 9:05 AM', type: 'success' },
      { id: 'e3', event: 'Milestone 1 completed — approved by agent (94% confidence)', timestamp: 'Jan 26, 2026 5:00 PM', type: 'success' },
      { id: 'e4', event: 'Milestone 2 completed — approved by agent (89% confidence)', timestamp: 'Feb 4, 2026 3:30 PM', type: 'success' },
    ],
  },
}

export function getProjectDetail(id: string): ProjectDetail | null {
  // Check mock data first
  if (mockProjectDetails[id]) return mockProjectDetails[id]

  // Check localStorage projects
  try {
    const stored = JSON.parse(localStorage.getItem('starcpay_active_projects') ?? '[]')
    const project = stored.find((p: Record<string, unknown>) => p.id === id)
    if (!project) return null

    const spec = project.taskSpecification as {
      projectTitle?: string
      description?: string
      milestones?: { title: string; tasks: string[] }[]
    } | null

    const milestones: Milestone[] = (spec?.milestones ?? []).map(
      (m: { title: string; tasks: string[] }, i: number) => ({
        id: `ms-${i}`,
        title: m.title,
        status: 'pending' as const,
        dueDate: '—',
        approvedBy: null,
      }),
    )

    const totalTasks = milestones.length
    const formatDate = (ts: number) =>
      ts ? new Date(ts * 1000).toLocaleDateString() : '—'

    const ratePerSecondHuman = parseFloat(
      (Number(BigInt(project.ratePerSecond)) / 1e18).toFixed(10),
    )

    return {
      id: project.id,
      name: project.name,
      description: spec?.description ?? '',
      freelancerAlias: project.freelancerAlias,
      freelancerInitials: project.freelancerInitials,
      freelancerWallet: project.freelancerWalletAddress,
      contractorName: 'You',
      contractorInitials: 'ME',
      status: project.status,
      mode: project.evaluationMode,
      budget: project.totalBudgetInUSDC,
      currency: 'USDC',
      streamed: 0,
      streamRate: ratePerSecondHuman,
      progress: 0,
      tasksCompleted: 0,
      totalTasks,
      startDate: formatDate(project.createdAt),
      endDate: formatDate(project.endDate),
      startTimestamp: project.createdAt,
      treasuryAddress: project.treasuryAddress,
      streamId: project.streamId,
      githubUrl: project.githubRepo,
      meetLink: project.googleMeetLink,
      pdfName: 'Task Spec',
      milestones,
      agenticApprovals: [],
      agenticComments: [],
      activityLog: [
        {
          id: 'evt-1',
          event: 'Stream created on-chain',
          timestamp: formatDate(project.createdAt),
          type: 'success',
        },
      ],
    }
  } catch {
    return null
  }
}
