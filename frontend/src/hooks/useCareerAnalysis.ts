/**
 * useCareerAnalysis Hook
 * Manages career analysis operations (skill gap, roadmap, projects, resume)
 */

import { useState } from "react";
import {
  SkillGapReport,
  Roadmap,
  RoadmapItem,
  ProjectIdea,
  ResumeReview,
  AnalyzeSkillGapRequest,
  GenerateRoadmapRequest,
  GenerateProjectsRequest,
  AnalyzeResumeRequest,
} from "@/integrations/supabase/career-types";
import * as careerAPI from "@/integrations/supabase/career";
import * as resumeAPI from "@/integrations/supabase/resume";

interface UseCareerAnalysisReturn {
  skillGapReport: SkillGapReport | null;
  roadmap: Roadmap | null;
  roadmapItems: RoadmapItem[];
  projects: ProjectIdea[];
  resumeReview: ResumeReview | null;

  isAnalyzingSkillGap: boolean;
  isGeneratingRoadmap: boolean;
  isGeneratingProjects: boolean;
  isAnalyzingResume: boolean;
  isFetchingRoadmapDetails: boolean;

  error: string | null;

  analyzeSkillGap: (request: AnalyzeSkillGapRequest) => Promise<SkillGapReport>;
  generateRoadmap: (request: GenerateRoadmapRequest) => Promise<Roadmap>;
  fetchRoadmapItems: (roadmapId: string) => Promise<RoadmapItem[]>;
  suggestProjects: (request: GenerateProjectsRequest) => Promise<ProjectIdea[]>;
  analyzeResume: (request: AnalyzeResumeRequest) => Promise<ResumeReview>;

  clearError: () => void;
  resetAll: () => void;
}

export function useCareerAnalysis(): UseCareerAnalysisReturn {
  const [skillGapReport, setSkillGapReport] = useState<SkillGapReport | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [projects, setProjects] = useState<ProjectIdea[]>([]);
  const [resumeReview, setResumeReview] = useState<ResumeReview | null>(null);

  const [isAnalyzingSkillGap, setIsAnalyzingSkillGap] = useState(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [isFetchingRoadmapDetails, setIsFetchingRoadmapDetails] = useState(false);
  const [isGeneratingProjects, setIsGeneratingProjects] = useState(false);
  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown, context: string) => {
    const errorMessage = err instanceof Error ? err.message : `Error in ${context}`;
    setError(errorMessage);
    console.error(`${context}:`, err);
  };

  const analyzeSkillGap = async (request: AnalyzeSkillGapRequest): Promise<SkillGapReport> => {
    try {
      setIsAnalyzingSkillGap(true);
      setError(null);
      const result = await careerAPI.analyzeSkillGap(request);
      setSkillGapReport(result);
      return result;
    } catch (err) {
      handleError(err, "Skill Gap Analysis");
      throw err;
    } finally {
      setIsAnalyzingSkillGap(false);
    }
  };

  const generateRoadmap = async (request: GenerateRoadmapRequest): Promise<Roadmap> => {
    try {
      setIsGeneratingRoadmap(true);
      setError(null);
      const result = await careerAPI.generateRoadmap(request);
      setRoadmap(result);
      return result;
    } catch (err) {
      handleError(err, "Roadmap Generation");
      throw err;
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const fetchRoadmapItems = async (roadmapId: string): Promise<RoadmapItem[]> => {
    try {
      setIsFetchingRoadmapDetails(true);
      setError(null);
      const items = await careerAPI.getRoadmapDetails(roadmapId);
      setRoadmapItems(items);
      return items;
    } catch (err) {
      handleError(err, "Roadmap Items Fetch");
      throw err;
    } finally {
      setIsFetchingRoadmapDetails(false);
    }
  };

  const suggestProjects = async (request: GenerateProjectsRequest): Promise<ProjectIdea[]> => {
    try {
      setIsGeneratingProjects(true);
      setError(null);
      const result = await careerAPI.suggestProjects(request);
      setProjects(result);
      return result;
    } catch (err) {
      handleError(err, "Project Generation");
      throw err;
    } finally {
      setIsGeneratingProjects(false);
    }
  };

  const analyzeResume = async (request: AnalyzeResumeRequest): Promise<ResumeReview> => {
    try {
      setIsAnalyzingResume(true);
      setError(null);
      const result = await resumeAPI.analyzeResume(request);
      setResumeReview(result);
      return result;
    } catch (err) {
      handleError(err, "Resume Analysis");
      throw err;
    } finally {
      setIsAnalyzingResume(false);
    }
  };

  const clearError = () => setError(null);

  const resetAll = () => {
    setSkillGapReport(null);
    setRoadmap(null);
    setRoadmapItems([]);
    setProjects([]);
    setResumeReview(null);
    setError(null);
  };

  return {
    skillGapReport,
    roadmap,
    roadmapItems,
    projects,
    resumeReview,

    isAnalyzingSkillGap,
    isGeneratingRoadmap,
    isGeneratingProjects,
    isAnalyzingResume,
    isFetchingRoadmapDetails,

    error,

    analyzeSkillGap,
    generateRoadmap,
    fetchRoadmapItems,
    suggestProjects,
    analyzeResume,
    clearError,
    resetAll,
  };
}