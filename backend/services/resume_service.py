"""
Resume review service for analyzing and improving resumes.
"""
from typing import Optional
from datetime import datetime
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage
import json
import os
from backend.supabase_client import supabase
from backend.models import ResumeReview


GROQ_API_KEY = os.getenv("GROQ_API_KEY")
llm = ChatGroq(model="llama-3.3-70b-versatile", groq_api_key=GROQ_API_KEY)


class ResumeService:
    @staticmethod
    async def analyze_resume(
        user_id: str,
        resume_text: str,
        target_role: Optional[str] = None,
    ) -> ResumeReview:
        """
        Analyze a resume and provide structured feedback.
        """
        try:
            role_context = f"Target Role: {target_role}\n" if target_role else ""
            
            prompt = f"""You are an expert resume reviewer and recruiter.

{role_context}

Resume:
{resume_text}

Provide a detailed resume review in JSON format:
{{
  "score": 75,  // 0-100 overall quality
  "ats_score": 80,  // ATS (Applicant Tracking System) compatibility
  "strengths": [
    "Well-organized experience section",
    "Strong action verbs"
  ],
  "weaknesses": [
    "Missing quantifiable metrics",
    "Weak summary section"
  ],
  "keyword_gaps": [
    "Missing industry-specific keywords",
    "Limited technical terminology"
  ],
  "summary_suggestions": "Your professional summary should emphasize X...",
  "headline_suggestions": [
    "Data Analyst | SQL & Python | 3+ Years Analytics"
  ],
  "bullet_improvements": {{
    "current": "Responsible for sales reporting",
    "improved": "Increased sales reporting efficiency by 40% using Python automation"
  }}
}}

Focus on:
1. Structure and format clarity
2. Quantifiable achievements
3. Action verbs and impact
4. ATS compatibility (simple formatting)
5. Relevance to role if provided
6. Specific, actionable improvements

Return only valid JSON."""
            
            response = llm.invoke([
                SystemMessage(content="You are a resume expert. Respond only with valid JSON."),
                HumanMessage(content=prompt)
            ])
            
            try:
                analysis = json.loads(response.content)
            except json.JSONDecodeError:
                analysis = {
                    "score": 50,
                    "ats_score": 50,
                    "strengths": [],
                    "weaknesses": ["Unable to parse - try reformatting"],
                    "keyword_gaps": [],
                    "summary_suggestions": None,
                    "headline_suggestions": [],
                    "bullet_improvements": {}
                }
            
            # Save to database
            review_data = {
                "user_id": user_id,
                "resume_text": resume_text,
                "target_role": target_role,
                "score": analysis.get("score", 50),
                "ats_score": analysis.get("ats_score", 50),
                "strengths": analysis.get("strengths", []),
                "weaknesses": analysis.get("weaknesses", []),
                "keyword_gaps": analysis.get("keyword_gaps", []),
                "summary_suggestions": analysis.get("summary_suggestions"),
                "headline_suggestions": analysis.get("headline_suggestions", []),
                "bullet_improvements": analysis.get("bullet_improvements", {}),
                "created_at": datetime.utcnow().isoformat(),
                "reviewed_at": datetime.utcnow().isoformat(),
            }
            
            response = supabase.table("resume_reviews").insert(review_data).execute()
            return ResumeReview(**response.data[0])
        
        except Exception as e:
            print(f"Error analyzing resume: {e}")
            raise

    @staticmethod
    async def get_latest_review(user_id: str) -> Optional[ResumeReview]:
        """Fetch most recent resume review."""
        try:
            response = (
                supabase.table("resume_reviews")
                .select("*")
                .eq("user_id", user_id)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )
            if response.data:
                return ResumeReview(**response.data[0])
            return None
        except Exception as e:
            print(f"Error fetching resume review: {e}")
            raise
