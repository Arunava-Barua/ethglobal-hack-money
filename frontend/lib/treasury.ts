import { createPublicClient, http, type Address } from 'viem'
import { TREASURY_FACTORY_ADDRESS, ARC_RPC } from '@/contract/contractDetails'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const arcTestnet = {
  id: 5042002,
  name: 'ARC Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: { default: { http: [ARC_RPC] } },
} as const

const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: http(ARC_RPC),
})

const TREASURY_MAPPING_ABI_JSON = JSON.stringify([
  {
    type: 'function',
    name: 'treasuryMapping',
    inputs: [{ name: '', type: 'address', internalType: 'address' }],
    outputs: [{ name: '', type: 'address', internalType: 'address' }],
    stateMutability: 'view',
  },
])

/**
 * Read the treasury address for a given owner from the TreasuryFactory contract
 * using Circle's contract query API. Returns the zero address if no treasury exists.
 */
export async function getTreasuryAddress(ownerAddress: string): Promise<string> {
  try {
    const res = await fetch('/api/endpoints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'queryContract',
        address: TREASURY_FACTORY_ADDRESS,
        abiFunctionSignature: 'treasuryMapping(address)',
        abiParameters: [ownerAddress],
        abiJson: TREASURY_MAPPING_ABI_JSON,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[Treasury] queryContract error:', JSON.stringify(data, null, 2))
      return ZERO_ADDRESS
    }

    // Circle returns outputValues as an array
    const outputValues = data.outputValues ?? []
    const treasuryAddr = outputValues[0] ?? ZERO_ADDRESS

    return treasuryAddr
  } catch (err) {
    console.error('[Treasury] getTreasuryAddress failed:', err)
    return ZERO_ADDRESS
  }
}

/**
 * Get the native balance of a treasury contract via direct RPC eth_getBalance.
 */
export async function getTreasuryBalance(treasuryAddress: string): Promise<bigint> {
  try {
    return await publicClient.getBalance({ address: treasuryAddress as Address })
  } catch (err) {
    console.error('[Treasury] getTreasuryBalance failed:', err)
    return 0n
  }
}
