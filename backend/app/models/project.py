from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class ProjectCreate(BaseModel):
    """Schema for creating a new project"""
    # Freelancer Info
    freelance_alias: str
    github_username: str
    wallet_address: str

    # Project Details
    repo_url: str
    milestone_specification: Dict[str, Any]  # JSON object with milestones
    gmeet_link: Optional[str] = None

    # Budget & Payment
    total_budget: float
    payout_threshold: float = 100.0  # Default $100 threshold

    # Evaluation
    evaluation_mode: str  # "agentic" or "manual"

    # Timeline
    start_date: datetime
    end_date: datetime
    total_tenure_days: int

    # Technical
    installation_id: str  # GitHub App installation ID
    stream_id: Optional[str] = None  # For later use
    smart_contract_hash: Optional[str] = None


class Project(BaseModel):
    """Project model stored in MongoDB"""
    project_id: str

    # Freelancer Info
    freelance_alias: str
    github_username: str
    wallet_address: str

    # Repository
    repo_url: str
    repo_owner: str
    repo_name: str

    # Project Details
    milestone_specification: Dict[str, Any]  # JSON object with milestones
    gmeet_link: Optional[str] = None

    # Budget & Payment
    total_budget: float
    earned_pending: float = 0.0  # Accumulated earnings not yet paid
    total_paid: float = 0.0
    payout_threshold: float = 100.0

    # Evaluation
    evaluation_mode: str  # "agentic" or "manual"

    # Timeline
    start_date: datetime
    end_date: datetime
    total_tenure_days: int

    # Technical
    installation_id: str
    stream_id: Optional[str] = None
    smart_contract_hash: Optional[str] = None

    # Status
    status: str = "active"  # active, paused, completed
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "project_id": "proj_123abc",
                "freelance_alias": "John Dev",
                "github_username": "johndev",
                "wallet_address": "0x1234...",
                "repo_url": "https://github.com/owner/repo",
                "repo_owner": "owner",
                "repo_name": "repo",
                "milestone_specification": {
                    "milestones": [
                        {
                            "id": 1,
                            "title": "Authentication",
                            "budget": 500,
                            "status": "in_progress"
                        }
                    ]
                },
                "total_budget": 1000.0,
                "evaluation_mode": "agentic",
                "start_date": "2026-02-01T00:00:00Z",
                "end_date": "2026-03-01T00:00:00Z",
                "total_tenure_days": 30,
                "installation_id": "12345678",
                "earned_pending": 45.50,
                "total_paid": 200.00
            }
        }
