# GitHub App Installation & Webhook Flow

Complete guide for GitHub App installation and webhook integration.

---

## 📋 Overview

```
User installs GitHub App on their repo
    ↓
Frontend receives installation_id
    ↓
Frontend sends to Backend API (create project)
    ↓
Backend registers webhook on repo
    ↓
Developer pushes commits
    ↓
GitHub sends webhook to Backend
    ↓
Backend analyzes commits
    ↓
Workflow starts
```

---

## Step 1: GitHub App Installation

### What Happens When User Installs Your App?

1. **User clicks "Install" on your GitHub App page**
   - URL: `https://github.com/apps/starcpay/installations/new`

2. **User selects repositories**
   - All repositories, OR
   - Select specific repositories

3. **GitHub redirects to your callback URL**
   ```
   https://your-frontend-url.com/callback?installation_id=12345678&setup_action=install
   ```

4. **Frontend captures `installation_id`**
   ```javascript
   // In your frontend callback route
   const params = new URLSearchParams(window.location.search);
   const installationId = params.get('installation_id');
   const setupAction = params.get('setup_action');

   // Store this installation_id
   localStorage.setItem('github_installation_id', installationId);
   ```

---

## Step 2: Backend Webhook Registration

### When to Register Webhook?

**Option A: Automatic (Recommended)**
- Backend registers webhook when project is created
- Already implemented in `/api/projects/` endpoint

**Option B: Manual**
- User manually configures webhook in GitHub repo settings

### How Backend Registers Webhook

```python
# This happens automatically in app/routes/projects.py

webhook_url = f"{your_backend_url}/api/webhooks/github"

webhook = await github_service.create_webhook(
    installation_id,
    owner,
    repo_name,
    webhook_url
)
```

---

## Step 3: Webhook Event Flow

### What Happens When Developer Pushes?

```
1. Developer pushes commits to repo
   ↓
2. GitHub detects push event
   ↓
3. GitHub sends POST request to your webhook URL
   POST https://your-backend.com/api/webhooks/github
   ↓
4. Backend receives webhook payload
   ↓
5. Backend verifies signature (security)
   ↓
6. Backend extracts commit data
   ↓
7. Backend filters commits by tracked developer
   ↓
8. Backend fetches commit diffs from GitHub API
   ↓
9. Backend stores data and triggers workflow
```

### Webhook Payload Structure

```json
{
  "ref": "refs/heads/main",
  "before": "abc123...",
  "after": "def456...",
  "repository": {
    "full_name": "owner/repo",
    "name": "repo",
    "owner": {
      "name": "owner"
    }
  },
  "pusher": {
    "name": "developer123",
    "email": "dev@example.com"
  },
  "commits": [
    {
      "id": "abc123def456",
      "message": "Add login feature",
      "author": {
        "name": "Developer Name",
        "email": "dev@example.com",
        "username": "developer123"
      },
      "added": ["src/auth.py"],
      "modified": ["src/app.py"],
      "removed": []
    }
  ]
}
```

---

## Step 4: Backend Processing

### Webhook Handler Logic

```python
# app/routes/webhooks.py

@router.post("/github")
async def handle_github_webhook(request: Request):
    payload = await request.json()

    # 1. Extract data
    repo_full_name = payload["repository"]["full_name"]
    commits = payload["commits"]

    # 2. Find matching project
    project = await db["projects"].find_one({
        "repo_owner": owner,
        "repo_name": repo_name,
        "status": "active"
    })

    # 3. Filter commits by tracked developer
    tracked_commits = [
        commit["id"]
        for commit in commits
        if commit["author"]["username"] == project["freelancer_github_username"]
    ]

    # 4. Fetch detailed commit data with diffs
    commits_details = await github_service.get_batch_commits(
        installation_id,
        owner,
        repo_name,
        tracked_commits
    )

    # 5. Store for AI analysis
    await store_for_workflow(commits_details, project)
```

---

## Step 5: Commit Diff Extraction

### What Backend Fetches for Each Commit

```python
# For each commit, backend fetches:

{
    "sha": "abc123def456",
    "author": "Developer Name",
    "author_github": "developer123",
    "message": "Add login feature",
    "timestamp": "2024-01-15T10:30:00Z",
    "additions": 120,
    "deletions": 15,
    "changed_files": 3,
    "diff": """
        diff --git a/src/auth.py b/src/auth.py
        new file mode 100644
        index 0000000..abc123
        --- /dev/null
        +++ b/src/auth.py
        @@ -0,0 +1,45 @@
        +def login(username, password):
        +    # Login logic
        +    return authenticate(username, password)
    """,
    "files_changed": [
        {
            "filename": "src/auth.py",
            "status": "added",
            "additions": 45,
            "deletions": 0,
            "changes": 45,
            "patch": "..."
        }
    ]
}
```

---

## Testing the Flow

### Test 1: Installation ID Retrieval

**Frontend Callback Handler:**

```javascript
// pages/callback.js or app/callback/page.js

export default function Callback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const installationId = params.get('installation_id');

    if (installationId) {
      console.log('✅ Installation ID:', installationId);

      // Store it
      localStorage.setItem('github_installation_id', installationId);

      // Send to backend or show to user
      alert(`Installation successful! ID: ${installationId}`);

      // Redirect to project setup
      window.location.href = '/projects/new';
    }
  }, []);

  return <div>Processing GitHub App installation...</div>;
}
```

