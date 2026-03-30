/**
 * Resume Review API Integration
 * Handles resume analysis and feedback
 */

import { authFetch } from "./api-client";
import { ResumeReview, AnalyzeResumeRequest } from "./career-types";

/**
 * Analyze a resume
 */
export async function analyzeResume(request: AnalyzeResumeRequest): Promise<ResumeReview> {
  return authFetch<ResumeReview>("/resume-review", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
