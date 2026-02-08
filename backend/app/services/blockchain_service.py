"""
Blockchain Service for interacting with StreamingTreasury contract on ARC Testnet
"""

from web3 import Web3
from app.config import get_settings

# StreamingTreasury ABI - only the functions we need
STREAMING_TREASURY_ABI = [
    {
        "type": "function",
        "name": "changeRate",
        "inputs": [
            {"name": "streamId", "type": "uint256", "internalType": "uint256"},
            {"name": "newRate", "type": "uint256", "internalType": "uint256"},
        ],
        "outputs": [],
        "stateMutability": "nonpayable",
    },
    {
        "type": "function",
        "name": "streams",
        "inputs": [{"name": "", "type": "uint256", "internalType": "uint256"}],
        "outputs": [
            {"name": "recipient", "type": "address", "internalType": "address"},
            {"name": "ratePerSecond", "type": "uint256", "internalType": "uint256"},
            {"name": "lastTimestamp", "type": "uint256", "internalType": "uint256"},
            {"name": "accrued", "type": "uint256", "internalType": "uint256"},
            {"name": "paused", "type": "bool", "internalType": "bool"},
        ],
        "stateMutability": "view",
    },
]


class BlockchainService:
    """Service to interact with StreamingTreasury smart contract on ARC Testnet"""

    def __init__(self):
        self._w3 = None
        self._account = None

    def _get_web3(self) -> Web3:
        if self._w3 is None:
            settings = get_settings()
            self._w3 = Web3(Web3.HTTPProvider(settings.rpc_url))
            if settings.private_key:
                self._account = self._w3.eth.account.from_key(settings.private_key)
        return self._w3

    def _get_contract(self, treasury_address: str):
        w3 = self._get_web3()
        return w3.eth.contract(
            address=Web3.to_checksum_address(treasury_address),
            abi=STREAMING_TREASURY_ABI,
        )

    def calculate_rate(self, payout_amount: float, remaining_days: float) -> int:
        """
        Calculate streaming rate from payout amount and remaining days.

        Formula: rate = int((payout_amount / (remaining_days * 24 * 60 * 60)) * 10^18)

        Args:
            payout_amount: Amount in USD decided by AI workflow
            remaining_days: Days remaining until project end_date

        Returns:
            Rate per second in token units (18 decimals)
        """
        if remaining_days <= 0:
            remaining_days = 1  # Minimum 1 day to avoid division by zero

        remaining_seconds = remaining_days * 24 * 60 * 60
        rate_per_second = payout_amount / remaining_seconds
        rate_in_token_units = rate_per_second * (10 ** 18)
        return int(rate_in_token_units)

    async def change_rate(self, treasury_address: str, stream_id: int, new_rate: int) -> dict:
        """
        Call changeRate on the StreamingTreasury contract.

        Args:
            treasury_address: Address of the StreamingTreasury contract
            stream_id: The stream ID to update
            new_rate: New rate per second in token units

        Returns:
            Dict with tx_hash and status
        """
        w3 = self._get_web3()
        contract = self._get_contract(treasury_address)

        try:
            # Build transaction
            tx = contract.functions.changeRate(
                stream_id, new_rate
            ).build_transaction({
                "from": self._account.address,
                "nonce": w3.eth.get_transaction_count(self._account.address),
                "gasPrice": w3.eth.gas_price,
            })

            # Sign and send
            signed_tx = w3.eth.account.sign_transaction(tx, self._account.key)
            tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

            # Wait for receipt
            receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

            result = {
                "success": receipt.status == 1,
                "tx_hash": tx_hash.hex(),
                "block_number": receipt.blockNumber,
                "gas_used": receipt.gasUsed,
                "stream_id": stream_id,
                "new_rate": new_rate,
            }

            print(f"  [BLOCKCHAIN] changeRate tx: {tx_hash.hex()}")
            print(f"  [BLOCKCHAIN] Status: {'Success' if receipt.status == 1 else 'Failed'}")

            return result

        except Exception as e:
            print(f"  [BLOCKCHAIN ERROR] changeRate failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "stream_id": stream_id,
                "new_rate": new_rate,
            }

    async def get_stream_info(self, treasury_address: str, stream_id: int) -> dict:
        """Get current stream info (for debugging/testing)"""
        contract = self._get_contract(treasury_address)
        try:
            result = contract.functions.streams(stream_id).call()
            return {
                "recipient": result[0],
                "ratePerSecond": result[1],
                "lastTimestamp": result[2],
                "accrued": result[3],
                "paused": result[4],
            }
        except Exception as e:
            return {"error": str(e)}


# Singleton
blockchain_service = BlockchainService()
