# StarCPay Backend

AI-powered payment system for GitHub freelancers. Automatically analyzes commits and determines fair payouts.

---

## Overview

StarCPay monitors GitHub repositories, analyzes developer commits using AI, and automatically handles payments when thresholds are met.

### Core Features

- ✅ **GitHub App Integration**: Authenticate and access repositories
- ✅ **Webhook System**: Real-time commit tracking with signature verification
- ✅ **AI-Powered Analysis**: Complete workflow with gaming detection and smart payouts
  - Gaming/Spam Detection (GPT-4o-mini): Detects fake commits, gives $0 for gaming
  - Holistic Analysis (GPT-4o-mini): Smart payout decisions based on milestones
  - Dynamic Budget Tracking: Proportional payments based on milestone budgets
  - Rate Limiting: Random delays (0.5-3s) to avoid API limits
- ✅ **Project Management API**: Milestone-based tracking with evaluation modes
- ✅ **Webhook Management API**: Programmatically create/update/delete webhooks
- ✅ **MongoDB Storage**: Persistent storage with detailed analysis results
- ✅ **Threshold Monitoring**: Auto-trigger smart contracts when threshold met

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
  "freelance_alias": "Developer Name",
  "github_username": "developer",
  "wallet_address": "0x...",
  "repo_url": "https://github.com/owner/repo",
  "milestone_specification": {
    "milestones": [
      {
        "id": 1,
        "title": "Project Setup",
        "budget": 20,
        "status": "pending",
        "tasks": ["Initialize repository", "Setup dependencies", "Configure environment"]
      },
      {
        "id": 2,
        "title": "Core Features",
        "budget": 50,
        "status": "pending",
        "tasks": ["Implement feature A", "Implement feature B", "Add tests"]
      }
    ]
  },
  "gmeet_link": "https://meet.google.com/xxx",
  "total_budget": 100.0,
  "payout_threshold": 50.0,
  "evaluation_mode": "agentic",
  "start_date": "2025-02-01T00:00:00Z",
  "end_date": "2025-02-28T23:59:59Z",
  "total_tenure_days": 28,
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
5. **Agentic Mode**: AI workflow automatically analyzes commits
   - Gaming/spam detection (GPT-4o-mini)
   - Holistic analysis with budget tracking
   - Stores results in `commit_analyses` collection
6. **Manual Mode**: Waits for human review

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
  "freelance_alias": "Developer Name",
  "github_username": "developer",
  "wallet_address": "0x...",
  "repo_url": "https://github.com/owner/repo",
  "repo_owner": "owner",
  "repo_name": "repo",
  "milestone_specification": {
    "milestones": [
      {"id": 1, "title": "Setup", "budget": 20, "status": "pending", "tasks": ["..."]}
    ]
  },
  "gmeet_link": "https://meet.google.com/xxx",
  "total_budget": 100.0,
  "earned_pending": 0.0,
  "total_paid": 0.0,
  "payout_threshold": 50.0,
  "evaluation_mode": "agentic",
  "start_date": "2025-02-01T00:00:00Z",
  "end_date": "2025-02-28T23:59:59Z",
  "total_tenure_days": 28,
  "installation_id": "12345678",
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

