/**
 * API Service Module
 * 
 * All external API calls go through this module.
 * Backend endpoints are configured via environment variables.
 * 
 * Required environment variables:
 * - VITE_API_BASE_URL: Base URL for the backend API
 */

import type { 
  User, 
  Job, 
  JobFilters, 
  Post, 
  ApiResponse, 
  PaginatedResponse,
  SkillExtractionResult,
  MatchResult,
  PaymentVerification
} from '@/types';

// API Base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.example.com';

// Helper to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || 'An error occurred' };
    }

    return { data };
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'Network error. Please try again.' };
  }
}

// ============================================
// AUTH ENDPOINTS
// ============================================

/**
 * Exchange Firebase ID token for application JWT
 * TODO: Backend should verify Firebase token and return app JWT + user data
 */
export const exchangeFirebaseToken = async (
  firebaseIdToken: string
): Promise<ApiResponse<{ token: string; user: User }>> => {
  return fetchApi('/auth/firebase-login', {
    method: 'POST',
    body: JSON.stringify({ idToken: firebaseIdToken }),
  });
};

// ============================================
// USER ENDPOINTS
// ============================================

/**
 * Get current user profile
 * TODO: Backend returns user profile for authenticated user
 */
export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  return fetchApi('/users/me');
};

/**
 * Create user profile (first-time setup)
 * TODO: Backend creates new user profile
 */
export const createUserProfile = async (
  profile: Partial<User>
): Promise<ApiResponse<User>> => {
  return fetchApi('/users', {
    method: 'POST',
    body: JSON.stringify(profile),
  });
};

/**
 * Update user profile
 * TODO: Backend updates user profile
 */
export const updateUserProfile = async (
  updates: Partial<User>
): Promise<ApiResponse<User>> => {
  return fetchApi('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};

// ============================================
// JOB ENDPOINTS
// ============================================

/**
 * Get jobs listing with optional filters
 * TODO: Backend returns paginated jobs list
 */
export const getJobs = async (
  filters?: JobFilters,
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<PaginatedResponse<Job>>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    ...(filters?.search && { search: filters.search }),
    ...(filters?.location && { location: filters.location }),
    ...(filters?.remote !== undefined && { remote: filters.remote.toString() }),
    ...(filters?.skills?.length && { skills: filters.skills.join(',') }),
    ...(filters?.tags?.length && { tags: filters.tags.join(',') }),
  });

  return fetchApi(`/jobs?${params}`);
};

/**
 * Get job by ID
 * TODO: Backend returns job details
 */
export const getJobById = async (id: string): Promise<ApiResponse<Job>> => {
  return fetchApi(`/jobs/${id}`);
};

/**
 * Create new job posting
 * TODO: Backend should validate payment verification before creating job
 */
export const createJob = async (
  job: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'postedBy'>
): Promise<ApiResponse<Job>> => {
  return fetchApi('/jobs', {
    method: 'POST',
    body: JSON.stringify(job),
  });
};

/**
 * Get recommended jobs for current user
 * TODO: Backend returns AI-recommended jobs based on user profile
 */
export const getRecommendedJobs = async (): Promise<ApiResponse<Job[]>> => {
  return fetchApi('/jobs?recommended=true');
};

// ============================================
// FEED/POST ENDPOINTS
// ============================================

/**
 * Get feed posts
 * TODO: Backend returns paginated posts
 */
export const getFeedPosts = async (
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<PaginatedResponse<Post>>> => {
  return fetchApi(`/posts?page=${page}&pageSize=${pageSize}`);
};

/**
 * Create new post
 * TODO: Backend creates new post
 */
export const createPost = async (
  content: string
): Promise<ApiResponse<Post>> => {
  return fetchApi('/posts', {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
};

/**
 * Like/unlike a post
 * TODO: Backend toggles like status
 */
export const togglePostLike = async (
  postId: string
): Promise<ApiResponse<{ liked: boolean; likes: number }>> => {
  return fetchApi(`/posts/${postId}/like`, {
    method: 'POST',
  });
};

/**
 * Add comment to post
 * TODO: Backend adds comment
 */
export const addComment = async (
  postId: string,
  content: string
): Promise<ApiResponse<Post>> => {
  return fetchApi(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
};

// ============================================
// PAYMENT ENDPOINTS
// ============================================

/**
 * Verify blockchain transaction
 * TODO: Backend verifies transaction on-chain and updates status
 */
export const verifyPayment = async (
  txHash: string,
  chain: 'evm' | 'solana'
): Promise<ApiResponse<PaymentVerification>> => {
  return fetchApi('/payments/verify', {
    method: 'POST',
    body: JSON.stringify({ txHash, chain }),
  });
};

// ============================================
// AI ENDPOINTS
// ============================================

/**
 * Extract skills from resume/text
 * TODO: Backend calls AI model to extract skills
 */
export const extractSkills = async (
  file?: File,
  text?: string
): Promise<ApiResponse<SkillExtractionResult>> => {
  if (file) {
    const formData = new FormData();
    formData.append('resume', file);
    
    const token = localStorage.getItem('auth_token');
    return fetch(`${API_BASE_URL}/ai/skill-extract`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    }).then(res => res.json());
  }

  return fetchApi('/ai/skill-extract', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
};

/**
 * Get match score between job and applicant
 * TODO: Backend calls AI model to compute match
 */
export const getMatchScore = async (
  jobId: string,
  profileSummary?: string
): Promise<ApiResponse<MatchResult>> => {
  return fetchApi('/ai/match', {
    method: 'POST',
    body: JSON.stringify({ jobId, profileSummary }),
  });
};

/**
 * Get AI recommendations
 * TODO: Backend returns AI-powered recommendations
 */
export const getAiRecommendations = async (
  type: 'jobs' | 'skills' | 'connections'
): Promise<ApiResponse<string[]>> => {
  return fetchApi(`/ai/recommend?type=${type}`);
};

export default {
  // Auth
  exchangeFirebaseToken,
  // User
  getCurrentUser,
  createUserProfile,
  updateUserProfile,
  // Jobs
  getJobs,
  getJobById,
  createJob,
  getRecommendedJobs,
  // Feed
  getFeedPosts,
  createPost,
  togglePostLike,
  addComment,
  // Payments
  verifyPayment,
  // AI
  extractSkills,
  getMatchScore,
  getAiRecommendations,
};
