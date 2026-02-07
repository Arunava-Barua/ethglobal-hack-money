# Automated Setup - No Manual GitHub Steps!

Complete setup without touching GitHub UI manually.

---

## 🚀 Fully Automated Flow

### Step 1: Setup Backend

```bash
cd backend

# Install
pip install -r requirements.txt

# Configure .env
cp .env.example .env
# Edit .env with your values

# Add private key
# Place starcpay.2026-02-06.private-key.pem in backend folder

# Start backend
uvicorn app.main:app --reload
```

---

### Step 2: Start ngrok (for local testing)

```bash
# In another terminal
ngrok http 8000
```

**Copy your ngrok URL:** `https://abc123.ngrok.io`

---

### Step 3: Install GitHub App

Install your app on a test repo:
- Go to: https://github.com/apps/starcpay
- Click "Install"
- Select repository
- After install, grab `installation_id` from URL

---

### Step 4: Create Project with Webhook

```bash
# This creates project AND registers webhook automatically
curl -X POST http://localhost:8000/api/projects/ \
  -H "Content-Type: application/json" \
  -d '{
    "github_repo_url": "https://github.com/username/repo",
    "freelancer_github_username": "developer123",
    "freelancer_wallet_address": "0x1234567890",
    "conversation": "Testing",
    "installation_id": "YOUR_INSTALLATION_ID"
  }'
```

**Response:**
```json
{
  "success": true,
  "project_id": "proj_abc123",
  "webhook_created": true,
  "webhook_id": 456789
}
```

**Save that `project_id`!**

---

### Step 5: Update Webhook URL to ngrok (AUTOMATED! 🎉)

**Instead of manually going to GitHub → Settings → Webhooks:**

```bash
curl -X POST http://localhost:8000/api/webhook-manager/update \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "proj_abc123",
    "new_webhook_url": "https://abc123.ngrok.io/api/webhooks/github"
  }'
```

**Or use the script:**

```bash
./update_webhook_url.sh proj_abc123 https://abc123.ngrok.io/api/webhooks/github
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook URL updated successfully",
  "old_url": "http://localhost:3000/api/webhooks/github",
  "new_url": "https://abc123.ngrok.io/api/webhooks/github",
  "webhook_id": 456789
}
```

✅ **Done! No manual GitHub UI steps!**

---

### Step 6: Push & See Commits!

```bash
cd your-repo

echo "test" >> file.txt
git add .
git commit -m "Test commit"
git push
```

**Check commits received:**

```bash
curl http://localhost:8000/api/github/webhooks/deliveries | jq
```

---

## 🔥 All Webhook Management Routes

### 1. Update Webhook URL

```bash
curl -X POST http://localhost:8000/api/webhook-manager/update \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "proj_abc123",
    "new_webhook_url": "https://new-url.com/api/webhooks/github"
  }'
```

**Use cases:**
- Switch from localhost to ngrok
- Update when deploying to production
- Change ngrok URL (ngrok URLs change on restart)

---

### 2. List Webhooks

```bash
curl http://localhost:8000/api/webhook-manager/list/proj_abc123
```

**Response:**
```json
{
  "success": true,
  "project_id": "proj_abc123",
  "repo": "username/repo",
  "total_webhooks": 1,
  "webhooks": [
    {
      "id": 456789,
      "url": "https://abc123.ngrok.io/api/webhooks/github",
      "events": ["push"],
      "active": true,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### 3. Test Webhook (Send Ping)

```bash
curl -X POST http://localhost:8000/api/webhook-manager/test/proj_abc123
```

**This sends a test ping from GitHub to your webhook.**

Check your backend logs - you'll see the ping!

---

### 4. Create New Webhook

```bash
curl -X POST http://localhost:8000/api/webhook-manager/create \
  -H "Content-Type: application/json" \
  -d '{
    "installation_id": "12345678",
    "repo_owner": "username",
    "repo_name": "repo",
    "webhook_url": "https://abc123.ngrok.io/api/webhooks/github"
  }'
```

**Use if webhook wasn't created during project setup.**

---

### 5. Delete Webhook

```bash
curl -X DELETE http://localhost:8000/api/webhook-manager/delete/proj_abc123
```

---

## 🎯 Complete Automated Script

Save as `setup_and_test.sh`:

```bash
#!/bin/bash

# Complete automated setup script

set -e  # Exit on error

BACKEND_URL="http://localhost:8000"
INSTALLATION_ID="YOUR_INSTALLATION_ID"
REPO_URL="https://github.com/username/repo"
DEVELOPER="developer123"
WALLET="0x1234567890"

echo "🚀 Automated GitHub App Setup"
echo "================================"

# Wait for ngrok
read -p "Start ngrok in another terminal, then paste ngrok URL here: " NGROK_URL

# Remove trailing slash
NGROK_URL=${NGROK_URL%/}

echo ""
echo "1️⃣ Creating project with webhook..."
PROJECT_RESPONSE=$(curl -s -X POST $BACKEND_URL/api/projects/ \
  -H "Content-Type: application/json" \
  -d "{
    \"github_repo_url\": \"$REPO_URL\",
    \"freelancer_github_username\": \"$DEVELOPER\",
    \"freelancer_wallet_address\": \"$WALLET\",
    \"conversation\": \"Automated test\",
    \"installation_id\": \"$INSTALLATION_ID\"
  }")

echo $PROJECT_RESPONSE | jq
PROJECT_ID=$(echo $PROJECT_RESPONSE | jq -r '.project_id')

if [ "$PROJECT_ID" == "null" ]; then
    echo "❌ Failed to create project"
    exit 1
fi

echo ""
echo "✅ Project created: $PROJECT_ID"

echo ""
echo "2️⃣ Updating webhook URL to ngrok..."
UPDATE_RESPONSE=$(curl -s -X POST $BACKEND_URL/api/webhook-manager/update \
  -H "Content-Type: application/json" \
  -d "{
    \"project_id\": \"$PROJECT_ID\",
    \"new_webhook_url\": \"$NGROK_URL/api/webhooks/github\"
  }")

echo $UPDATE_RESPONSE | jq

if echo $UPDATE_RESPONSE | jq -e '.success' > /dev/null; then
    echo ""
    echo "✅ Webhook URL updated!"
else
    echo ""
    echo "❌ Failed to update webhook"
    exit 1
fi

echo ""
echo "3️⃣ Testing webhook ping..."
TEST_RESPONSE=$(curl -s -X POST $BACKEND_URL/api/webhook-manager/test/$PROJECT_ID)
echo $TEST_RESPONSE | jq

echo ""
echo "================================"
echo "✅ Setup Complete!"
echo ""
echo "Project ID: $PROJECT_ID"
echo "Webhook URL: $NGROK_URL/api/webhooks/github"
echo ""
echo "Now push to your repo and commits will be tracked!"
echo ""
echo "View commits:"
echo "  curl $BACKEND_URL/api/github/webhooks/deliveries | jq"
