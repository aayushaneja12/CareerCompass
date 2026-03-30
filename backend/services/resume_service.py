"""
Resume review service for analyzing and improving resumes.
"""
from typing import Optional, Any, Dict, List
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
    def _parse_json_object(content: Any) -> Optional[Dict[str, Any]]:
        if content is None:
            return None

        text = content if isinstance(content, str) else str(content)
        text = text.strip()
        if not text:
            return None

        try:
            parsed = json.loads(text)
            return parsed if isinstance(parsed, dict) else None
        except json.JSONDecodeError:
            pass

        if "```" in text:
            chunks = text.split("```")
            for chunk in chunks:
                candidate = chunk.strip()
                if candidate.lower().startswith("json"):
                    candidate = candidate[4:].strip()
                if not candidate:
                    continue
                try:
                    parsed = json.loads(candidate)
                    if isinstance(parsed, dict):
                        return parsed
                except json.JSONDecodeError:
                    continue

        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            candidate = text[start:end + 1]
            try:
                parsed = json.loads(candidate)
                return parsed if isinstance(parsed, dict) else None
            except json.JSONDecodeError:
                return None

        return None

    @staticmethod
    def _to_float(value: Any, default: float) -> float:
        try:
            return float(value)
        except (TypeError, ValueError):
            return default

    @staticmethod
    def _normalize_string_list(value: Any) -> List[str]:
        if value is None:
            return []
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        if isinstance(value, str):
            text = value.strip()
            return [text] if text else []
        return []

    @staticmethod
    def _normalize_dict(value: Any) -> Dict[str, Any]:
        return value if isinstance(value, dict) else {}

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
            
            analysis = ResumeService._parse_json_object(response.content)
            if analysis is None:
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
                "score": ResumeService._to_float(analysis.get("score", 50), 50),
                "ats_score": ResumeService._to_float(analysis.get("ats_score", 50), 50),
                "strengths": ResumeService._normalize_string_list(analysis.get("strengths", [])),
                "weaknesses": ResumeService._normalize_string_list(analysis.get("weaknesses", [])),
                "keyword_gaps": ResumeService._normalize_string_list(analysis.get("keyword_gaps", [])),
                "summary_suggestions": analysis.get("summary_suggestions"),
                "headline_suggestions": ResumeService._normalize_string_list(analysis.get("headline_suggestions", [])),
                "bullet_improvements": ResumeService._normalize_dict(analysis.get("bullet_improvements", {})),
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
