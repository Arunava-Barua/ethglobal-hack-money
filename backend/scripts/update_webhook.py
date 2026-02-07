"""
Script to update GitHub webhook URL programmatically

Usage:
    python scripts/update_webhook.py <new_webhook_url>

Example:
    python scripts/update_webhook.py https://new-tunnel.trycloudflare.com/api/webhooks/github
"""

import sys
import os
import httpx
import jwt
import time
from pathlib import Path
from dotenv import load_dotenv

# Load environment
load_dotenv()

GITHUB_APP_ID = os.getenv("GITHUB_APP_ID")
GITHUB_PRIVATE_KEY_PATH = os.getenv("GITHUB_PRIVATE_KEY_PATH")
INSTALLATION_ID = "108489420"  # Your installation ID
REPO_OWNER = "AnkurKumarShukla"
REPO_NAME = "ethonlinetestrepo"


def generate_jwt():
    """Generate JWT for GitHub App authentication"""
    with open(GITHUB_PRIVATE_KEY_PATH, 'r') as f:
        private_key = f.read()

    now = int(time.time())
    payload = {
        "iat": now,
        "exp": now + 600,  # 10 minutes
        "iss": GITHUB_APP_ID
    }

    return jwt.encode(payload, private_key, algorithm="RS256")


async def get_installation_token(jwt_token):
    """Get installation access token"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://api.github.com/app/installations/{INSTALLATION_ID}/access_tokens",
            headers={
                "Authorization": f"Bearer {jwt_token}",
                "Accept": "application/vnd.github+json"
            }
        )
        response.raise_for_status()
        return response.json()["token"]


async def list_webhooks(token):
    """List all webhooks for the repository"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/hooks",
            headers={
                "Authorization": f"token {token}",
                "Accept": "application/vnd.github+json"
            }
        )
        response.raise_for_status()
        return response.json()


async def update_webhook(token, webhook_id, new_url):
    """Update webhook URL"""
    async with httpx.AsyncClient() as client:
        response = await client.patch(
            f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/hooks/{webhook_id}",
            headers={
                "Authorization": f"token {token}",
                "Accept": "application/vnd.github+json"
            },
            json={
                "config": {
                    "url": new_url,
                    "content_type": "json",
                    "insecure_ssl": "0"
                }
            }
        )
        response.raise_for_status()
        return response.json()


async def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/update_webhook.py <new_webhook_url>")
        print("Example: python scripts/update_webhook.py https://new-tunnel.trycloudflare.com/api/webhooks/github")
        sys.exit(1)

    new_url = sys.argv[1]

    if not new_url.endswith("/api/webhooks/github"):
        print("Warning: URL should end with /api/webhooks/github")
        print(f"You provided: {new_url}")
        response = input("Continue anyway? (y/n): ")
        if response.lower() != 'y':
            sys.exit(0)

    print("\n" + "="*60)
    print("GitHub Webhook Updater")
    print("="*60)

    # Step 1: Generate JWT
    print("\n[1/4] Generating JWT...")
    jwt_token = generate_jwt()
    print("      JWT generated ✓")

    # Step 2: Get installation token
    print("\n[2/4] Getting installation token...")
    token = await get_installation_token(jwt_token)
    print("      Installation token obtained ✓")

    # Step 3: List existing webhooks
    print("\n[3/4] Listing existing webhooks...")
    webhooks = await list_webhooks(token)

    if not webhooks:
        print("      No webhooks found!")
        print("\n      Create a webhook manually first:")
        print(f"      URL: {new_url}")
        print(f"      Content type: application/json")
        print(f"      Events: push")
        sys.exit(1)

    print(f"      Found {len(webhooks)} webhook(s)")
    for wh in webhooks:
        print(f"      - ID: {wh['id']}")
        print(f"        Current URL: {wh['config']['url']}")
        print(f"        Events: {', '.join(wh['events'])}")

    # Step 4: Update webhook
    print("\n[4/4] Updating webhook URL...")
    webhook_id = webhooks[0]["id"]  # Update the first webhook
    updated = await update_webhook(token, webhook_id, new_url)

    print("      Webhook updated successfully ✓")
    print(f"\n      New URL: {updated['config']['url']}")
    print(f"      Webhook ID: {updated['id']}")
    print(f"      Events: {', '.join(updated['events'])}")

    print("\n" + "="*60)
    print("✓ Done! Webhook URL updated")
    print("="*60)


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