### Test 2: Create Project with Installation ID

```bash
curl -X POST http://localhost:8000/api/projects/ \
  -H "Content-Type: application/json" \
  -d '{
    "github_repo_url": "https://github.com/yourusername/your-repo",
    "freelancer_github_username": "developer123",
    "freelancer_wallet_address": "0x1234567890abcdef",
    "conversation": "Build authentication feature, budget $500",
    "installation_id": "12345678"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "project_id": "proj_abc123",
  "message": "Project created successfully",
  "webhook_created": true,
  "webhook_id": 456789
}
```

### Test 3: Trigger Webhook (Simulate GitHub Push)

```bash
# Send a test webhook payload
curl -X POST http://localhost:8000/api/webhooks/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -H "X-Hub-Signature-256: sha256=YOUR_SIGNATURE" \
  -d '{
    "ref": "refs/heads/main",
    "repository": {
      "full_name": "yourusername/your-repo",
      "name": "your-repo",
      "owner": {
        "name": "yourusername"
      }
    },
    "pusher": {
      "name": "developer123"
    },
    "commits": [
      {
        "id": "abc123def456",
        "message": "Add login feature",
        "author": {
          "name": "Developer Name",
          "username": "developer123"
        }
      }
    ]
  }'
```

---

## Common Issues & Solutions

### Issue 1: Installation ID Not Received

**Problem:** Frontend doesn't receive `installation_id` after installation.

**Solution:**
1. Check GitHub App settings → "Setup URL"
2. Should be: `https://your-frontend.com/callback`
3. Make sure callback route exists in frontend

### Issue 2: Webhook Not Triggering

**Problem:** No webhook events received when developer pushes.

**Solution:**
1. Check webhook is registered:
   ```bash
   curl -X GET https://api.github.com/repos/owner/repo/hooks \
     -H "Authorization: token YOUR_INSTALLATION_TOKEN"
   ```

2. Check webhook deliveries in GitHub:
   - Go to repo → Settings → Webhooks
   - Click on your webhook
   - See "Recent Deliveries"

3. Check webhook URL is correct and accessible

### Issue 3: Commits Not Filtered

**Problem:** Backend doesn't find commits by tracked developer.

**Solution:**
1. Check username matching is case-insensitive
2. Verify `commit["author"]["username"]` exists in payload
3. Some commits might not have GitHub username (git email only)

### Issue 4: Cannot Fetch Commit Diffs

**Problem:** GitHub API returns 404 for commit details.

**Solution:**
1. Verify installation token has `contents:read` permission
2. Check GitHub App permissions in app settings
3. Ensure repository is accessible by the installation

---

## Security Considerations

### 1. Webhook Signature Verification

```python
# Already implemented in webhooks.py

def verify_github_signature(payload: bytes, signature: str, secret: str) -> bool:
    expected_signature = "sha256=" + hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(expected_signature, signature)
```

### 2. Installation Token Security

- ✅ Tokens are cached for 1 hour
- ✅ Tokens are scoped to specific repositories
- ✅ Tokens auto-refresh when expired
- ✅ Private key never exposed to client

### 3. Environment Variables

Never expose:
- ❌ GitHub App private key
- ❌ Webhook secret
- ❌ MongoDB connection string

Always use backend API routes for GitHub operations.

---

## Monitoring & Debugging

### Enable Detailed Logging

```python
# Add to webhooks.py

import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@router.post("/github")
async def handle_github_webhook(request: Request):
    payload = await request.json()

    # Log everything
    logger.debug(f"Webhook received: {json.dumps(payload, indent=2)}")
    logger.debug(f"Signature: {x_hub_signature_256}")
    logger.debug(f"Event type: {x_github_event}")
```

### Check Webhook Status

```bash
# Test webhook endpoint
curl http://localhost:8000/api/webhooks/test
```

### View Stored Push Events

```python
# Add route to view push events (for debugging)

@router.get("/api/webhooks/events")
async def list_push_events():
    db = get_database()
    events = await db["push_events"].find().sort("created_at", -1).limit(10).to_list(length=10)
    return events
```

---

## Next Steps

After this flow is working:

1. ✅ **GitHub App Installation** - Done
2. ✅ **Webhook Registration** - Done
3. ✅ **Commit Filtering** - Done
4. ✅ **Diff Extraction** - Done
5. 🔄 **AI Analysis Workflow** - Next Phase
6. 🔄 **Payout Logic** - Next Phase
7. 🔄 **Smart Contract Integration** - Next Phase

---

## Quick Reference

### GitHub App Permissions Required

- ✅ Repository contents: Read
- ✅ Repository metadata: Read
- ✅ Repository webhooks: Read & write
- ✅ Repository administration: Read & write (for webhook creation)

### Webhook Events to Subscribe

- ✅ Push

### Environment Variables Needed

```env
GITHUB_APP_ID=2810915
GITHUB_PRIVATE_KEY_PATH=./starcpay.2026-02-06.private-key.pem
GITHUB_WEBHOOK_SECRET=your_random_secret
```

### Important URLs

- **GitHub App Settings**: `https://github.com/settings/apps/starcpay`
- **Installation URL**: `https://github.com/apps/starcpay/installations/new`
- **Webhook Deliveries**: `Repo → Settings → Webhooks → Recent Deliveries`
