from typing import List, Dict
from datetime import datetime
from app.database import get_database


class CommitAnalyzerService:
    """Service for analyzing commits and managing payout logic"""

    async def store_commit_analysis(self, analysis_data: Dict) -> str:
        """Store commit analysis in database"""
        db = get_database()
        collection = db["commit_analyses"]

        analysis_data["created_at"] = datetime.utcnow()
        result = await collection.insert_one(analysis_data)
        return str(result.inserted_id)

    async def update_project_earnings(self, project_id: str, amount: float) -> Dict:
        """Update project's pending earnings and check threshold"""
        db = get_database()
        projects = db["projects"]

        # Get current project
        project = await projects.find_one({"project_id": project_id})
        if not project:
            raise ValueError(f"Project {project_id} not found")

        # Update earnings
        new_pending = project.get("earned_pending", 0.0) + amount
        threshold = project.get("payout_threshold", 100.0)

        update_data = {
            "earned_pending": new_pending,
            "updated_at": datetime.utcnow()
        }

        await projects.update_one(
            {"project_id": project_id},
            {"$set": update_data}
        )

        # Check if threshold met
        should_trigger_payout = new_pending >= threshold

        return {
            "project_id": project_id,
            "earned_pending": new_pending,
            "payout_threshold": threshold,
            "should_trigger_payout": should_trigger_payout,
            "freelancer_wallet": project["freelancer_wallet_address"]
        }

    async def prepare_for_ai_analysis(self, commits_data: List[Dict], project_context: Dict) -> Dict:
        """Prepare data structure for AI agent analysis"""
        return {
            "project_context": {
                "project_id": project_context["project_id"],
                "conversation": project_context["conversation"],
                "freelancer": project_context["freelancer_github_username"],
                "repo": f"{project_context['repo_owner']}/{project_context['repo_name']}"
            },
            "commits": commits_data,
            "total_commits": len(commits_data),
            "analysis_request": {
                "task": "analyze_batch_commits",
                "instructions": """
                Analyze these commits holistically as a batch:
                1. What collective feature or work was accomplished?
                2. Assess code quality and completeness
                3. Check alignment with project tasks/budget
                4. Detect any gaming patterns (empty commits, trivial changes)
                5. Recommend fair payout amount based on work value

                Return: {
                    "total_payout_amount": <float>,
                    "reasoning": <string>,
                    "confidence": <float 0-1>,
                    "flags": [<list of concerns>],
                    "commits_summary": <string>
                }
                """
            }
        }

    async def get_project_analytics(self, project_id: str) -> Dict:
        """Get analytics for a project"""
        db = get_database()

        # Get project
        project = await db["projects"].find_one({"project_id": project_id})
        if not project:
            return None

        # Get all analyses
        analyses = await db["commit_analyses"].find({"project_id": project_id}).to_list(length=None)

        total_analyses = len(analyses)
        total_commits_analyzed = sum(a.get("total_commits", 0) for a in analyses)
        total_earned = sum(a.get("total_payout_amount", 0) for a in analyses)

        return {
            "project_id": project_id,
            "earned_pending": project.get("earned_pending", 0.0),
            "total_paid": project.get("total_paid", 0.0),
            "total_analyses": total_analyses,
            "total_commits_analyzed": total_commits_analyzed,
            "total_earned": total_earned,
            "status": project.get("status", "active")
        }


# Singleton instance
commit_analyzer_service = CommitAnalyzerService()
