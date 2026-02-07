"""
AI Workflow for Commit Analysis

Simple multi-step workflow that analyzes commits and determines payout.
No external dependencies - just Python functions.
"""

from typing import Dict, List
from datetime import datetime
from app.database import get_database
from app.services.llm_service import llm_service


class AIWorkflowService:
    """Simple AI workflow for analyzing commits"""

    async def run_analysis_workflow(
        self,
        push_id: str,
        project_id: str,
        commits_details: List[Dict],
        project_context: Dict
    ) -> Dict:
        """
        Run complete AI analysis workflow

        Flow:
        1. Gaming Detection (Gemini) - Fast spam detection
        2. Data Enrichment - Fetch milestones, history, budget
        3. Holistic Analysis (GPT-4o-mini) - Smart amount decision
        4. Store results
        5. Update project earnings
        6. Check threshold
        """

        print(f"\n{'='*60}")
        print(f"[WORKFLOW] Starting AI Analysis Workflow")
        print(f"Push ID: {push_id}")
        print(f"Project: {project_id}")
        print(f"Commits: {len(commits_details)}")
        print(f"{'='*60}\n")

        try:
            # Step 1: Gaming Detection (Gemini - token-efficient)
            print("[STEP 1] Gaming detection (Gemini)...")
            gaming_result = await llm_service.detect_gaming(commits_details)

            if gaming_result.get("is_gaming", False):
                print(f"  [REJECTED] Gaming detected: {gaming_result.get('reason', '')}")

            # Step 2: Data Enrichment
            print("[STEP 2] Enriching data...")
            enriched_data = await self._enrich_data(
                project_id,
                commits_details,
                project_context
            )

            # Step 3: Holistic Analysis (GPT-4o-mini)
            print("[STEP 3] Holistic analysis (GPT-4o-mini)...")
            ai_analysis = await llm_service.holistic_analysis(
                commits_details=commits_details,
                milestones=enriched_data["milestones"],
                historic_commits=enriched_data["historic_commits"],
                budget_info=enriched_data["budget_info"],
                gaming_result=gaming_result
            )

            # Step 4: Store results
            print("[STEP 4] Storing analysis results...")
            await self._store_analysis(
                push_id,
                project_id,
                ai_analysis
            )

            # Step 5: Update earnings
            print("[STEP 5] Updating project earnings...")
            payout_status = await self._update_earnings(
                project_id,
                ai_analysis["payout_amount"]
            )

            print(f"\n{'='*60}")
            print(f"[WORKFLOW] Analysis Complete!")
            print(f"Payout: ${ai_analysis['payout_amount']}")
            print(f"Quality: {ai_analysis.get('quality_score', 0)}")
            print(f"Confidence: {ai_analysis['confidence']}")
            print(f"Gaming: {ai_analysis.get('gaming_detected', False)}")
            print(f"Trigger Payout: {payout_status['should_trigger_payout']}")
            print(f"{'='*60}\n")

            return {
                "success": True,
                "analysis": ai_analysis,
                "payout_status": payout_status
            }

        except Exception as e:
            print(f"[ERROR] Workflow failed: {e}")
            import traceback
            traceback.print_exc()
            return {
                "success": False,
                "error": str(e)
            }

    async def _enrich_data(
        self,
        project_id: str,
        commits_details: List[Dict],
        project_context: Dict
    ) -> Dict:
        """
        Step 2: Enrich data with milestones, historic commits, budget (DYNAMIC)
        """
        db = get_database()

        # Get project details
        project = await db["projects"].find_one({"project_id": project_id})

        if not project:
            raise ValueError(f"Project {project_id} not found")

        # Get milestones from project
        milestones = project.get("milestone_specification", {})

        # Calculate milestone budget allocation
        total_milestone_budget = 0
        milestone_summary = []
        if isinstance(milestones, dict) and 'milestones' in milestones:
            for m in milestones['milestones']:
                milestone_budget = m.get('budget', 0)
                total_milestone_budget += milestone_budget
                milestone_summary.append({
                    'id': m.get('id'),
                    'title': m.get('title'),
                    'budget': milestone_budget,
                    'status': m.get('status', 'pending'),
                    'tasks_count': len(m.get('tasks', []))
                })

        # Get previous analyses to calculate actual payments made
        previous_analyses = await db["commit_analyses"].find(
            {"project_id": project_id, "analysis_status": {"$in": ["approved", "completed"]}}
        ).to_list(length=100)

        total_paid_from_analyses = sum(a.get("payout_amount", 0) for a in previous_analyses)

        # Get last 10 historic commits from push_events
        historic_push_events = await db["push_events"].find(
            {"project_id": project_id, "status": {"$in": ["approved", "completed"]}}
        ).sort("created_at", -1).limit(10).to_list(length=10)

        historic_commits = []
        for event in historic_push_events:
            for commit in event.get("commits_details", []):
                historic_commits.append({
                    "message": commit.get("message", ""),
                    "additions": commit.get("additions", 0),
                    "deletions": commit.get("deletions", 0),
                    "sha": commit.get("sha", "")[:8]
                })

        # Dynamic budget calculation
        total_budget = project.get("total_budget", 0.0)
        earned_pending = project.get("earned_pending", 0.0)
        total_paid = project.get("total_paid", 0.0)

        # Remaining budget = Total budget - (paid + pending)
        remaining_budget = total_budget - earned_pending - total_paid

        # Calculate how much of each milestone has been spent
        milestone_spending = {}
        for analysis in previous_analyses:
            # Try to match analysis to milestone (if we stored it)
            milestone_id = analysis.get("milestone_id", "unknown")
            if milestone_id not in milestone_spending:
                milestone_spending[milestone_id] = 0
            milestone_spending[milestone_id] += analysis.get("payout_amount", 0)

        budget_info = {
            "total_budget": total_budget,
            "total_paid": total_paid,
            "earned_pending": earned_pending,
            "remaining_budget": remaining_budget,
            "total_milestone_budget": total_milestone_budget,
            "milestone_summary": milestone_summary,
            "milestone_spending": milestone_spending,
            "budget_utilization_percent": round((earned_pending + total_paid) / total_budget * 100, 1) if total_budget > 0 else 0
        }

        enriched = {
            "milestones": milestones,
            "historic_commits": historic_commits[:10],
            "budget_info": budget_info
        }

        print(f"  - Milestones: {len(milestone_summary)}")
        print(f"  - Total milestone budget: ${total_milestone_budget}")
        print(f"  - Historic commits: {len(historic_commits)}")
        print(f"  - Total budget: ${total_budget}")
        print(f"  - Already paid: ${total_paid}")
        print(f"  - Pending payment: ${earned_pending}")
        print(f"  - Remaining budget: ${remaining_budget}")
        print(f"  - Budget used: {budget_info['budget_utilization_percent']}%")

        return enriched


    async def _store_analysis(
        self,
        push_id: str,
        project_id: str,
        analysis: Dict
    ) -> None:
        """
        Step 3: Store analysis results in database
        """
        db = get_database()

        analysis_doc = {
            "push_id": push_id,
            "project_id": project_id,
            "payout_amount": analysis["payout_amount"],
            "reasoning": analysis["reasoning"],
            "confidence": analysis["confidence"],
            "flags": analysis["flags"],
            "commits_summary": analysis["commits_summary"],
            "quality_score": analysis["quality_score"],
            "task_alignment": analysis["task_alignment"],
            "gaming_detected": analysis["gaming_detected"],
            "analysis_status": analysis["analysis_status"],
            "created_at": datetime.utcnow(),
            "analyzed_by": "ai_workflow_v1"
        }

        await db["commit_analyses"].insert_one(analysis_doc)

        # Update push event status
        await db["push_events"].update_one(
            {"push_id": push_id},
            {"$set": {
                "status": analysis["analysis_status"],
                "analyzed_at": datetime.utcnow()
            }}
        )

        print(f"  - Stored in commit_analyses collection")
        print(f"  - Updated push_events status: {analysis['analysis_status']}")

    async def _update_earnings(
        self,
        project_id: str,
        payout_amount: float
    ) -> Dict:
        """
        Step 5: Update project earnings and check threshold
        """
        db = get_database()

        # Get current project
        project = await db["projects"].find_one({"project_id": project_id})

        current_pending = project.get("earned_pending", 0.0)
        threshold = project.get("payout_threshold", 100.0)
        new_pending = current_pending + payout_amount

        # Update project
        await db["projects"].update_one(
            {"project_id": project_id},
            {
                "$inc": {"earned_pending": payout_amount},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )

        should_trigger_payout = new_pending >= threshold

        print(f"  - Previous pending: ${current_pending}")
        print(f"  - New pending: ${new_pending}")
        print(f"  - Threshold: ${threshold}")
        print(f"  - Trigger payout: {should_trigger_payout}")

        if should_trigger_payout:
            print(f"  [PAYOUT] Threshold met! Ready to trigger smart contract")
            # TODO: Trigger smart contract here

        return {
            "earned_pending": new_pending,
            "payout_threshold": threshold,
            "should_trigger_payout": should_trigger_payout,
            "wallet_address": project.get("wallet_address")
        }


# Singleton instance
ai_workflow_service = AIWorkflowService()
