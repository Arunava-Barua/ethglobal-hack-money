"""
Webhook Management Routes

Programmatically manage GitHub webhooks without manual GitHub UI access.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.database import get_database
from app.services.github_service import github_service
from app.config import get_settings

router = APIRouter(prefix="/api/webhook-manager", tags=["webhook-manager"])
settings = get_settings()


class UpdateWebhookRequest(BaseModel):
    project_id: str
    new_webhook_url: str  # e.g., https://abc123.ngrok.io/api/webhooks/github


class CreateWebhookRequest(BaseModel):
    installation_id: str
    repo_owner: str
    repo_name: str
    webhook_url: str


@router.post("/update")
async def update_webhook_url(request: UpdateWebhookRequest):
    """
    Update webhook URL for a project programmatically.

    Use this to update webhook URL when you change your backend URL
    (e.g., switching from localhost to ngrok or deploying to production).

    Example:
    ```
    curl -X POST http://localhost:8000/api/webhook-manager/update \
      -H "Content-Type: application/json" \
      -d '{
        "project_id": "proj_abc123",
        "new_webhook_url": "https://abc123.ngrok.io/api/webhooks/github"
      }'
    ```
    """
    db = get_database()

    # Get project
    project = await db["projects"].find_one({"project_id": request.project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    installation_id = project["installation_id"]
    owner = project["repo_owner"]
    repo = project["repo_name"]

    try:
        # Get installation token
        token = await github_service.get_installation_token(installation_id)

        # List existing webhooks
        import httpx
        async with httpx.AsyncClient() as client:
            # Get all webhooks
            hooks_response = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}/hooks",
                headers={
                    "Authorization": f"token {token}",
                    "Accept": "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28"
                }
            )
            hooks_response.raise_for_status()
            hooks = hooks_response.json()

            # Find our webhook (contains /api/webhooks/github)
            our_hook = None
            for hook in hooks:
                if "/api/webhooks/github" in hook["config"].get("url", ""):
                    our_hook = hook
                    break

            if not our_hook:
                raise HTTPException(
                    status_code=404,
                    detail="Webhook not found. Create one first using POST /api/projects/"
                )

            # Update webhook URL
            hook_id = our_hook["id"]
            update_response = await client.patch(
                f"https://api.github.com/repos/{owner}/{repo}/hooks/{hook_id}",
                headers={
                    "Authorization": f"token {token}",
                    "Accept": "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28"
                },
                json={
                    "config": {
                        "url": request.new_webhook_url,
                        "content_type": "json",
                        "secret": settings.github_webhook_secret,
                        "insecure_ssl": "0"
                    }
                }
            )
            update_response.raise_for_status()
            updated_hook = update_response.json()

            return {
                "success": True,
                "message": "Webhook URL updated successfully",
                "webhook_id": hook_id,
                "old_url": our_hook["config"]["url"],
                "new_url": request.new_webhook_url,
                "webhook_details": {
                    "id": updated_hook["id"],
                    "url": updated_hook["config"]["url"],
                    "events": updated_hook["events"],
                    "active": updated_hook["active"]
                }
            }

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"GitHub API error: {e.response.text}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating webhook: {str(e)}")


@router.post("/create")
async def create_webhook(request: CreateWebhookRequest):
    """
    Create a new webhook on a repository.

    Use this if webhook wasn't created during project creation.

    Example:
    ```
    curl -X POST http://localhost:8000/api/webhook-manager/create \
      -H "Content-Type: application/json" \
      -d '{
        "installation_id": "12345678",
        "repo_owner": "username",
        "repo_name": "repo",
        "webhook_url": "https://abc123.ngrok.io/api/webhooks/github"
      }'
    ```
    """
    try:
        webhook = await github_service.create_webhook(
            request.installation_id,
            request.repo_owner,
            request.repo_name,
            request.webhook_url
        )

        return {
            "success": True,
            "message": "Webhook created successfully",
            "webhook_id": webhook["id"],
            "webhook_url": webhook["config"]["url"],
            "events": webhook["events"],
            "active": webhook["active"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating webhook: {str(e)}")


@router.get("/list/{project_id}")
async def list_project_webhooks(project_id: str):
    """
    List all webhooks for a project's repository.

    Use this to see existing webhooks and their configurations.
    """
    db = get_database()

    # Get project
    project = await db["projects"].find_one({"project_id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    installation_id = project["installation_id"]
    owner = project["repo_owner"]
    repo = project["repo_name"]

    try:
        token = await github_service.get_installation_token(installation_id)

        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}/hooks",
                headers={
                    "Authorization": f"token {token}",
                    "Accept": "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28"
                }
            )
            response.raise_for_status()
            hooks = response.json()

            return {
                "success": True,
                "project_id": project_id,
                "repo": f"{owner}/{repo}",
                "total_webhooks": len(hooks),
                "webhooks": [
                    {
                        "id": hook["id"],
                        "url": hook["config"]["url"],
                        "events": hook["events"],
                        "active": hook["active"],
                        "created_at": hook["created_at"],
                        "updated_at": hook["updated_at"]
                    }
                    for hook in hooks
                ]
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing webhooks: {str(e)}")


@router.delete("/delete/{project_id}")
async def delete_webhook(project_id: str, webhook_id: Optional[int] = None):
    """
    Delete a webhook for a project.

    If webhook_id not provided, deletes the webhook containing /api/webhooks/github.
    """
    db = get_database()

    # Get project
    project = await db["projects"].find_one({"project_id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    installation_id = project["installation_id"]
    owner = project["repo_owner"]
    repo = project["repo_name"]

    try:
        token = await github_service.get_installation_token(installation_id)

        import httpx
        async with httpx.AsyncClient() as client:
            # If webhook_id not provided, find it
            if not webhook_id:
                hooks_response = await client.get(
                    f"https://api.github.com/repos/{owner}/{repo}/hooks",
                    headers={
                        "Authorization": f"token {token}",
                        "Accept": "application/vnd.github+json",
                        "X-GitHub-Api-Version": "2022-11-28"
                    }
                )
                hooks_response.raise_for_status()
                hooks = hooks_response.json()

                # Find our webhook
                for hook in hooks:
                    if "/api/webhooks/github" in hook["config"].get("url", ""):
                        webhook_id = hook["id"]
                        break

                if not webhook_id:
                    raise HTTPException(status_code=404, detail="Webhook not found")

            # Delete webhook
            delete_response = await client.delete(
                f"https://api.github.com/repos/{owner}/{repo}/hooks/{webhook_id}",
                headers={
                    "Authorization": f"token {token}",
                    "Accept": "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28"
                }
            )
            delete_response.raise_for_status()

            return {
                "success": True,
                "message": "Webhook deleted successfully",
                "webhook_id": webhook_id
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting webhook: {str(e)}")


@router.post("/test/{project_id}")
async def test_webhook(project_id: str):
    """
    Trigger a test ping to the webhook.

    Use this to verify webhook is reachable.
    """
    db = get_database()

    # Get project
    project = await db["projects"].find_one({"project_id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    installation_id = project["installation_id"]
    owner = project["repo_owner"]
    repo = project["repo_name"]

    try:
        token = await github_service.get_installation_token(installation_id)

        import httpx
        async with httpx.AsyncClient() as client:
            # Get webhook
            hooks_response = await client.get(
                f"https://api.github.com/repos/{owner}/{repo}/hooks",
                headers={
                    "Authorization": f"token {token}",
                    "Accept": "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28"
                }
            )
            hooks_response.raise_for_status()
            hooks = hooks_response.json()

            # Find our webhook
            webhook_id = None
            for hook in hooks:
                if "/api/webhooks/github" in hook["config"].get("url", ""):
                    webhook_id = hook["id"]
                    break

            if not webhook_id:
                raise HTTPException(status_code=404, detail="Webhook not found")

            # Test webhook
            test_response = await client.post(
                f"https://api.github.com/repos/{owner}/{repo}/hooks/{webhook_id}/tests",
                headers={
                    "Authorization": f"token {token}",
                    "Accept": "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28"
                }
            )
            test_response.raise_for_status()

            return {
                "success": True,
                "message": "Test ping sent to webhook",
                "webhook_id": webhook_id,
                "note": "Check your backend logs for the ping event"
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error testing webhook: {str(e)}")
