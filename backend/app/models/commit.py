from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class CommitAnalysis(BaseModel):
    """AI analysis result for a batch of commits"""
    project_id: str
    push_id: str
    commits: List[str]  # List of commit SHAs
    total_commits: int
    author: str
    total_payout_amount: float
    reasoning: str
    confidence: float  # 0.0 to 1.0
    flags: List[str] = []  # e.g., ["suspicious_pattern", "needs_human_review"]
    commits_summary: str
    analysis_status: str = "pending"  # pending, approved, rejected, paid
    created_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "project_id": "proj_123abc",
                "push_id": "push_789xyz",
                "commits": ["abc123", "def456"],
                "total_commits": 2,
                "author": "dev123",
                "total_payout_amount": 25.50,
                "reasoning": "Implemented login feature with tests",
                "confidence": 0.92,
                "flags": [],
                "commits_summary": "Added auth endpoints and unit tests",
                "analysis_status": "approved"
            }
        }


class CommitDetail(BaseModel):
    """Individual commit details from GitHub"""
    sha: str
    author: str
    message: str
    timestamp: datetime
    additions: int
    deletions: int
    changed_files: int
    diff: str
    files_changed: List[Dict[str, Any]]

    class Config:
        json_schema_extra = {
            "example": {
                "sha": "abc123def456",
                "author": "dev123",
                "message": "Add login endpoint",
                "timestamp": "2024-01-15T10:30:00Z",
                "additions": 120,
                "deletions": 15,
                "changed_files": 3,
                "diff": "diff --git a/file.py...",
                "files_changed": []
            }
        }
