"""
Blockchain test endpoints for testing smart contract interactions
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.blockchain_service import blockchain_service

router = APIRouter(prefix="/api/blockchain", tags=["blockchain"])


class ChangeRateRequest(BaseModel):
    treasury_address: str
    stream_id: int
    new_rate: int


class CalculateRateRequest(BaseModel):
    payout_amount: float
    remaining_days: float


@router.post("/test-change-rate")
async def test_change_rate(request: ChangeRateRequest):
    """Test the changeRate contract call directly"""
    result = await blockchain_service.change_rate(
        treasury_address=request.treasury_address,
        stream_id=request.stream_id,
        new_rate=request.new_rate,
    )

    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Transaction failed"))

    return result


@router.post("/calculate-rate")
async def calculate_rate(request: CalculateRateRequest):
    """Calculate the streaming rate from payout amount and remaining days"""
    rate = blockchain_service.calculate_rate(
        payout_amount=request.payout_amount,
        remaining_days=request.remaining_days,
    )
    remaining_seconds = request.remaining_days * 24 * 60 * 60
    return {
        "payout_amount": request.payout_amount,
        "remaining_days": request.remaining_days,
        "remaining_seconds": remaining_seconds,
        "rate_per_second_raw": request.payout_amount / remaining_seconds if remaining_seconds > 0 else 0,
        "rate_in_token_units": rate,
    }


@router.get("/stream-info/{treasury_address}/{stream_id}")
async def get_stream_info(treasury_address: str, stream_id: int):
    """Get current stream info from the contract"""
    result = await blockchain_service.get_stream_info(
        treasury_address=treasury_address,
        stream_id=stream_id,
    )

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return result
