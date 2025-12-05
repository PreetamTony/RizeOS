import api from '@/services/api';
import type { MatchResult, SkillExtractionResult } from '@/types';
import { useCallback, useState } from 'react';

interface UseAIReturn {
  // Skill extraction
  extractSkills: (file?: File, text?: string) => Promise<SkillExtractionResult | null>;
  isExtracting: boolean;
  extractionError: string | null;

  // Match scoring
  getMatchScore: (jobDescription: string, resumeText: string) => Promise<MatchResult | null>;
  isMatching: boolean;
  matchError: string | null;

  // Recommendations
  getRecommendations: (profile: string) => Promise<any[] | null>;
  isLoadingRecommendations: boolean;
  recommendationError: string | null;

  // Roadmap
  generateRoadmap: (resumeText: string, skills: string[], desiredRole: string) => Promise<any | null>;
  isGeneratingRoadmap: boolean;
  roadmapError: string | null;

  // Interview
  generateInterviewQuestion: (resumeText: string, jobDescription: string, difficulty: string, type: string) => Promise<any>;
  evaluateInterviewAnswer: (question: string, answer: string, jobDescription: string) => Promise<any>;
  isInterviewLoading: boolean;

  // Aptitude
  generateAptitudeQuestion: (topic: string, difficulty: string) => Promise<any>;
  evaluateAptitudeAnswer: (question: string, answer: string) => Promise<any>;
  isAptitudeLoading: boolean;
}

export const useAI = (): UseAIReturn => {
  // Skill extraction state
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  // Match scoring state
  const [isMatching, setIsMatching] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  // Recommendations state
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  // Roadmap state
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);

  const extractSkills = useCallback(async (
    file?: File,
    text?: string
  ): Promise<SkillExtractionResult | null> => {
    if (!file && !text) {
      setExtractionError('Please provide a file or text to extract skills from');
      return null;
    }

    setIsExtracting(true);
    setExtractionError(null);

    try {
      const response = await api.extractSkills(file, text);

      if (response.error) {
        setExtractionError(response.error);
        return null;
      }

      return response.data || null;
    } catch (error) {
      setExtractionError('Failed to extract skills. Please try again.');
      return null;
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const getMatchScore = useCallback(async (
    jobDescription: string,
    resumeText: string
  ): Promise<MatchResult | null> => {
    setIsMatching(true);
    setMatchError(null);

    try {
      const response = await api.getMatchScore(jobDescription, resumeText);

      if (response.error) {
        setMatchError(response.error);
        return null;
      }

      return response.data || null;
    } catch (error) {
      setMatchError('Failed to calculate match score. Please try again.');
      return null;
    } finally {
      setIsMatching(false);
    }
  }, []);

  const getRecommendations = useCallback(async (
    profile: string
  ): Promise<any[] | null> => {
    setIsLoadingRecommendations(true);
    setRecommendationError(null);

    try {
      // 1. Fetch available jobs first
      const jobsResponse = await api.getJobs(undefined, 1, 20); // Fetch top 20 jobs
      console.log('Jobs Response for AI:', jobsResponse);

      if (jobsResponse.error) {
        console.error('Job fetch error:', jobsResponse.error);
        setRecommendationError(`Failed to fetch jobs: ${jobsResponse.error}`);
        return null;
      }

      // Handle different response structures (unwrapped vs wrapped)
      const jobsList = jobsResponse.data?.data || (Array.isArray(jobsResponse.data) ? jobsResponse.data : []);

      if (!jobsList || jobsList.length === 0) {
        console.error('No jobs found in response:', jobsResponse);
        setRecommendationError('No jobs available for analysis');
        return null;
      }

      // 2. Send to AI for ranking
      const response = await api.getAiRecommendations(jobsList, profile);

      if (response.error) {
        setRecommendationError(response.error);
        return null;
      }

      // 3. Merge AI results with job details
      const enrichedRecommendations = (response.data || []).map((rec: any) => {
        const job = jobsList.find((j: any) => j.id === rec.jobId);
        return {
          ...rec,
          title: job?.title || 'Unknown Job',
          company: job?.company || 'Unknown Company',
          location: job?.location || 'Unknown Location'
        };
      });

      return enrichedRecommendations;
    } catch (error) {
      setRecommendationError('Failed to load recommendations. Please try again.');
      return null;
    } finally {
      setIsLoadingRecommendations(false);
    }
  }, []);

  const generateRoadmap = useCallback(async (
    resumeText: string,
    skills: (string | { name: string; level: string })[],
    desiredRole: string
  ): Promise<any | null> => {
    setIsGeneratingRoadmap(true);
    setRoadmapError(null);

    try {
      // Normalize skills to string array for backend compatibility if needed, 
      // or send as is if backend supports objects. 
      // For now, let's map to strings for the roadmap generation to be safe, 
      // as the roadmap endpoint might expect strings.
      const skillStrings = skills.map(s => typeof s === 'string' ? s : s.name);

      const response = await api.generateCareerRoadmap(resumeText, skillStrings, desiredRole);

      if (response.error) {
        setRoadmapError(response.error);
        return null;
      }

      return response.data || null;
    } catch (error) {
      setRoadmapError('Failed to generate career roadmap. Please try again.');
      return null;
    } finally {
      setIsGeneratingRoadmap(false);
    }
  }, []);

  // Interview & Aptitude State
  const [isInterviewLoading, setIsInterviewLoading] = useState(false);
  const [isAptitudeLoading, setIsAptitudeLoading] = useState(false);

  const generateInterviewQuestion = useCallback(async (resumeText: string, jobDescription: string, difficulty: string, type: string) => {
    setIsInterviewLoading(true);
    try {
      const res = await api.generateInterviewQuestion(resumeText, jobDescription, difficulty, type);
      return res.data;
    } catch (e) {
      return null;
    } finally {
      setIsInterviewLoading(false);
    }
  }, []);

  const evaluateInterviewAnswer = useCallback(async (question: string, answer: string, jobDescription: string) => {
    setIsInterviewLoading(true);
    try {
      const res = await api.evaluateInterviewAnswer(question, answer, jobDescription);
      return res.data;
    } catch (e) {
      return null;
    } finally {
      setIsInterviewLoading(false);
    }
  }, []);

  const generateAptitudeQuestion = useCallback(async (topic: string, difficulty: string) => {
    setIsAptitudeLoading(true);
    try {
      const res = await api.generateAptitudeQuestion(topic, difficulty);
      return res.data;
    } catch (e) {
      return null;
    } finally {
      setIsAptitudeLoading(false);
    }
  }, []);

  const evaluateAptitudeAnswer = useCallback(async (question: string, answer: string) => {
    setIsAptitudeLoading(true);
    try {
      const res = await api.evaluateAptitudeAnswer(question, answer);
      return res.data;
    } catch (e) {
      return null;
    } finally {
      setIsAptitudeLoading(false);
    }
  }, []);

  return {
    extractSkills,
    isExtracting,
    extractionError,
    getMatchScore,
    isMatching,
    matchError,
    getRecommendations,
    isLoadingRecommendations,
    recommendationError,
    generateRoadmap,
    isGeneratingRoadmap,
    roadmapError,
    // Interview
    generateInterviewQuestion,
    evaluateInterviewAnswer,
    isInterviewLoading,
    // Aptitude
    generateAptitudeQuestion,
    evaluateAptitudeAnswer,
    isAptitudeLoading,
  };
};
