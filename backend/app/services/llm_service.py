"""
LLM Service for Multi-Provider Support

Supports Claude (Anthropic), OpenAI, and Google Gemini via LangChain
"""

from typing import Dict, Optional
import asyncio
import random
from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from app.config import get_settings


class LLMService:
    """Service for interacting with different LLM providers"""

    def __init__(self):
        self.settings = get_settings()
        self._gemini = None
        self._openai = None

    def _get_gemini(self):
        """Get Gemini instance for gaming detection"""
        if self._gemini:
            return self._gemini

        if not self.settings.google_api_key:
            raise ValueError("GOOGLE_API_KEY not set in environment")

        self._gemini = ChatGoogleGenerativeAI(
            model=self.settings.gemini_model,
            google_api_key=self.settings.google_api_key,
            temperature=0.2,
            max_output_tokens=1024
        )
        print(f"[LLM] Initialized Gemini: {self.settings.gemini_model}")
        return self._gemini

    def _get_openai(self):
        """Get OpenAI instance for holistic analysis"""
        if self._openai:
            return self._openai

        if not self.settings.openai_api_key:
            raise ValueError("OPENAI_API_KEY not set in environment")

        self._openai = ChatOpenAI(
            model="gpt-4o-mini",  # Use 4o-mini as specified
            openai_api_key=self.settings.openai_api_key,
            temperature=0.3,
            max_tokens=2048
        )
        print(f"[LLM] Initialized OpenAI: gpt-4o-mini")
        return self._openai

    async def detect_gaming(self, commits_details: list) -> Dict:
        """
        Step 1: Gaming/Spam Detection using OpenAI GPT-4o-mini (fast and reliable)

        Input: Only commit metadata + first 500 chars of diff
        Output: legitimate/spam classification with confidence
        """
        openai = self._get_openai()

        # Prepare minimal data for gaming detection
        commit_summaries = []
        for commit in commits_details:
            summary = {
                "message": commit.get("message", ""),
                "additions": commit.get("additions", 0),
                "deletions": commit.get("deletions", 0),
                "files_changed": len(commit.get("files_changed", [])),
                "diff_preview": commit.get("diff", "")[:500]  # Only first 500 chars
            }
            commit_summaries.append(summary)

        system_prompt = """You are a spam/gaming detector for a freelancer payment platform.

Your ONLY job is to detect if commits are:
1. **Legitimate work** - Real code changes with meaningful purpose
2. **Gaming/Spam** - Fake commits to inflate payment (whitespace changes, meaningless edits, spam)

Common gaming patterns:
- Empty commits with no real changes
- Only whitespace or formatting changes
- Adding/removing same lines repeatedly
- Trivial README edits with no substance
- Gibberish or auto-generated content
- Excessive changes that look copy-pasted

Be strict but fair. Real work should pass."""

        commits_text = "\n\n".join([
            f"Commit {i+1}:\n"
            f"- Message: {c['message']}\n"
            f"- Changes: +{c['additions']} -{c['deletions']} lines, {c['files_changed']} files\n"
            f"- Diff preview:\n{c['diff_preview']}"
            for i, c in enumerate(commit_summaries)
        ])

        user_prompt = f"""Analyze these {len(commits_details)} commit(s) for gaming/spam:

{commits_text}

Respond with JSON only:
{{
    "is_gaming": true/false,
    "confidence": 0.0-1.0,
    "reason": "brief explanation",
    "flags": ["flag1", "flag2"]
}}"""

        try:
            # Random delay to avoid rate limits (0.5-2 seconds)
            delay = random.uniform(0.5, 2.0)
            print(f"  - Rate limit protection: waiting {delay:.2f}s")
            await asyncio.sleep(delay)

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]

            response = await openai.ainvoke(messages)
            response_text = response.content

            # Parse JSON
            import json
            import re

            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group(0))
            else:
                result = json.loads(response_text)

            print(f"[GPT-4o-mini] Gaming detection:")
            print(f"  - Is gaming: {result.get('is_gaming', False)}")
            print(f"  - Confidence: {result.get('confidence', 0)}")
            print(f"  - Reason: {result.get('reason', '')[:100]}")

            return result

        except Exception as e:
            print(f"[ERROR] Gaming detection failed: {e}")
            # Fallback: assume legitimate if detection fails
            return {
                "is_gaming": False,
                "confidence": 0.3,
                "reason": "Gaming detection failed, assuming legitimate",
                "flags": ["detection_failed"]
            }

    async def holistic_analysis(
        self,
        commits_details: list,
        milestones: Dict,
        historic_commits: list,
        budget_info: Dict,
        gaming_result: Dict
    ) -> Dict:
        """
        Step 3: Holistic Analysis using GPT-4o-mini

        Makes smart amount decisions based on full context
        """
        openai = self._get_openai()

        # If gaming detected, return $0 immediately
        if gaming_result.get("is_gaming", False):
            return {
                "payout_amount": 0.0,
                "reasoning": f"Gaming/spam detected: {gaming_result.get('reason', 'Illegitimate commits')}",
                "confidence": gaming_result.get("confidence", 0.9),
                "quality_score": 0.0,
                "gaming_detected": True,
                "task_alignment": "not_aligned",
                "flags": ["gaming_detected"] + gaming_result.get("flags", []),
                "commits_summary": "Spam/gaming commits rejected",
                "analysis_status": "rejected"
            }

        # Prepare commit data (truncate diffs to 1000 tokens if needed)
        commits_text = []
        for commit in commits_details:
            diff = commit.get("diff", "")
            # Simple truncation - first 1000 chars for POC
            if len(diff) > 1000:
                diff = diff[:1000] + "\n... (truncated)"

            commits_text.append(
                f"Commit: {commit.get('message', '')}\n"
                f"Changes: +{commit.get('additions', 0)} -{commit.get('deletions', 0)} lines\n"
                f"Files: {len(commit.get('files_changed', []))}\n"
                f"Diff:\n{diff}\n"
            )

        # Prepare historic context
        historic_text = "\n".join([
            f"  - {h.get('message', '')} (+{h.get('additions', 0)} -{h.get('deletions', 0)})"
            for h in historic_commits[:10]
        ])

        system_prompt = """You are an AI payment analyst for StarCPay, evaluating freelancer work to determine fair payment.

Your job:
1. Identify which milestone this work belongs to
2. Calculate payment as a PROPORTION of the milestone's budget
3. Consider total project budget and remaining balance
4. Be strict - budget must last for ALL milestones

Payment strategy:
- Match work to specific milestone tasks
- Pay proportionally: If milestone has $20 budget and 4 tasks, completing 1-2 tasks = $5-10
- NEVER exceed the milestone's budget for that milestone's work
- Consider remaining budget - must be enough for future milestones
- Empty commits = $0
- Trivial work = $1-3 (even if milestone budget is higher)

Critical rules:
1. Total project budget is FIXED - once it's gone, no more payments
2. Each milestone has a budget allocation - respect it
3. If remaining budget is low, reduce payouts to ensure project completion
4. Quality and task completion matter more than lines of code"""

        # Format milestones clearly
        milestone_text = ""
        if isinstance(milestones, dict) and 'milestones' in milestones:
            for m in milestones['milestones']:
                milestone_text += f"\nMilestone {m.get('id')}: {m.get('title')} (Budget: ${m.get('budget', 0)})\n"
                tasks = m.get('tasks', [])
                for t in tasks:
                    milestone_text += f"  - {t}\n"
        else:
            milestone_text = str(milestones)[:500]

        # Get milestone summary
        milestone_summary_text = ""
        total_milestone_budget = budget_info.get('total_milestone_budget', 0)
        budget_utilization = budget_info.get('budget_utilization_percent', 0)

        if 'milestone_summary' in budget_info:
            for m in budget_info['milestone_summary']:
                spent = budget_info.get('milestone_spending', {}).get(str(m['id']), 0)
                milestone_summary_text += f"\n  {m['id']}. {m['title']}: ${m['budget']} budget, {m['tasks_count']} tasks, ${spent} spent, ${m['budget']-spent} remaining"

        user_prompt = f"""Analyze this push and determine fair payment:

**Current Commits ({len(commits_details)} total):**
{chr(10).join(commits_text)}

**Project Milestones & Task Breakdown:**
{milestone_text}

**Milestone Budget Status:**{milestone_summary_text}
Total allocated: ${total_milestone_budget}

**Recent Historic Work (last 10 commits):**
{historic_text}

**CRITICAL Budget Analysis:**
- Total Project Budget: ${budget_info.get('total_budget', 0)} (FIXED for entire project)
- Already Paid: ${budget_info.get('total_paid', 0)}
- Pending Payment: ${budget_info.get('earned_pending', 0)}
- Remaining Balance: ${budget_info.get('remaining_budget', 0)}
- Budget Utilized: {budget_utilization}%
- ⚠️ WARNING: Only ${budget_info.get('remaining_budget', 0)} left for all future work!

**Your Payment Decision Process:**
1. Match work to specific milestone and count tasks completed
2. Calculate: (Tasks completed / Total tasks in milestone) × Milestone budget = Base amount
3. Adjust for quality: Base × quality_multiplier (0.5-1.0)
4. Verify: Payment ≤ Remaining milestone budget AND Remaining project budget
5. Example: Milestone 1 has $20, 4 tasks. Completing 2 tasks well = (2/4) × $20 × 0.9 = $9

**Critical Rules:**
- NEVER pay more than what's left in the milestone budget
- NEVER pay more than remaining project budget
- Consider future milestones - budget must last!
- Quality matters: great work = higher multiplier, poor work = lower

**Gaming Check:**
- Legitimate work confirmed by pre-screening

Respond with JSON only:
{{
    "payout_amount": 0-50,
    "reasoning": "detailed explanation (3-5 sentences)",
    "confidence": 0.0-1.0,
    "quality_score": 0.0-1.0,
    "task_alignment": "aligned/partially_aligned/not_aligned",
    "flags": ["flag1", "flag2"],
    "commits_summary": "one sentence summary"
}}"""

        try:
            # Random delay to avoid rate limits (1-3 seconds for holistic analysis)
            delay = random.uniform(1.0, 3.0)
            print(f"  - Rate limit protection: waiting {delay:.2f}s")
            await asyncio.sleep(delay)

            messages = [
                SystemMessage(content=system_prompt),
                HumanMessage(content=user_prompt)
            ]

            response = await openai.ainvoke(messages)
            response_text = response.content

            # Parse JSON
            import json
            import re

            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group(0))
            else:
                result = json.loads(response_text)

            # Validate and cap payout
            payout_amount = float(result.get("payout_amount", 0))
            payout_amount = min(payout_amount, 50.0)
            payout_amount = min(payout_amount, budget_info.get("remaining_budget", 0))

            result["payout_amount"] = round(payout_amount, 2)
            result["confidence"] = round(float(result.get("confidence", 0.5)), 2)
            result["quality_score"] = round(float(result.get("quality_score", 0.5)), 2)
            result["gaming_detected"] = False

            # Add analysis status
            if result["confidence"] < 0.7:
                result["analysis_status"] = "needs_human_review"
            else:
                result["analysis_status"] = "approved"

            print(f"[GPT-4o-mini] Holistic analysis:")
            print(f"  - Payout: ${result['payout_amount']}")
            print(f"  - Quality: {result['quality_score']}")
            print(f"  - Confidence: {result['confidence']}")
            print(f"  - Alignment: {result.get('task_alignment', 'unknown')}")

            return result

        except Exception as e:
            print(f"[ERROR] Holistic analysis failed: {e}")
            import traceback
            traceback.print_exc()

            # Fallback
            return self._fallback_analysis(commits_details, budget_info)

    def _fallback_analysis(self, commits_details: list, budget_info: Dict) -> Dict:
        """Fallback rule-based analysis if LLM fails"""
        print("[WARN] Using fallback rule-based analysis")

        lines_changed = sum(
            c.get("additions", 0) + c.get("deletions", 0)
            for c in commits_details
        )
        files_changed = sum(len(c.get("files_changed", [])) for c in commits_details)

        # Simple formula
        base_payout = (lines_changed * 0.10) + (files_changed * 5.0)
        quality_score = 0.7  # Default
        payout_amount = min(base_payout * quality_score, 50.0)
        payout_amount = min(payout_amount, budget_info.get("remaining_budget", 0))

        return {
            "payout_amount": round(payout_amount, 2),
            "reasoning": f"Fallback analysis: {lines_changed} lines, {files_changed} files changed. Applied standard rates.",
            "confidence": 0.5,
            "quality_score": quality_score,
            "gaming_detected": False,
            "task_alignment": "unknown",
            "flags": ["fallback_analysis"],
            "commits_summary": f"{len(commits_details)} commits",
            "analysis_status": "needs_human_review"
        }


# Singleton instance
llm_service = LLMService()
