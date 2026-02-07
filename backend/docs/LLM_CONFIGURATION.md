# 🤖 AI/LLM Configuration Guide

StarCPay supports **three AI providers** for commit analysis:
- **Claude** (Anthropic)
- **OpenAI** (GPT-4)
- **Google Gemini**

Employers can choose their preferred provider based on cost, performance, or availability.

---

## 🎯 Quick Setup

### 1. Choose Your Provider

Edit your `.env` file:

```env
LLM_PROVIDER=claude    # Options: "claude", "openai", or "gemini"
```

### 2. Add Your API Key

Only the key for your chosen provider is required:

**For Claude:**
```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

**For OpenAI:**
```env
OPENAI_API_KEY=sk-xxxxx
```

**For Gemini:**
```env
GOOGLE_API_KEY=xxxxx
```

### 3. Install Dependencies

```bash
cd backend
.venv/Scripts/python -m pip install -r requirements.txt
```

### 4. Restart Backend

```bash
.venv/Scripts/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## 📊 Provider Comparison

| Provider | Model | Cost (per 1M tokens) | Speed | Quality |
|----------|-------|----------------------|-------|---------|
| **Claude** | claude-3-5-sonnet | $3 input / $15 output | Fast | Excellent |
| **OpenAI** | gpt-4-turbo | $10 input / $30 output | Medium | Excellent |
| **Gemini** | gemini-pro | $0.50 input / $1.50 output | Very Fast | Good |

*Costs are approximate as of Feb 2025. Check provider pricing pages for current rates.*

---

## 🔧 Advanced Configuration

### Custom Model Selection

You can override default models in `.env`:

```env
# For Claude
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# For OpenAI
OPENAI_MODEL=gpt-4-turbo-preview

# For Gemini
GEMINI_MODEL=gemini-pro
```

### Temperature and Token Limits

Configured in `app/services/llm_service.py`:

```python
# Claude example
ChatAnthropic(
    model=self.settings.claude_model,
    temperature=0.3,      # Lower = more deterministic
    max_tokens=4096       # Response length limit
)
```

---

## 🚀 How It Works

### AI Analysis Flow

1. **Webhook receives push** → Commits extracted
2. **Data enrichment** → Previous work, task list, budget fetched
3. **LLM analysis** → AI evaluates:
   - Code quality
   - Gaming detection (fake commits)
   - Task alignment
   - Fair payout amount
4. **Result storage** → Decision saved with reasoning
5. **Earnings update** → Balance updated, threshold checked

### What AI Analyzes

```python
Input to AI:
- Commit messages
- Code diffs (up to 500 chars per commit)
- Lines changed & files modified
- Project task list
- Previous work history
- Budget remaining
- Gaming patterns to detect

Output from AI:
- payout_amount: Fair USD amount ($0-$50 per push)
- reasoning: 3-5 sentence explanation
- confidence: 0.0-1.0 (how confident)
- quality_score: 0.0-1.0 (code quality)
- gaming_detected: Boolean (fake commit?)
- task_alignment: "aligned", "partially_aligned", or "not_aligned"
- flags: ["minimal_changes", "needs_review", etc.]
- commits_summary: One-sentence summary
```

---

## 🔑 Getting API Keys

### Claude (Anthropic)

1. Visit: https://console.anthropic.com/
2. Sign up or log in
3. Go to **API Keys** section
4. Create new key
5. Copy key (starts with `sk-ant-`)

**Pricing:** $3 per 1M input tokens, $15 per 1M output tokens

---

### OpenAI

1. Visit: https://platform.openai.com/
2. Sign up or log in
3. Go to **API Keys**
4. Create new secret key
5. Copy key (starts with `sk-`)

**Pricing:** $10 per 1M input tokens, $30 per 1M output tokens

---

### Google Gemini

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click **Create API Key**
4. Copy key

**Pricing:** $0.50 per 1M input tokens, $1.50 per 1M output tokens

---

## 🧪 Testing AI Analysis

After setup, push a commit to test:

```bash
# In your tracked repository
git commit -m "Test: AI analysis"
git push
```

Check backend logs:

```
[WORKFLOW] Starting AI Analysis Workflow
[STEP 1] Enriching data...
[STEP 2] Running AI analysis...
[LLM] Using Claude: claude-3-5-sonnet-20241022
[LLM] Analysis complete:
  - Payout: $15.50
  - Quality: 0.85
  - Confidence: 0.92
  - Gaming: False
[WORKFLOW] Analysis Complete!
```

---

## 🛡️ Fallback Mechanism

If AI provider fails (network issue, quota exceeded, etc.), the system automatically falls back to **rule-based analysis**:

- Uses simple formula: `(lines * $0.10) + (files * $5.00)`
- Flags as `"fallback_analysis"` and `"needs_human_review"`
- Ensures system continues to work even with AI downtime

---

## 💰 Cost Estimation

**Typical analysis per push:**
- Input: ~2,000 tokens (commit data + context)
- Output: ~500 tokens (analysis result)

**Monthly costs (100 pushes/month):**
- Claude: ~$2-3
- OpenAI: ~$6-8
- Gemini: ~$0.50

**For high volume (1000 pushes/month):**
- Claude: ~$20-30
- OpenAI: ~$60-80
- Gemini: ~$5

---

## 🔄 Switching Providers

You can switch providers anytime:

1. Update `LLM_PROVIDER` in `.env`
2. Add the new provider's API key
3. Restart backend

No code changes needed!

---

## 🐛 Troubleshooting

### "ANTHROPIC_API_KEY not set"

- Add key to `.env` file
- Restart backend
- Verify no quotes around key

### "Rate limit exceeded"

- Wait and retry (rate limits reset)
- Consider upgrading to paid tier
- Switch to different provider temporarily

### "Invalid API key"

- Check key is correct (no extra spaces)
- Verify key hasn't expired
- Regenerate key in provider console

### AI analysis always fails

- Check API key is valid
- Verify internet connectivity
- Check provider status page
- Review backend logs for specific error
- System will use fallback analysis automatically

---

## 📈 Monitoring AI Usage

### View Analysis Results

```bash
curl http://localhost:8000/api/github/stats | jq
```

Shows:
- Total analyses performed
- Average payout amounts
- AI confidence scores
- Gaming detection rate

### MongoDB Queries

```javascript
// View AI analysis results
db.commit_analyses.find({}).sort({created_at: -1}).limit(10)

// Check which provider was used
db.commit_analyses.find({"analyzed_by": "ai_workflow_v1"})

// Find flagged commits
db.commit_analyses.find({"gaming_detected": true})
```

---

## 🎓 Best Practices

1. **Start with Claude** - Best balance of quality and cost
2. **Test with small commits first** - Verify AI is working correctly
3. **Monitor costs** - Set up billing alerts in provider console
4. **Review flagged commits** - AI flags low confidence for human review
5. **Adjust thresholds** - Tune payout formulas based on your budget
6. **Use fallback** - Don't worry about AI downtime, system handles it

---

## 📚 Resources

- **LangChain Docs:** https://python.langchain.com/
- **Claude API:** https://docs.anthropic.com/
- **OpenAI API:** https://platform.openai.com/docs/
- **Gemini API:** https://ai.google.dev/docs

---

**Status:** ✅ Multi-LLM Support Active
**Last Updated:** 2026-02-07
