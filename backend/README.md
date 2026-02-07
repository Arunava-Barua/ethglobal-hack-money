# StarCPay Backend

AI-powered payment system for GitHub freelancers. Automatically analyzes commits and determines fair payouts.

---

## Overview

StarCPay monitors GitHub repositories, analyzes developer commits using AI, and automatically handles payments when thresholds are met.

### Core Features

- ✅ **GitHub App Integration**: Authenticate and access repositories
- ✅ **Webhook System**: Real-time commit tracking
- ✅ **Commit Analysis**: Extract and analyze code changes with full diffs
- ✅ **Project Management API**: Track freelancers, repos, and budgets
- ✅ **Webhook Management API**: Programmatically create/update/delete webhooks
- ✅ **MongoDB Storage**: Persistent data storage
- 🚧 **AI Workflow**: Ready for LLM integration (Claude/OpenAI/Gemini)

---

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env  # Edit with your values

# Run server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Server: http://localhost:8000
API Docs: http://localhost:8000/docs

---

## API Endpoints

### Core APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info |
| `/health` | GET | Health check |
| `/docs` | GET | Interactive API documentation |

### Project Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects/` | POST | Create project |
| `/api/projects/{id}` | GET | Get project |

**Create Project:**
```json
POST /api/projects/
{
  "github_repo_url": "https://github.com/owner/repo",
  "freelancer_github_username": "developer",
  "freelancer_wallet_address": "0x...",
  "conversation": "Project requirements",
  "installation_id": "12345678"
}

Response:
{
  "success": true,
  "project_id": "proj_abc123",
  "webhook_created": true
}
```

### Webhook Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/webhook-manager/list/{project_id}` | GET | List webhooks |
| `/api/webhook-manager/update` | POST | Update webhook URL |
| `/api/webhook-manager/create` | POST | Create webhook |
| `/api/webhook-manager/delete/{project_id}` | DELETE | Delete webhook |
| `/api/webhook-manager/test/{project_id}` | POST | Test webhook (ping) |

**Update Webhook:**
```json
POST /api/webhook-manager/update
{
  "project_id": "proj_abc123",
  "new_webhook_url": "https://your-tunnel.com/api/webhooks/github"
}
```

### GitHub Webhooks

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/webhooks/github` | POST | Receive push events |
| `/api/webhooks/test` | GET | Test endpoint |

**Webhook Flow:**
1. Developer pushes → GitHub sends webhook
2. Backend filters commits by tracked developer
3. Fetches full commit details + diffs
4. Stores in MongoDB → Status: `pending_analysis`

### GitHub App Utilities

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/github/installations` | GET | List installations |
| `/api/github/repos/{installation_id}` | GET | List repos |
| `/api/github/webhooks/deliveries` | GET | Webhook history |
| `/api/github/stats` | GET | System stats |

---

## MongoDB Collections

### `projects`
```json
{
  "project_id": "proj_abc123",
  "github_repo_url": "https://github.com/owner/repo",
  "repo_owner": "owner",
  "repo_name": "repo",
  "freelancer_github_username": "developer",
  "freelancer_wallet_address": "0x...",
  "installation_id": "12345678",
  "earned_pending": 0.0,
  "total_paid": 0.0,
  "payout_threshold": 100.0,
  "status": "active"
}
```

### `push_events`
```json
{
  "push_id": "push_1234567890.123",
  "project_id": "proj_abc123",
  "tracked_developer": "developer",
  "commit_shas": ["abc123..."],
  "commits_details": [{
    "sha": "abc123...",
    "message": "Add feature",
    "additions": 50,
    "deletions": 10,
    "diff": "full diff...",
    "files_changed": [...]
  }],
  "status": "pending_analysis"
}
```

### `commit_analyses` (Ready)
```json
{
  "push_id": "push_123",
  "payout_amount": 15.50,
  "reasoning": "AI analysis...",
  "confidence": 0.92,
  "quality_score": 0.85,
  "gaming_detected": false,
  "analysis_status": "approved"
}
```

---

## Setup

### 1. Prerequisites

- Python 3.12+
- MongoDB Atlas account
- GitHub App (see docs/GITHUB_APP_FLOW.md)

### 2. Install

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 3. Configure

