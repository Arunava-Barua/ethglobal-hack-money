"""
GitHub App Installation & Management Routes

These endpoints help with GitHub App installation flow and testing.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from datetime import datetime

from app.database import get_database
from app.services.github_service import github_service

router = APIRouter(prefix="/api/github", tags=["github-app"])


@router.get("/installation/{installation_id}/repos")
async def list_installation_repos(installation_id: str):
    """
    List all repositories accessible by an installation.

    Use this after user installs the GitHub App to verify access.
    """
    try:
        repos = await github_service.list_installation_repositories(installation_id)
        return {
            "success": True,
            "installation_id": installation_id,
            "total_repos": len(repos),
            "repositories": [
                {
                    "id": repo["id"],
                    "name": repo["name"],
                    "full_name": repo["full_name"],
                    "private": repo["private"],
                    "html_url": repo["html_url"]
                }
                for repo in repos
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching repositories: {str(e)}")


@router.get("/installation/{installation_id}/verify")
async def verify_installation(installation_id: str):
    """
    Verify that an installation ID is valid and can generate tokens.

    Use this to test if the GitHub App installation is working correctly.
    """
    try:
        # Try to get a token
        token = await github_service.get_installation_token(installation_id)

        # Try to list repos
        repos = await github_service.list_installation_repositories(installation_id)

        return {
            "success": True,
            "installation_id": installation_id,
            "token_generated": True,
            "repos_accessible": len(repos),
            "message": "Installation is valid and working"
        }
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Installation verification failed: {str(e)}"
        )


@router.post("/installation/callback")
async def installation_callback(
    installation_id: str = Query(...),
    setup_action: str = Query(...)
):
    """
    Handle GitHub App installation callback.

    This endpoint receives the installation_id after user installs the app.
    Frontend should call this or extract parameters directly from redirect URL.

    Query Parameters:
    - installation_id: The GitHub App installation ID
    - setup_action: "install" or "update"
    """
    try:
        # Verify installation
        repos = await github_service.list_installation_repositories(installation_id)

        # Store installation info (optional)
        db = get_database()
        await db["installations"].update_one(
            {"installation_id": installation_id},
            {
                "$set": {
                    "installation_id": installation_id,
                    "setup_action": setup_action,
                    "repos_count": len(repos),
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            },
            upsert=True
        )

        return {
            "success": True,
            "installation_id": installation_id,
            "setup_action": setup_action,
            "repos_accessible": len(repos),
            "message": "Installation recorded successfully",
            "next_step": "Create a project using POST /api/projects/"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing callback: {str(e)}")


@router.get("/webhooks/deliveries")
async def get_webhook_deliveries(project_id: Optional[str] = None, limit: int = 10):
    """
    Get recent webhook deliveries (push events).

    Useful for debugging webhook issues.
    """
    db = get_database()

    query = {}
    if project_id:
        query["project_id"] = project_id

    events = await db["push_events"].find(query).sort("created_at", -1).limit(limit).to_list(length=limit)

    # Clean up for response
    for event in events:
        event.pop("_id", None)
        # Remove large diff data for list view
        if "commits_details" in event:
            for commit in event["commits_details"]:
                commit["diff"] = f"[{len(commit.get('diff', ''))} chars]"

    return {
        "success": True,
        "total_events": len(events),
        "events": events
    }


@router.get("/webhooks/deliveries/{push_id}")
async def get_webhook_delivery_detail(push_id: str):
    """
    Get detailed information about a specific webhook delivery.

    Includes full commit diffs.
    """
    db = get_database()

    event = await db["push_events"].find_one({"push_id": push_id})

    if not event:
        raise HTTPException(status_code=404, detail="Push event not found")

    event.pop("_id", None)

    return {
        "success": True,
        "event": event
    }


@router.get("/commit/{owner}/{repo}/{sha}")
async def get_commit_details(
    owner: str,
    repo: str,
    sha: str,
    installation_id: str = Query(...)
):
    """
    Get detailed information about a specific commit.

    Useful for testing commit diff fetching.
    """
    try:
        commit = await github_service.get_commit_details(
            installation_id,
            owner,
            repo,
            sha
        )

        return {
            "success": True,
            "commit": commit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching commit: {str(e)}")


@router.post("/test-webhook-signature")
async def test_webhook_signature(
    payload: str,
    signature: str,
    secret: str
):
    """
    Test webhook signature verification.

    Use this to debug signature verification issues.
    """
    import hmac
    import hashlib

    expected_signature = "sha256=" + hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()

    is_valid = hmac.compare_digest(expected_signature, signature)

    return {
        "success": True,
        "is_valid": is_valid,
        "expected_signature": expected_signature,
        "received_signature": signature
    }


@router.get("/stats")
async def get_github_stats():
    """
    Get overall GitHub integration statistics.
    """
    db = get_database()

    total_installations = await db["installations"].count_documents({})
    total_projects = await db["projects"].count_documents({})
    total_push_events = await db["push_events"].count_documents({})
    total_analyses = await db["commit_analyses"].count_documents({})

    # Get recent activity
    recent_pushes = await db["push_events"].find().sort("created_at", -1).limit(5).to_list(length=5)

    return {
        "success": True,
        "stats": {
            "total_installations": total_installations,
            "total_projects": total_projects,
            "total_push_events": total_push_events,
            "total_commit_analyses": total_analyses
        },
        "recent_activity": [
            {
                "push_id": p["push_id"],
                "project_id": p["project_id"],
                "commits_count": p.get("total_commits", 0),
                "developer": p["tracked_developer"],
                "created_at": p["created_at"]
            }
            for p in recent_pushes
        ]
    }
