/**
 * Career Analysis API Integration
 * Handles skill gap analysis, roadmap generation, and project suggestions
 */

import { authFetch } from "./api-client";
import {
  SkillGapReport,
  Roadmap,
  RoadmapItem,
  ProjectIdea,
  AnalyzeSkillGapRequest,
  GenerateRoadmapRequest,
  GenerateProjectsRequest,
} from "./career-types";

/**
 * Analyze skill gaps for a target role
 */
export async function analyzeSkillGap(request: AnalyzeSkillGapRequest): Promise<SkillGapReport> {
  return authFetch<SkillGapReport>("/skill-gap", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

/**
 * Generate a career roadmap for a target role
 */
export async function generateRoadmap(request: GenerateRoadmapRequest): Promise<Roadmap> {
  return authFetch<Roadmap>("/roadmap", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

/**
 * Get roadmap items/details for a specific roadmap
 */
export async function getRoadmapDetails(roadmapId: string): Promise<RoadmapItem[]> {
  const data = await authFetch<{ id: string; items: RoadmapItem[] } | RoadmapItem[]>(`/roadmap/${roadmapId}`, {
    method: "GET",
  });
  return Array.isArray(data) ? data : data.items || [];
}

/**
 * Generate project suggestions for career development
 */
export async function suggestProjects(request: GenerateProjectsRequest): Promise<ProjectIdea[]> {
  const data = await authFetch<ProjectIdea[] | { projects: ProjectIdea[] }>("/projects", {
    method: "POST",
    body: JSON.stringify(request),
  });
  return Array.isArray(data) ? data : data.projects || [];
}