Create `.env`:
```env
# GitHub App
GITHUB_APP_ID=your_app_id
GITHUB_PRIVATE_KEY_PATH=./path-to-key.pem
GITHUB_WEBHOOK_SECRET=your_secret

# MongoDB
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/
MONGODB_DB_NAME=starcpay

# API
API_PORT=8000
FRONTEND_URL=http://localhost:3000
```

### 4. Run

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## Testing

### Local Webhooks (Cloudflare Tunnel)

```bash
# Start tunnel
cloudflared tunnel --url http://localhost:8000

# Update webhook
curl -X POST http://localhost:8000/api/webhook-manager/update \
  -H "Content-Type: application/json" \
  -d '{"project_id": "proj_xxx", "new_webhook_url": "https://tunnel.trycloudflare.com/api/webhooks/github"}'
```

### Test Flow

1. Create project via API
2. Push commit to tracked repo
3. Check MongoDB `push_events` collection
4. Verify commit details + diffs stored

---

## Project Structure

```
backend/
├── app/
│   ├── main.py                # FastAPI app
│   ├── config.py              # Settings
│   ├── database.py            # MongoDB
│   ├── models/                # Data models
│   ├── routes/                # API endpoints
│   │   ├── projects.py
│   │   ├── webhooks.py
│   │   ├── github_app.py
│   │   └── webhook_manager.py
│   └── services/              # Business logic
│       ├── github_service.py  # GitHub API
│       ├── commit_analyzer.py # Analysis
│       └── ai_workflow.py     # AI (ready)
├── docs/                      # Documentation
├── scripts/                   # Utility scripts
├── .env                       # Config (gitignored)
├── .gitignore
└── requirements.txt
```

---

## What's Built

### ✅ Completed

- [x] GitHub App authentication (JWT + installation tokens)
- [x] GitHub API integration (repos, commits, webhooks)
- [x] Webhook receiver with signature verification
- [x] Project management API
- [x] Webhook CRUD API (create/update/delete/list)
- [x] Commit filtering by developer
- [x] Full diff extraction from GitHub
- [x] MongoDB storage (projects, push_events)
- [x] Token caching and auto-refresh
- [x] API documentation (Swagger/ReDoc)

### 🚧 Ready for Implementation

- [ ] AI commit analysis (LangChain ready, see docs/LLM_CONFIGURATION.md)
- [ ] Payout calculation & threshold checking
- [ ] Smart contract integration
- [ ] Frontend dashboard

---

## AI Workflow (Ready)

Located in `app/services/ai_workflow.py`

**Workflow:**
1. Data enrichment (history, tasks, budget)
2. AI analysis (quality, gaming detection)
3. Payout calculation with reasoning
4. Store results
5. Update earnings & check threshold

**Supported LLMs:**
- Claude (Anthropic)
- OpenAI (GPT-4)
- Google Gemini

See `docs/LLM_CONFIGURATION.md` for setup.

---

## Deployment

### Railway

1. Connect repository
2. Add environment variables
3. Deploy

### Environment Variables

Required in production:
- `GITHUB_APP_ID`
- `GITHUB_PRIVATE_KEY_PATH`
- `GITHUB_WEBHOOK_SECRET`
- `MONGODB_URL`
- `MONGODB_DB_NAME`

---

## Documentation

- `docs/DEPLOYMENT.md` - Deployment guides
- `docs/GITHUB_APP_FLOW.md` - GitHub App setup
- `docs/LLM_CONFIGURATION.md` - AI integration
- `docs/STATUS.md` - Current status
- `docs/TESTING_GUIDE.md` - Testing procedures

---

## Troubleshooting

**MongoDB SSL Issues:**
```env
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority&tls=true
```

**Webhook Not Working:**
- Check URL is publicly accessible
- Verify webhook secret matches
- Test: `curl http://localhost:8000/api/webhooks/test`

---

## Technology Stack

- **Backend**: FastAPI (Python 3.12)
- **Database**: MongoDB Atlas (Motor)
- **GitHub**: GitHub App API, Webhooks
- **Auth**: JWT for GitHub App
- **AI**: LangChain (ready)
- **Deployment**: Railway, Cloudflare Tunnels

---

Built with FastAPI ⚡ MongoDB 🍃 GitHub 🐙
