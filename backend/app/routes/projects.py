from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
import secrets
from urllib.parse import urlparse

from app.models.project import ProjectCreate, Project
from app.database import get_database
from app.services.github_service import github_service
from app.config import get_settings

router = APIRouter(prefix="/api/projects", tags=["projects"])
settings = get_settings()


def parse_github_url(url: str) -> tuple:
    """Parse GitHub URL to extract owner and repo"""
    # https://github.com/owner/repo
    parsed = urlparse(url)
    parts = parsed.path.strip("/").split("/")
    if len(parts) >= 2:
        return parts[0], parts[1]
    raise ValueError("Invalid GitHub URL format")


@router.post("/", response_model=dict)
async def create_project(project_data: ProjectCreate):
    """
    Create a new project and set up GitHub webhook

    This endpoint:
    1. Validates the GitHub repo access
    2. Creates project in database
    3. Sets up webhook for push events
    """
    db = get_database()
    projects_collection = db["projects"]

    try:
        # Parse GitHub URL
        owner, repo_name = parse_github_url(project_data.repo_url)

        # Validate installation has access to repo
        repos = await github_service.list_installation_repositories(project_data.installation_id)
        repo_found = any(r["full_name"] == f"{owner}/{repo_name}" for r in repos)

        if not repo_found:
            raise HTTPException(
                status_code=403,
                detail=f"GitHub App installation does not have access to {owner}/{repo_name}"
            )

        # Generate unique project ID
        project_id = f"proj_{secrets.token_hex(8)}"

        # Create project document
        project = Project(
            project_id=project_id,
            freelance_alias=project_data.freelance_alias,
            github_username=project_data.github_username,
            employee_wallet_address=project_data.employee_wallet_address,
            employer_wallet_address=project_data.employer_wallet_address,
            repo_url=project_data.repo_url,
            repo_owner=owner,
            repo_name=repo_name,
            milestone_specification=project_data.milestone_specification,
            gmeet_link=project_data.gmeet_link,
            total_budget=project_data.total_budget,
            payout_threshold=project_data.payout_threshold,
            evaluation_mode=project_data.evaluation_mode,
            start_date=project_data.start_date,
            end_date=project_data.end_date,
            total_tenure_days=project_data.total_tenure_days,
            installation_id=project_data.installation_id,
            stream_id=project_data.stream_id,
            smart_contract_hash=project_data.smart_contract_hash,
            treasury_address=project_data.treasury_address
        )

        # Save to database
        await projects_collection.insert_one(project.model_dump())

        # Create webhook
        webhook_url = f"{settings.frontend_url.replace('http://localhost:3000', 'https://your-backend-url.com')}/api/webhooks/github"

        try:
            webhook = await github_service.create_webhook(
                project_data.installation_id,
                owner,
                repo_name,
                webhook_url
            )
            webhook_id = webhook["id"]
        except Exception as e:
            print(f"Warning: Webhook creation failed: {e}")
            webhook_id = None

        return {
            "success": True,
            "project_id": project_id,
            "message": "Project created successfully",
            "webhook_created": webhook_id is not None,
            "webhook_id": webhook_id
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating project: {str(e)}")


@router.get("/{project_id}", response_model=Project)
async def get_project(project_id: str):
    """Get project details by ID"""
    db = get_database()
    project = await db["projects"].find_one({"project_id": project_id})

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Remove MongoDB _id field
    project.pop("_id", None)
    return project


@router.get("/", response_model=List[Project])
async def list_projects(
    status: str = None,
    freelancer: str = None,
    user_type: str = None,
    wallet_address: str = None
):
    """
    List all projects with optional filters

    Wallet filtering logic:
    - user_type=freelancer: filters by employee_wallet_address (shows projects where you're the employee)
    - user_type=contractor: filters by employer_wallet_address (shows projects where you're the employer)
    - user_type not specified: checks both wallet fields (shows all projects you're involved in)

    Note: user_type is a query parameter only, not stored in the project
    """
    db = get_database()

    query = {}
    if status:
        query["status"] = status
    if freelancer:
        query["github_username"] = freelancer

    # Handle wallet_address filtering based on user_type
    if wallet_address and user_type:
        # User type specified - filter by appropriate wallet field
        if user_type == "freelancer":
            query["employee_wallet_address"] = wallet_address
        elif user_type == "contractor":
            query["employer_wallet_address"] = wallet_address
    elif wallet_address:
        # No user type - search both wallet fields
        query["$or"] = [
            {"employee_wallet_address": wallet_address},
            {"employer_wallet_address": wallet_address}
        ]

    projects = await db["projects"].find(query).to_list(length=100)

    # Remove MongoDB _id field
    for project in projects:
        project.pop("_id", None)

    return projects


@router.patch("/{project_id}/status")
async def update_project_status(project_id: str, status: str):
    """Update project status (active, paused, completed)"""
    if status not in ["active", "paused", "completed"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    db = get_database()
    result = await db["projects"].update_one(
        {"project_id": project_id},
        {"$set": {"status": status, "updated_at": datetime.utcnow()}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")

    return {"success": True, "message": f"Project status updated to {status}"}


@router.get("/{project_id}/analyses")
async def get_project_analyses(project_id: str, limit: int = 50):
    """
    Get all commit analyses for a project

    Returns AI analysis results including payout amounts, reasoning, and quality scores
    """
    db = get_database()

    # Verify project exists
    project = await db["projects"].find_one({"project_id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Fetch analyses sorted by creation date (newest first)
    analyses = await db["commit_analyses"].find(
        {"project_id": project_id}
    ).sort("created_at", -1).limit(limit).to_list(length=limit)

    # Remove MongoDB _id field
    for analysis in analyses:
        analysis.pop("_id", None)

    return {
        "success": True,
        "project_id": project_id,
        "total_analyses": len(analyses),
        "analyses": analyses
    }


@router.get("/{project_id}/push-events")
async def get_project_push_events(project_id: str, limit: int = 50):
    """
    Get all push events for a project

    Returns raw webhook data including commit details and analysis status
    """
    db = get_database()

    # Verify project exists
    project = await db["projects"].find_one({"project_id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Fetch push events sorted by creation date (newest first)
    push_events = await db["push_events"].find(
        {"project_id": project_id}
    ).sort("created_at", -1).limit(limit).to_list(length=limit)

    # Remove MongoDB _id field
    for event in push_events:
        event.pop("_id", None)

    return {
        "success": True,
        "project_id": project_id,
        "total_events": len(push_events),
        "push_events": push_events
    }
