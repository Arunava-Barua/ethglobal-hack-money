"""
Webhook Testing Utilities

Use these functions to simulate GitHub webhook events for testing.
"""

import hmac
import hashlib
import json
from datetime import datetime
from typing import Dict, List


def generate_webhook_signature(payload: str, secret: str) -> str:
    """
    Generate GitHub webhook signature for testing.

    Args:
        payload: JSON string of the webhook payload
        secret: Webhook secret from environment

    Returns:
        Signature string with sha256= prefix
    """
    signature = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return f"sha256={signature}"


def create_push_event_payload(
    repo_owner: str,
    repo_name: str,
    pusher_username: str,
    commits: List[Dict],
    ref: str = "refs/heads/main"
) -> Dict:
    """
    Create a realistic GitHub push event payload for testing.

    Args:
        repo_owner: Repository owner username
        repo_name: Repository name
        pusher_username: Username of person who pushed
        commits: List of commit dictionaries
        ref: Git ref (default: refs/heads/main)

    Returns:
        Complete webhook payload dictionary

    Example:
        payload = create_push_event_payload(
            repo_owner="owner",
            repo_name="repo",
            pusher_username="dev123",
            commits=[
                {
                    "sha": "abc123",
                    "message": "Add login feature",
                    "author_username": "dev123"
                }
            ]
        )
    """

    formatted_commits = []
    for commit in commits:
        formatted_commits.append({
            "id": commit.get("sha", "abc123def456"),
            "message": commit.get("message", "Commit message"),
            "timestamp": commit.get("timestamp", datetime.utcnow().isoformat()),
            "author": {
                "name": commit.get("author_name", "Developer Name"),
                "email": commit.get("author_email", "dev@example.com"),
                "username": commit.get("author_username", pusher_username)
            },
            "added": commit.get("added", []),
            "modified": commit.get("modified", []),
            "removed": commit.get("removed", [])
        })

    payload = {
        "ref": ref,
        "before": "0000000000000000000000000000000000000000",
        "after": formatted_commits[-1]["id"] if formatted_commits else "abc123",
        "repository": {
            "id": 123456,
            "name": repo_name,
            "full_name": f"{repo_owner}/{repo_name}",
            "private": False,
            "owner": {
                "name": repo_owner,
                "email": f"{repo_owner}@example.com"
            },
            "html_url": f"https://github.com/{repo_owner}/{repo_name}",
            "description": "Test repository"
        },
        "pusher": {
            "name": pusher_username,
            "email": f"{pusher_username}@example.com"
        },
        "sender": {
            "login": pusher_username,
            "id": 12345
        },
        "created": False,
        "deleted": False,
        "forced": False,
        "compare": f"https://github.com/{repo_owner}/{repo_name}/compare/abc123...def456",
        "commits": formatted_commits,
        "head_commit": formatted_commits[-1] if formatted_commits else None
    }

    return payload


def send_test_webhook(
    webhook_url: str,
    repo_owner: str,
    repo_name: str,
    developer_username: str,
    webhook_secret: str,
    commit_message: str = "Test commit"
):
    """
    Send a test webhook to your backend.

    Example:
        send_test_webhook(
            webhook_url="http://localhost:8000/api/webhooks/github",
            repo_owner="owner",
            repo_name="repo",
            developer_username="dev123",
            webhook_secret="your_secret",
            commit_message="Add authentication feature"
        )
    """
    import httpx

    # Create payload
    payload = create_push_event_payload(
        repo_owner=repo_owner,
        repo_name=repo_name,
        pusher_username=developer_username,
        commits=[
            {
                "sha": "abc123def456",
                "message": commit_message,
                "author_username": developer_username,
                "added": ["src/auth.py"],
                "modified": ["src/app.py"]
            }
        ]
    )

    payload_json = json.dumps(payload)
    signature = generate_webhook_signature(payload_json, webhook_secret)

    # Send request
    response = httpx.post(
        webhook_url,
        content=payload_json,
        headers={
            "Content-Type": "application/json",
            "X-GitHub-Event": "push",
            "X-Hub-Signature-256": signature,
            "X-GitHub-Delivery": "test-delivery-id"
        }
    )

    return {
        "status_code": response.status_code,
        "response": response.json(),
        "payload": payload,
        "signature": signature
    }


if __name__ == "__main__":
    # Example usage
    print("Webhook Tester Utility")
    print("======================")
    print()
    print("Example 1: Generate payload")
    payload = create_push_event_payload(
        repo_owner="testowner",
        repo_name="testrepo",
        pusher_username="developer123",
        commits=[
            {
                "sha": "abc123",
                "message": "Add login feature",
                "author_username": "developer123"
            }
        ]
    )
    print(json.dumps(payload, indent=2))

    print()
    print("Example 2: Generate signature")
    payload_json = json.dumps(payload)
    signature = generate_webhook_signature(payload_json, "your_secret_here")
    print(f"Signature: {signature}")
