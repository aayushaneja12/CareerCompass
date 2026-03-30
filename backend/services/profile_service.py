"""
Profile service for CRUD operations on user career profiles.
"""
from typing import Optional
from datetime import datetime
from backend.supabase_client import supabase
from backend.models import UserProfile, ProfileUpdateRequest


class ProfileService:
    @staticmethod
    def _db_to_model(row: dict) -> dict:
        """Normalize DB row keys to API model keys."""
        normalized = dict(row or {})
        if "current_role" not in normalized and "current_position" in normalized:
            normalized["current_role"] = normalized.get("current_position")
        return normalized

    @staticmethod
    def _model_to_db(payload: dict) -> dict:
        """Map API model keys to DB column names."""
        mapped = dict(payload or {})
        if "current_role" in mapped:
            mapped["current_position"] = mapped.pop("current_role")
        return mapped

    @staticmethod
    async def get_or_create_profile(user_id: str, user_email: Optional[str] = None) -> UserProfile:
        """Fetch existing profile or create a new one."""
        try:
            response = supabase.table("user_profiles").select("*").eq("user_id", user_id).execute()
            if response.data:
                row = dict(response.data[0])
                if user_email and row.get("email") != user_email:
                    patched = (
                        supabase.table("user_profiles")
                        .update({"email": user_email, "updated_at": datetime.utcnow().isoformat()})
                        .eq("user_id", user_id)
                        .execute()
                    )
                    if patched.data:
                        row = dict(patched.data[0])
                return UserProfile(**ProfileService._db_to_model(row))
            
            # Create new profile
            new_profile = {
                "user_id": user_id,
                "email": user_email,
                "target_roles": [],
                "preferred_industries": [],
                "skills": [],
                "certifications": [],
                "interests": {},
                "strengths": [],
                "weak_areas": [],
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
            }
            response = supabase.table("user_profiles").insert(new_profile).execute()
            return UserProfile(**ProfileService._db_to_model(response.data[0]))
        except Exception as e:
            print(f"Error getting/creating profile: {e}")
            raise

    @staticmethod
    async def get_profile(user_id: str) -> Optional[UserProfile]:
        """Fetch user profile."""
        try:
            response = supabase.table("user_profiles").select("*").eq("user_id", user_id).execute()
            if response.data:
                return UserProfile(**ProfileService._db_to_model(response.data[0]))
            return None
        except Exception as e:
            print(f"Error fetching profile: {e}")
            raise

    @staticmethod
    async def update_profile(user_id: str, update_req: ProfileUpdateRequest) -> UserProfile:
        """Update user profile."""
        try:
            payload = update_req.model_dump(exclude_none=True)
            payload = ProfileService._model_to_db(payload)
            payload["updated_at"] = datetime.utcnow().isoformat()
            
            response = (
                supabase.table("user_profiles")
                .update(payload)
                .eq("user_id", user_id)
                .execute()
            )
            
            if response.data:
                return UserProfile(**ProfileService._db_to_model(response.data[0]))
            raise Exception("Profile not found")
        except Exception as e:
            print(f"Error updating profile: {e}")
            raise

    @staticmethod
    async def extract_profile_from_text(user_id: str, text: str) -> dict:
        """
        Extract structured profile data from conversational text.
        Called from LLM-based extraction in chat.
        
        Returns:
            dict with extracted fields (skills, roles, goals, etc.)
        """
        # This is called after an LLM extraction tool runs
        # For now, return empty; real implementation would parse LLM output
        return {}

    @staticmethod
    async def add_skill(user_id: str, skill: str) -> UserProfile:
        """Add a skill to user profile."""
        try:
            profile = await ProfileService.get_profile(user_id)
            if not profile:
                raise Exception("Profile not found")
            
            if skill not in profile.skills:
                profile.skills.append(skill)
            
            update_req = ProfileUpdateRequest(skills=profile.skills)
            return await ProfileService.update_profile(user_id, update_req)
        except Exception as e:
            print(f"Error adding skill: {e}")
            raise

    @staticmethod
    async def set_target_role(user_id: str, role: str) -> UserProfile:
        """Set or update target role."""
        try:
            profile = await ProfileService.get_profile(user_id)
            if not profile:
                raise Exception("Profile not found")
            
            if role not in profile.target_roles:
                profile.target_roles.append(role)
            
            update_req = ProfileUpdateRequest(target_roles=profile.target_roles)
            return await ProfileService.update_profile(user_id, update_req)
        except Exception as e:
            print(f"Error setting target role: {e}")
            raise
