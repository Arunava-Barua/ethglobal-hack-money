# Testing Guide - GitHub App & Webhook Flow

Complete testing guide for the GitHub App installation and webhook system.

---

## 🚀 Quick Start Testing

### 1. Start Backend

```bash
# Install dependencies (first time only)
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your values

# Run backend
uvicorn app.main:app --reload
```

Backend should be running at: `http://localhost:8000`

Visit: `http://localhost:8000/docs` for API documentation

---

## 📋 Test Scenarios

### Scenario 1: Test GitHub App Installation

**Step 1: Simulate Installation Callback**

After user installs GitHub App, they get redirected to:
```
https://your-frontend.com/callback?installation_id=12345678&setup_action=install
```

Test the callback endpoint:
```bash
curl -X POST "http://localhost:8000/api/github/installation/callback?installation_id=YOUR_INSTALLATION_ID&setup_action=install"
```

**Expected Response:**
```json
{
  "success": true,
  "installation_id": "12345678",
  "setup_action": "install",
  "repos_accessible": 5,
  "message": "Installation recorded successfully",
  "next_step": "Create a project using POST /api/projects/"
}
```

---

### Scenario 2: Verify Installation

**Test if installation ID is valid:**

```bash
curl http://localhost:8000/api/github/installation/YOUR_INSTALLATION_ID/verify
```

**Expected Response:**
```json
{
  "success": true,
  "installation_id": "12345678",
  "token_generated": true,
  "repos_accessible": 5,
  "message": "Installation is valid and working"
}
```

---

### Scenario 3: List Accessible Repositories

**Check which repos the app can access:**

```bash
curl http://localhost:8000/api/github/installation/YOUR_INSTALLATION_ID/repos
```

**Expected Response:**
```json
{
  "success": true,
  "installation_id": "12345678",
  "total_repos": 2,
  "repositories": [
    {
      "id": 123,
      "name": "my-repo",
      "full_name": "username/my-repo",
      "private": false,
      "html_url": "https://github.com/username/my-repo"
    }
  ]
}
```

---

### Scenario 4: Create Project with Webhook

**Create a project (this auto-registers webhook):**

```bash
curl -X POST http://localhost:8000/api/projects/ \
  -H "Content-Type: application/json" \
  -d '{
    "github_repo_url": "https://github.com/username/repo",
    "freelancer_github_username": "developer123",
    "freelancer_wallet_address": "0x1234567890abcdef",
    "conversation": "Build authentication feature, budget $500",
    "installation_id": "YOUR_INSTALLATION_ID"
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

---

### Scenario 5: Test Webhook Endpoint

**Test if webhook endpoint is accessible:**

```bash
curl http://localhost:8000/api/webhooks/test
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Webhook endpoint is working",
  "timestamp": "2024-01-15T10:30:00.000000"
}
```

---

### Scenario 6: Simulate GitHub Push Event

**Option A: Use the test script**

1. Edit `test_webhook.py` with your values:
```python
WEBHOOK_URL = "http://localhost:8000/api/webhooks/github"
REPO_OWNER = "your-username"
REPO_NAME = "your-repo"
DEVELOPER_USERNAME = "developer123"
WEBHOOK_SECRET = "your_secret_from_env"
```

2. Run the script:
```bash
python test_webhook.py
```

**Option B: Manual curl**

```bash
# First, generate the signature (use Python)
python3 << EOF
import hmac
import hashlib
import json

payload = {
  "ref": "refs/heads/main",
  "repository": {
    "full_name": "username/repo",
    "name": "repo",
    "owner": {"name": "username"}
  },
  "pusher": {"name": "developer123"},
  "commits": [
    {
      "id": "abc123",
      "message": "Add login feature",
      "author": {"username": "developer123"}
    }
  ]
}

payload_json = json.dumps(payload)
secret = "your_webhook_secret"

signature = "sha256=" + hmac.new(
    secret.encode(),
    payload_json.encode(),
    hashlib.sha256
).hexdigest()

