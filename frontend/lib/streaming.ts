import { parseEther, encodeFunctionData } from 'viem'
import { STREAMING_TREASURY_ABI } from '@/contract/contractDetails'

// ─── Rate conversion ────────────────────────────────────────────────────────

const SECONDS_PER_HOUR = 3600n
const SECONDS_PER_DAY = 86400n
const SECONDS_PER_WEEK = 604800n

/**
 * Convert a human-readable rate (e.g. 10 USDC/day) to wei-per-second (18 decimals).
 */
export function convertRateToPerSecond(rate: number, unit: string): bigint {
  const rateWei = parseEther(rate.toString())
  switch (unit) {
    case 'h':
      return rateWei / SECONDS_PER_HOUR
    case 'd':
      return rateWei / SECONDS_PER_DAY
    case 'w':
      return rateWei / SECONDS_PER_WEEK
    default:
      return rateWei / SECONDS_PER_DAY
  }
}

// ─── On-chain queries ───────────────────────────────────────────────────────

const STREAMS_ABI_JSON = JSON.stringify([
  {
    type: 'function',
    name: 'streams',
    inputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    outputs: [
      { name: 'recipient', type: 'address', internalType: 'address' },
      { name: 'ratePerSecond', type: 'uint256', internalType: 'uint256' },
      { name: 'lastTimestamp', type: 'uint256', internalType: 'uint256' },
      { name: 'accrued', type: 'uint256', internalType: 'uint256' },
      { name: 'paused', type: 'bool', internalType: 'bool' },
    ],
    stateMutability: 'view',
  },
])

const NEXT_STREAM_ID_ABI_JSON = JSON.stringify([
  {
    type: 'function',
    name: 'nextStreamId',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
    stateMutability: 'view',
  },
])

export interface StreamState {
  recipient: string
  ratePerSecond: string
  lastTimestamp: number
  accrued: string
  paused: boolean
}

/** Query a stream's on-chain state via Circle queryContract. */
export async function queryStream(
  treasuryAddress: string,
  streamId: number,
): Promise<StreamState | null> {
  try {
    const res = await fetch('/api/endpoints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'queryContract',
        address: treasuryAddress,
        abiFunctionSignature: 'streams(uint256)',
        abiParameters: [streamId.toString()],
        abiJson: STREAMS_ABI_JSON,
      }),
    })
    const data = await res.json()
    if (!res.ok) return null

    const vals = data.outputValues ?? []
    return {
      recipient: vals[0] ?? '',
      ratePerSecond: vals[1] ?? '0',
      lastTimestamp: parseInt(vals[2] ?? '0'),
      accrued: vals[3] ?? '0',
      paused: vals[4] === true || vals[4] === 'true',
    }
  } catch {
    return null
  }
}

/** Query nextStreamId from the treasury contract. */
export async function queryNextStreamId(
  treasuryAddress: string,
): Promise<number> {
  try {
    const res = await fetch('/api/endpoints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'queryContract',
        address: treasuryAddress,
        abiFunctionSignature: 'nextStreamId()',
        abiParameters: [],
        abiJson: NEXT_STREAM_ID_ABI_JSON,
      }),
    })
    const data = await res.json()
    if (!res.ok) return -1

    const vals = data.outputValues ?? []
    return parseInt(vals[0] ?? '0')
  } catch {
    return -1
  }
}

// ─── Stream actions (pause / resume / stop) ─────────────────────────────────

/**
 * Encode + send a stream action via Circle contractExecution.
 * Returns the challengeId for the caller to execute via Circle SDK.
 */
export async function sendStreamAction(
  functionName: 'pauseStream' | 'resumeStream' | 'stopStream',
  streamId: number,
  treasuryAddress: string,
  walletId: string,
  userToken: string,
): Promise<string> {
  const callData = encodeFunctionData({
    abi: STREAMING_TREASURY_ABI,
    functionName,
    args: [BigInt(streamId)],
  })

  const res = await fetch('/api/endpoints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'contractExecution',
      userToken,
      walletId,
      contractAddress: treasuryAddress,
      callData,
      feeLevel: 'MEDIUM',
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Transaction failed')
  }

  const { challengeId } = data
  if (!challengeId) {
    throw new Error('No challengeId returned')
  }

  return challengeId
}

// ─── localStorage helpers ───────────────────────────────────────────────────

const STORAGE_KEY = 'starcpay_active_projects'

export interface StoredProject {
  id: string
  name: string
  freelancerAlias: string
  freelancerInitials: string
  freelancerWalletAddress: string
  contractorAddress: string
  treasuryAddress: string
  streamId: number
  ratePerSecond: string // bigint as decimal string
  status: 'active' | 'paused' | 'completed'
  totalBudgetInUSDC: number
  evaluationMode: 'agentic' | 'manual'
  githubRepo: string
  googleMeetLink: string
  taskSpecification: Record<string, unknown>
  streamingUnit: string
  streamingRate: number
  startDate: number
  endDate: number
  totalTenureInDays: number
  createdAt: number
}

export function getStoredProjects(): StoredProject[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveProject(project: StoredProject): void {
  const projects = getStoredProjects()
  projects.push(project)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}
