import jwt
import time
import httpx
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from pathlib import Path
from app.config import get_settings

settings = get_settings()


class GitHubService:
    def __init__(self):
        self.app_id = settings.github_app_id
        self.private_key_path = settings.github_private_key_path
        self.private_key = self._load_private_key()
        self.token_cache: Dict[str, Dict] = {}  # Cache tokens by installation_id

    def _load_private_key(self) -> str:
        """Load GitHub App private key from file"""
        key_path = Path(self.private_key_path)
        if not key_path.exists():
            raise FileNotFoundError(f"Private key not found at: {self.private_key_path}")
        return key_path.read_text()

    def _generate_jwt(self) -> str:
        """Generate JWT for GitHub App authentication"""
        now = int(time.time()) - 60  # Subtract 60s to handle clock skew
        payload = {
            "iat": now,
            "exp": now + 300,  # 5 minutes (safe margin under 10 min max)
            "iss": self.app_id
        }
        return jwt.encode(payload, self.private_key, algorithm="RS256")

    async def get_installation_token(self, installation_id: str) -> str:
        """Get installation access token (cached for 1 hour)"""
        # Check cache
        if installation_id in self.token_cache:
            cached = self.token_cache[installation_id]
            if datetime.utcnow() < cached["expires_at"]:
                return cached["token"]

        # Generate new token
        jwt_token = self._generate_jwt()
        url = f"https://api.github.com/app/installations/{installation_id}/access_tokens"

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                headers={
                    "Authorization": f"Bearer {jwt_token}",
                    "Accept": "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28"
                }
            )
            response.raise_for_status()
            data = response.json()

            # Cache token
            self.token_cache[installation_id] = {
                "token": data["token"],
                "expires_at": datetime.utcnow() + timedelta(minutes=50)  # Refresh before 1hr expiry
            }

            return data["token"]

    async def list_installation_repositories(self, installation_id: str) -> List[Dict]:
        """List all repositories accessible by the installation"""
        token = await self.get_installation_token(installation_id)
        url = "https://api.github.com/installation/repositories"

        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                headers={
                    "Authorization": f"token {token}",
                    "Accept": "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28"
                }
            )
            response.raise_for_status()
            return response.json()["repositories"]

    async def get_commit_details(self, installation_id: str, owner: str, repo: str, sha: str) -> Dict:
        """Get detailed information about a specific commit including diff"""
        token = await self.get_installation_token(installation_id)
        url = f"https://api.github.com/repos/{owner}/{repo}/commits/{sha}"

        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                headers={
                    "Authorization": f"token {token}",
                    "Accept": "application/vnd.github.diff",  # Get diff format
                    "X-GitHub-Api-Version": "2022-11-28"
                }
            )
            response.raise_for_status()
            diff = response.text

            # Also get JSON data
            response = await client.get(
                url,
                headers={
                    "Authorization": f"token {token}",
                    "Accept": "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28"
                }
            )
            response.raise_for_status()
            commit_data = response.json()

            return {
                "sha": commit_data["sha"],
                "author": commit_data["commit"]["author"]["name"],
                "author_github": commit_data["author"]["login"] if commit_data.get("author") else None,
                "message": commit_data["commit"]["message"],
                "timestamp": commit_data["commit"]["author"]["date"],
                "additions": commit_data["stats"]["additions"],
                "deletions": commit_data["stats"]["deletions"],
                "changed_files": len(commit_data["files"]),
                "diff": diff,
                "files_changed": commit_data["files"]
            }

    async def get_batch_commits(self, installation_id: str, owner: str, repo: str, commit_shas: List[str]) -> List[Dict]:
        """Get details for multiple commits"""
        commits_details = []
        for sha in commit_shas:
            try:
                commit = await self.get_commit_details(installation_id, owner, repo, sha)
                commits_details.append(commit)
            except Exception as e:
                print(f"Error fetching commit {sha}: {e}")
                continue
        return commits_details

    async def create_webhook(self, installation_id: str, owner: str, repo: str, webhook_url: str) -> Dict:
        """Create a webhook for push events on the repository"""
        token = await self.get_installation_token(installation_id)
        url = f"https://api.github.com/repos/{owner}/{repo}/hooks"

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                headers={
                    "Authorization": f"token {token}",
                    "Accept": "application/vnd.github+json",
                    "X-GitHub-Api-Version": "2022-11-28"
                },
                json={
                    "name": "web",
                    "active": True,
                    "events": ["push"],
                    "config": {
                        "url": webhook_url,
                        "content_type": "json",
                        "secret": settings.github_webhook_secret,
                        "insecure_ssl": "0"
                    }
                }
            )
            response.raise_for_status()
            return response.json()


# Singleton instance
github_service = GitHubService()