print(f"Signature: {signature}")
print(f"Payload: {payload_json}")
EOF

# Then send the webhook
curl -X POST http://localhost:8000/api/webhooks/github \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: push" \
  -H "X-Hub-Signature-256: sha256=YOUR_GENERATED_SIGNATURE" \
  -d '{
    "ref": "refs/heads/main",
    "repository": {
      "full_name": "username/repo",
      "name": "repo",
      "owner": {"name": "username"}
    },
    "pusher": {"name": "developer123"},
    "commits": [
      {
        "id": "abc123",
        "message": "Add login feature",
        "author": {"username": "developer123"}
      }
    ]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Push event processed",
  "push_id": "push_1234567890.123",
  "project_id": "proj_abc123",
  "tracked_commits": 1,
  "status": "pending_analysis"
}
```

---

### Scenario 7: Check Webhook Deliveries

**View recent webhook events:**

```bash
curl http://localhost:8000/api/github/webhooks/deliveries
```

**Expected Response:**
```json
{
  "success": true,
  "total_events": 3,
  "events": [
    {
      "push_id": "push_123",
      "project_id": "proj_abc",
      "tracked_developer": "developer123",
      "commit_shas": ["abc123"],
      "status": "pending_analysis",
      "created_at": "2024-01-15T10:30:00"
    }
  ]
}
```

**View specific webhook delivery:**

```bash
curl http://localhost:8000/api/github/webhooks/deliveries/push_123
```

---

### Scenario 8: Get Commit Details

**Fetch detailed commit info with diff:**

```bash
curl "http://localhost:8000/api/github/commit/owner/repo/abc123?installation_id=YOUR_INSTALLATION_ID"
```

**Expected Response:**
```json
{
  "success": true,
  "commit": {
    "sha": "abc123",
    "author": "Developer Name",
    "author_github": "developer123",
    "message": "Add login feature",
    "timestamp": "2024-01-15T10:30:00Z",
    "additions": 120,
    "deletions": 15,
    "changed_files": 3,
    "diff": "diff --git a/file.py...",
    "files_changed": [...]
  }
}
```

---

### Scenario 9: Check System Stats

**Get overall statistics:**

```bash
curl http://localhost:8000/api/github/stats
```

**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "total_installations": 5,
    "total_projects": 10,
    "total_push_events": 50,
    "total_commit_analyses": 45
  },
  "recent_activity": [...]
}
```

---

## 🧪 Complete Test Flow

**End-to-End Testing:**

```bash
#!/bin/bash

# 1. Test health
echo "1. Testing health..."
curl http://localhost:8000/health

# 2. Verify installation
echo -e "\n2. Verifying installation..."
curl http://localhost:8000/api/github/installation/YOUR_ID/verify

# 3. Create project
echo -e "\n3. Creating project..."
PROJECT_RESPONSE=$(curl -X POST http://localhost:8000/api/projects/ \
  -H "Content-Type: application/json" \
  -d '{
    "github_repo_url": "https://github.com/owner/repo",
    "freelancer_github_username": "dev123",
    "freelancer_wallet_address": "0x1234",
    "conversation": "Test project",
    "installation_id": "YOUR_ID"
  }')

echo $PROJECT_RESPONSE

# Extract project_id (requires jq)
PROJECT_ID=$(echo $PROJECT_RESPONSE | jq -r '.project_id')

# 4. Simulate webhook
echo -e "\n4. Sending test webhook..."
python test_webhook.py

# 5. Check webhook deliveries
echo -e "\n5. Checking webhook deliveries..."
curl http://localhost:8000/api/github/webhooks/deliveries

# 6. Check stats
echo -e "\n6. Checking stats..."
curl http://localhost:8000/api/github/stats

echo -e "\n✅ All tests complete!"
```

---

## 🐛 Debugging

### Enable Debug Logging

Add to `.env`:
```env
LOG_LEVEL=DEBUG
```