### `commit_analyses`
```json
{
  "push_id": "push_1738937502.456",
  "project_id": "proj_abc123",
  "payout_amount": 7.50,
  "reasoning": "Completed Calculator UI implementation (Milestone 3: Calculator Screen, 2/4 tasks). High-quality code with proper React components and styling. Proportional payment: (2 tasks / 4 tasks) × $30 milestone budget × 0.9 quality = $13.50, capped at conservative $7.50 to preserve remaining budget.",
  "confidence": 0.9,
  "quality_score": 0.85,
  "gaming_detected": false,
  "task_alignment": "aligned",
  "flags": [],
  "commits_summary": "Added Calculator component with display and button grid",
  "analysis_status": "approved",
  "budget_snapshot": {
    "total_budget": 100.0,
    "earned_pending": 7.50,
    "total_paid": 0.0,
    "remaining_budget": 92.50
  },
  "gaming_check": {
    "is_gaming": false,
    "confidence": 0.95,
    "reason": "Legitimate React component implementation with meaningful code changes"
  },
  "created_at": "2025-02-07T10:05:02Z"
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

# AI (Required for commit analysis)
OPENAI_API_KEY=sk-...  # GPT-4o-mini for gaming detection & holistic analysis

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

### End-to-End Test Results

**Test Project**: Calculator App ($100 budget, 4 milestones)

**Test 1: Gaming Detection** ❌
- Commit: "update" with single character change
- Result: Gaming detected, $0 payout
- Status: `rejected`
- Reasoning: "Trivial whitespace change with no meaningful work"

**Test 2: Legitimate Work** ✅
- Commit: Calculator UI implementation (Milestone 3, 2/4 tasks)
- Result: $7.50 payout
- Status: `approved`
- Reasoning: "Completed 2/4 tasks in Calculator Screen milestone. Proportional payment: (2/4) × $30 budget × 0.9 quality = $13.50, conservatively set to $7.50 to preserve remaining budget for future work."
- Budget Impact: 7.5% utilized, $92.50 remaining

**Key Observations:**
- Gaming detection accurately rejects spam commits
- Proportional payments based on milestone task completion
- Budget-aware decisions to ensure project completion
- High confidence (0.9+) on clear-cut cases

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
│       ├── ai_workflow.py     # AI workflow orchestration
│       └── llm_service.py     # LLM integration (OpenAI)
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
- [x] Project management API with milestone specifications
- [x] Webhook CRUD API (create/update/delete/list)
- [x] Commit filtering by developer
- [x] Full diff extraction from GitHub
- [x] MongoDB storage (projects, push_events, commit_analyses)
- [x] Token caching and auto-refresh
- [x] API documentation (Swagger/ReDoc)
- [x] **AI commit analysis** (GPT-4o-mini via LangChain)
  - Gaming/spam detection with $0 payout
  - Holistic analysis with milestone awareness
  - Dynamic budget tracking and proportional payments
  - Rate limiting protection (0.5-3s random delays)
- [x] **Payout calculation & threshold checking**
  - Milestone-based budgets
  - Proportional payment formula
  - Quality multipliers
  - Budget preservation logic

### 🚧 Ready for Implementation

- [ ] Smart contract integration (Ethereum payouts)
- [ ] Frontend dashboard (React/Next.js)
- [ ] Email notifications
- [ ] Advanced analytics dashboard

---

## AI Workflow (Complete ✅)

Located in `app/services/ai_workflow.py` and `app/services/llm_service.py`

### Workflow Steps

**1. Data Enrichment** (`_enrich_data`)
- Fetch project milestones and task specifications
- Get last 10 historic commits for context
- Calculate dynamic budget metrics:
  - `remaining_budget = total_budget - earned_pending - total_paid`
  - `budget_utilization_percent = (earned_pending + total_paid) / total_budget × 100`
  - Per-milestone budget tracking and spending

**2. Gaming/Spam Detection** (`detect_gaming`)
- **LLM**: GPT-4o-mini (fast, cost-effective)
- **Input**: Commit metadata + first 500 chars of diff
- **Detection patterns**:
  - Empty commits or whitespace-only changes
  - Repeated add/remove of same lines
  - Gibberish or auto-generated content
  - Trivial edits with no substance
- **Output**: `is_gaming: boolean`, confidence, reason, flags
- **Rate limit**: 0.5-2s random delay
- **Result**: If gaming detected → $0 payout, analysis ends

**3. Holistic Analysis** (`holistic_analysis`)
- **LLM**: GPT-4o-mini (smart reasoning)
- **Input**: Full commits + diffs + milestones + historic work + budget status
- **Payment Formula**:
  ```
  Base = (Tasks completed / Total tasks in milestone) × Milestone budget
  Final = Base × Quality multiplier (0.5-1.0)
  Capped at: min(Final, Remaining milestone budget, Remaining project budget)
  ```
- **Considerations**:
  - Which milestone does the work belong to?
  - How many tasks completed vs total tasks?
  - Code quality and completeness
  - Remaining budget for future milestones
- **Output**: Payout amount, reasoning, confidence, quality score, task alignment
- **Rate limit**: 1-3s random delay

**4. Store Results** (`_store_analysis`)
- Save to `commit_analyses` collection
- Include full reasoning and budget snapshot

**5. Update Project** (`_update_project_earnings`)
- Increment `earned_pending` by payout amount
- Check if threshold reached for smart contract trigger

### Example Results

**Spam Detection:**
```json
{
  "payout_amount": 0.0,
  "reasoning": "Gaming/spam detected: Only whitespace changes with no meaningful work",
  "gaming_detected": true,
  "analysis_status": "rejected"
}
```

**Legitimate Work:**
```json
{
  "payout_amount": 7.50,
  "reasoning": "Completed Calculator UI (Milestone 3, 2/4 tasks). Proportional: (2/4) × $30 × 0.9 = $13.50, conservative $7.50 to preserve budget.",
  "confidence": 0.9,
  "quality_score": 0.85,
  "gaming_detected": false,
  "task_alignment": "aligned",
  "analysis_status": "approved"
}
```

### Configuration

Currently using **OpenAI GPT-4o-mini** for both detection steps. To use other LLMs, see `docs/LLM_CONFIGURATION.md`.

**Supported LLMs:**
- OpenAI GPT-4o-mini ✅ (Current)
- Claude (Anthropic) - Code ready
- Google Gemini - Code ready

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
- `OPENAI_API_KEY` (for AI analysis)

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
- **AI**: LangChain + OpenAI GPT-4o-mini
- **Deployment**: Railway, Cloudflare Tunnels

---

Built with FastAPI ⚡ MongoDB 🍃 GitHub 🐙
