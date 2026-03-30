/**
 * Profile API Integration
 * Handles user profile operations
 */

import { authFetch } from "./api-client";
import { UserProfile, ProfileUpdateRequest } from "./career-types";

/**
 * Get current user's profile
 */
export async function getProfile(): Promise<UserProfile> {
  return authFetch<UserProfile>("/profile", { method: "GET" });
}

/**
 * Update user's profile
 */
export async function updateProfile(updates: ProfileUpdateRequest): Promise<UserProfile> {
  return authFetch<UserProfile>("/profile", {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}
