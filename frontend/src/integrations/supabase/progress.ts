import { authFetch } from "./api-client";
import { ProgressMetrics } from "./career-types";

export type ProgressUpsertPayload = {
  week_start: string;
  week_end: string;
  weekly_goals: Array<{ goal: string; status: string }>;
  accomplishments: string[];
  challenges: string[];
  total_minutes_learning: number;
  projects_started: number;
  projects_completed: number;
  recommended_focus: string[];
};

export async function getProgress(weekStart?: string): Promise<ProgressMetrics> {
  const query = weekStart ? `?week_start=${encodeURIComponent(weekStart)}` : "";
  return authFetch<ProgressMetrics>(`/progress${query}`, { method: "GET" });
}

export async function saveProgress(payload: ProgressUpsertPayload): Promise<ProgressMetrics> {
  return authFetch<ProgressMetrics>("/progress", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
