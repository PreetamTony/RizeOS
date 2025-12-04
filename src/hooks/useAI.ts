import { useState, useCallback } from 'react';
import api from '@/services/api';
import type { SkillExtractionResult, MatchResult } from '@/types';

interface UseAIReturn {
  // Skill extraction
  extractSkills: (file?: File, text?: string) => Promise<SkillExtractionResult | null>;
  isExtracting: boolean;
  extractionError: string | null;
  
  // Match scoring
  getMatchScore: (jobId: string, profileSummary?: string) => Promise<MatchResult | null>;
  isMatching: boolean;
  matchError: string | null;
  
  // Recommendations
  getRecommendations: (type: 'jobs' | 'skills' | 'connections') => Promise<string[] | null>;
  isLoadingRecommendations: boolean;
  recommendationError: string | null;
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
    jobId: string,
    profileSummary?: string
  ): Promise<MatchResult | null> => {
    setIsMatching(true);
    setMatchError(null);

    try {
      const response = await api.getMatchScore(jobId, profileSummary);
      
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
    type: 'jobs' | 'skills' | 'connections'
  ): Promise<string[] | null> => {
    setIsLoadingRecommendations(true);
    setRecommendationError(null);

    try {
      const response = await api.getAiRecommendations(type);
      
      if (response.error) {
        setRecommendationError(response.error);
        return null;
      }

      return response.data || null;
    } catch (error) {
      setRecommendationError('Failed to load recommendations. Please try again.');
      return null;
    } finally {
      setIsLoadingRecommendations(false);
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
  };
};
