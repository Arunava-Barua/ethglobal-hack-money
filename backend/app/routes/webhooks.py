from fastapi import APIRouter, Request, HTTPException, Header
from typing import Optional
import hmac
import hashlib
from datetime import datetime

from app.database import get_database
from app.services.github_service import github_service
from app.services.commit_analyzer import commit_analyzer_service
# from app.services.ai_workflow import ai_workflow_service  # Temporarily disabled for testing
from app.config import get_settings

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])
settings = get_settings()


def verify_github_signature(payload: bytes, signature: str, secret: str) -> bool:
    """Verify GitHub webhook signature"""
    if not signature:
        return False

    expected_signature = "sha256=" + hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(expected_signature, signature)


@router.post("/github")
async def handle_github_webhook(
    request: Request,
    x_hub_signature_256: Optional[str] = Header(None),
    x_github_event: Optional[str] = Header(None),
    x_github_delivery: Optional[str] = Header(None)
):
    """
    Handle GitHub webhook events (push events)

    Flow:
    1. Verify webhook signature
    2. Extract push data and commits
    3. Find matching project in database
    4. Filter commits by tracked developer
    5. Fetch commit details and diffs
    6. Store in MongoDB
    """

    # Log all headers for debugging
    print("=" * 80)
    print("[WEBHOOK] WEBHOOK RECEIVED")
    print(f"Event Type: {x_github_event}")
    print(f"Delivery ID: {x_github_delivery}")
    print(f"Signature: {x_hub_signature_256[:30] if x_hub_signature_256 else 'None'}...")

    # Get raw body
    body = await request.body()
    print(f"Body size: {len(body)} bytes")
    print(f"Body type: {type(body)}")
    print(f"Body preview: {body[:300]}")
    print("=" * 80)

    try:
        # Handle ping event (GitHub sends this to test webhook)
        if x_github_event == "ping":
            print("[PING] Ping event - responding with pong")
            return {"message": "pong", "status": "ok"}

        # Handle empty body
        if not body or len(body) == 0:
            print("[WARN]  Empty body received - likely Cloudflare/proxy issue")
            return {
                "message": "Empty body received",
                "status": "error",
                "hint": "Check if proxy/CDN is stripping request body"
            }

        # Try to parse JSON
        import json
        from urllib.parse import parse_qs, unquote
        payload = None

        # Check if body is URL-encoded (GitHub sends form data sometimes)
        body_str = body.decode('utf-8')
        if body_str.startswith('payload='):
            print("[INFO] Detected URL-encoded payload")
            try:
                # Extract payload from form data
                parsed = parse_qs(body_str)
                payload_str = parsed['payload'][0]
                payload = json.loads(unquote(payload_str))
                print("[OK] Parsed URL-encoded payload")
            except Exception as e:
                print(f"[ERROR] Failed to parse URL-encoded payload: {e}")
                return {"message": "Failed to parse URL-encoded JSON", "status": "error", "error": str(e)}
        else:
            # Try different decoding methods for raw JSON
            try:
                # Method 1: Direct decode
                payload = json.loads(body_str)
            except:
                try:
                    # Method 2: Try as bytes
                    payload = json.loads(body)
                except:
                    try:
                        # Method 3: Via request.json()
                        payload = await request.json()
                    except Exception as final_error:
                        print(f"[ERROR] All JSON parsing methods failed")
                        print(f"Body content: {body[:500]}")
                        return {
                            "message": "Failed to parse JSON",
                            "status": "error",
                            "body_received": str(body[:500]),
                            "error": str(final_error)
                        }

        if not payload:
            print("[ERROR] Payload is None after parsing")
            return {"message": "Payload is empty", "status": "error"}

        print(f"[OK] JSON parsed successfully")
        print(f"Payload keys: {list(payload.keys())}")

        # Only handle push events
        if x_github_event != "push":
            print(f"[INFO]  Ignoring non-push event: {x_github_event}")
            return {"message": f"Event ignored (type: {x_github_event})"}

    except Exception as e:
        print(f"[ERROR] Error in webhook preprocessing: {e}")
        import traceback
        traceback.print_exc()
        return {
            "message": "Webhook preprocessing error",
            "status": "error",
            "error": str(e),
            "body_size": len(body) if body else 0
        }

    # Extract push data
    repo_full_name = payload["repository"]["full_name"]
    repo_owner, repo_name = repo_full_name.split("/")
    pusher = payload["pusher"]["name"]
    commits = payload["commits"]
    ref = payload["ref"]  # e.g., refs/heads/main

    print(f"[RECEIVED] Received push event: {repo_full_name} | Pusher: {pusher} | Commits: {len(commits)}")

    # Find matching project in database
    db = get_database()
    project = await db["projects"].find_one({
        "repo_owner": repo_owner,
        "repo_name": repo_name,
        "status": "active"
    })

    if not project:
        print(f"[WARN]  No active project found for {repo_full_name}")
        return {"message": "No active project found for this repository"}

    tracked_developer = project["github_username"]

    # Filter commits by tracked developer
    # Note: GitHub webhook gives commit author username in commit["author"]["username"]
    tracked_commits = []
    for commit in commits:
        commit_author = commit.get("author", {}).get("username", "")
        commit_author_name = commit.get("author", {}).get("name", "")

        # Match by username or name (case insensitive)
        if (commit_author and commit_author.lower() == tracked_developer.lower()) or \
           (commit_author_name and commit_author_name.lower() == tracked_developer.lower()):
            tracked_commits.append(commit["id"])  # commit SHA
            print(f"   [MATCH] Matched commit: {commit['id'][:8]} by {commit_author or commit_author_name}")

    if not tracked_commits:
        print(f"[INFO]  No commits from tracked developer {tracked_developer}")
        print(f"   Available commits: {[(c.get('author', {}).get('username', 'unknown'), c.get('author', {}).get('name', 'unknown')) for c in commits]}")
        return {"message": f"No commits from tracked developer {tracked_developer}"}

    print(f"[OK] Found {len(tracked_commits)} commits from {tracked_developer}")

    # Fetch detailed commit data with diffs
    installation_id = project["installation_id"]

    try:
        commits_details = await github_service.get_batch_commits(
            installation_id,
            repo_owner,
            repo_name,
            tracked_commits
        )

        print(f"[FETCHED] Fetched details for {len(commits_details)} commits")

        # Store push event for processing
        push_id = f"push_{datetime.utcnow().timestamp()}"
        await db["push_events"].insert_one({
            "push_id": push_id,
            "project_id": project["project_id"],
            "repo": repo_full_name,
            "ref": ref,
            "pusher": pusher,
            "tracked_developer": tracked_developer,
            "commit_shas": tracked_commits,
            "commits_details": commits_details,
            "status": "pending_analysis",
            "created_at": datetime.utcnow()
        })

        print(f"[STORED] Stored push event: {push_id}")

        # Check evaluation mode
        evaluation_mode = project.get("evaluation_mode", "manual")

        if evaluation_mode == "manual":
            print(f"[MANUAL] Project in manual mode - skipping AI analysis")
            await db["push_events"].update_one(
                {"push_id": push_id},
                {"$set": {"status": "pending_manual_review"}}
            )
            return {
                "success": True,
                "message": "Push event stored for manual review",
                "push_id": push_id,
                "project_id": project["project_id"],
                "tracked_commits": len(tracked_commits),
                "evaluation_mode": "manual",
                "status": "pending_manual_review"
            }

        # Agentic mode - trigger AI workflow in background
        print(f"[AGENTIC] Triggering AI analysis workflow in background...")

        import asyncio
        from app.services.ai_workflow import ai_workflow_service

        project_context = {
            "freelancer": tracked_developer,
            "repo": repo_full_name,
            "wallet_address": project.get("wallet_address", ""),
            "freelance_alias": project.get("freelance_alias", "")
        }

        # Run workflow in background so GitHub gets a fast 200 response
        asyncio.create_task(
            ai_workflow_service.run_analysis_workflow(
                push_id=push_id,
                project_id=project["project_id"],
                commits_details=commits_details,
                project_context=project_context
            )
        )

        return {
            "success": True,
            "message": "Push event received, analysis running in background",
            "push_id": push_id,
            "project_id": project["project_id"],
            "tracked_commits": len(tracked_commits),
            "evaluation_mode": "agentic",
            "status": "processing"
        }

    except Exception as e:
        print(f"[ERROR] Error processing webhook: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing webhook: {str(e)}")


@router.get("/test")
async def test_webhook():
    """Test endpoint to verify webhook URL is accessible"""
    return {
        "status": "ok",
        "message": "Webhook endpoint is working",
        "timestamp": datetime.utcnow().isoformat()
    }
