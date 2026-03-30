/**
 * useProfile Hook
 * Manages user profile state and operations
 */

import { useState, useEffect } from "react";
import { UserProfile, ProfileUpdateRequest } from "@/integrations/supabase/career-types";
import * as profileAPI from "@/integrations/supabase/profile";

interface UseProfileReturn {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  updateUserProfile: (updates: ProfileUpdateRequest) => Promise<UserProfile>;
  refetch: () => Promise<void>;
  isUpdating: boolean;
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await profileAPI.getProfile();
      setProfile(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load profile";
      setError(errorMessage);
      console.error("Error loading profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (updates: ProfileUpdateRequest): Promise<UserProfile> => {
    try {
      setIsUpdating(true);
      setError(null);
      const updated = await profileAPI.updateProfile(updates);
      setProfile(updated);
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return {
    profile,
    isLoading,
    error,
    updateUserProfile,
    refetch: loadProfile,
    isUpdating,
  };
}