Or in code:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Check MongoDB

```python
# In Python console
from app.database import get_database
import asyncio

async def check_db():
    db = get_database()

    # Check collections
    collections = await db.list_collection_names()
    print("Collections:", collections)

    # Check projects
    projects = await db["projects"].find().to_list(length=10)
    print("Projects:", projects)

    # Check push events
    events = await db["push_events"].find().to_list(length=10)
    print("Events:", events)

asyncio.run(check_db())
```

### View Raw Webhook Data

Add print statements in `app/routes/webhooks.py`:

```python
@router.post("/github")
async def handle_github_webhook(request: Request):
    payload = await request.json()

    # DEBUG: Print everything
    print("=" * 50)
    print("WEBHOOK RECEIVED")
    print("=" * 50)
    print(json.dumps(payload, indent=2))
    print("=" * 50)

    # ... rest of code
```

### Test Signature Verification

```bash
curl -X POST http://localhost:8000/api/github/test-webhook-signature \
  -H "Content-Type: application/json" \
  -d '{
    "payload": "test payload",
    "signature": "sha256=abc123",
    "secret": "your_secret"
  }'
```

---

## 📊 Expected Database Schema

After running tests, your MongoDB should have:

**Collections:**
- `installations` - GitHub App installations
- `projects` - Created projects
- `push_events` - Webhook deliveries
- `commit_analyses` - AI analysis results (future)

**Sample Project Document:**
```json
{
  "project_id": "proj_abc123",
  "github_repo_url": "https://github.com/owner/repo",
  "repo_owner": "owner",
  "repo_name": "repo",
  "freelancer_github_username": "dev123",
  "freelancer_wallet_address": "0x1234",
  "installation_id": "12345678",
  "earned_pending": 0.0,
  "status": "active",
  "created_at": "2024-01-15T10:00:00"
}
```

**Sample Push Event Document:**
```json
{
  "push_id": "push_1234567890.123",
  "project_id": "proj_abc123",
  "repo": "owner/repo",
  "tracked_developer": "dev123",
  "commit_shas": ["abc123"],
  "commits_details": [
    {
      "sha": "abc123",
      "message": "Add feature",
      "diff": "...",
      "additions": 50,
      "deletions": 10
    }
  ],
  "status": "pending_analysis",
  "created_at": "2024-01-15T10:30:00"
}
```

---

## ✅ Success Criteria

Your setup is working correctly if:

- ✅ Backend starts without errors
- ✅ Can verify installation ID
- ✅ Can list accessible repositories
- ✅ Can create project with webhook
- ✅ Webhook endpoint is accessible
- ✅ Can simulate push events successfully
- ✅ Commits are filtered by tracked developer
- ✅ Commit diffs are fetched from GitHub API
- ✅ Data is stored in MongoDB

---

## 🔄 Next Steps

After all tests pass:

1. Deploy backend to production
2. Update GitHub App webhook URL
3. Test with real push events
4. Integrate AI analysis workflow (LangGraph)
5. Add payout logic
6. Connect smart contracts

---

## 📞 Common Issues

### Issue: "Private key not found"
**Solution:** Make sure `.pem` file is in backend directory

### Issue: "MongoDB connection failed"
**Solution:** Check MONGODB_URL in `.env`

### Issue: "Invalid signature"
**Solution:** Ensure GITHUB_WEBHOOK_SECRET matches

### Issue: "Installation not found"
**Solution:** Use correct installation_id from GitHub

### Issue: "No commits found"
**Solution:** Check freelancer_github_username matches commit author

---

## 🎯 API Reference

All endpoints documented at: `http://localhost:8000/docs`

Key endpoints:
- `POST /api/projects/` - Create project
- `POST /api/webhooks/github` - Receive webhooks
- `GET /api/github/installation/{id}/verify` - Verify installation
- `GET /api/github/webhooks/deliveries` - View webhook history
- `GET /api/github/stats` - System statistics
