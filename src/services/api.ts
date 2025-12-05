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
  ApiResponse,
  Job,
  JobFilters,
  MatchResult,
  PaginatedResponse,
  PaymentVerification,
  Post,
  SkillExtractionResult,
  User
} from '@/types';

// API Base URL from environment
// API Base URL from environment or default to local Python backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

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

    const responseData = await response.json();

    if (!response.ok) {
      return { error: responseData.message || responseData.detail || 'An error occurred' };
    }

    // Unwrap data if it exists in the response, otherwise use the whole response
    const data = responseData.data !== undefined ? responseData.data : responseData;

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
  return fetchApi('/auth/me');
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
/**
 * Update user profile
 * Supports file uploads (resume, avatar)
 */
export const updateUserProfile = async (
  updates: Partial<User> & { resume?: File; avatar?: File }
): Promise<ApiResponse<User>> => {
  const formData = new FormData();

  // Append text fields
  Object.keys(updates).forEach(key => {
    if (key !== 'resume' && key !== 'avatar' && updates[key as keyof typeof updates] !== undefined) {
      const value = updates[key as keyof typeof updates];
      if (Array.isArray(value) || typeof value === 'object') {
        formData.append(key, JSON.stringify(value)); // Handle arrays/objects if needed, or flatten
      } else {
        formData.append(key, String(value));
      }
    }
  });

  // Append files
  if (updates.resume) {
    formData.append('resume', updates.resume);
  }
  if (updates.avatar) {
    formData.append('avatar', updates.avatar);
  }

  // Special handling for skills array if backend expects it as individual fields or JSON
  // The backend controller maps req.body.skills directly. 
  // If using FormData, arrays often need special handling (e.g. skills[] or JSON string)
  // Let's send skills as a JSON string if it's an array, backend might need to parse it.
  // Actually, let's check how we appended it above.
  // If we append 'skills' as JSON.stringify(['a','b']), backend req.body.skills will be a string.
  // We might need to ensure backend parses it.
  // For now, let's assume backend can handle it or we adjust backend.
  // To be safe, let's append skills individually if backend supports it, or as JSON.
  // The current backend code: fieldsToUpdate['profile.skills'] = req.body.skills;
  // If req.body.skills is a string "[...]", it might be saved as a string.
  // Let's ensure we send it correctly.

  // Re-doing the loop to be more specific
  const finalFormData = new FormData();

  if (updates.fullName) finalFormData.append('fullName', updates.fullName);
  if (updates.displayName) finalFormData.append('displayName', updates.displayName);
  if (updates.title) finalFormData.append('title', updates.title);
  if (updates.bio) finalFormData.append('bio', updates.bio);
  if (updates.linkedinUrl) finalFormData.append('linkedinUrl', updates.linkedinUrl);
  if (updates.walletAddress) finalFormData.append('walletAddress', updates.walletAddress);

  if (updates.skills) {
    // Send as JSON string, backend might need to JSON.parse if it comes from FormData
    // OR send as multiple fields
    updates.skills.forEach(skill => finalFormData.append('skills', skill));
  }

  if (updates.resume) finalFormData.append('resume', updates.resume);
  if (updates.avatar) finalFormData.append('avatar', updates.avatar);

  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

  try {
    const response = await fetch(`${API_BASE_URL}/auth/updatedetails`, {
      method: 'PUT',
      headers, // Content-Type is auto-set
      body: finalFormData,
    });

    const responseData = await response.json();

    if (!response.ok) {
      return { error: responseData.message || responseData.detail || 'An error occurred' };
    }

    const data = responseData.data !== undefined ? responseData.data : responseData;
    return { data };
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'Network error. Please try again.' };
  }
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
    limit: pageSize.toString(),
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
 */
export const getFeedPosts = async (
  page: number = 1,
  pageSize: number = 20
): Promise<ApiResponse<PaginatedResponse<Post>>> => {
  return fetchApi(`/posts?page=${page}&limit=${pageSize}`);
};

/**
 * Create new post
 */
export const createPost = async (
  content: string,
  user?: { id: string; displayName: string; avatarUrl?: string },
  image?: File | null
): Promise<ApiResponse<Post>> => {
  const formData = new FormData();
  formData.append('content', content);
  formData.append('author_id', user?.id || "user_123");
  formData.append('author_name', user?.displayName || "Anonymous");
  if (user?.avatarUrl) {
    formData.append('author_avatar', user.avatarUrl);
  }
  if (image) {
    formData.append('image', image);
  }

  // Note: Content-Type header should NOT be set manually when using FormData
  // The browser sets it automatically with the boundary
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

  try {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const responseData = await response.json();

    if (!response.ok) {
      return { error: responseData.message || responseData.detail || 'An error occurred' };
    }

    const data = responseData.data !== undefined ? responseData.data : responseData;
    return { data };
  } catch (error) {
    console.error('API Error:', error);
    return { error: 'Network error. Please try again.' };
  }
};

/**
 * Delete a post
 */
export const deletePost = async (
  postId: string
): Promise<ApiResponse<void>> => {
  return fetchApi(`/posts/${postId}`, {
    method: 'DELETE',
  });
};

/**
 * Like/unlike a post
 */
export const togglePostLike = async (
  postId: string
): Promise<ApiResponse<string[]>> => {
  return fetchApi(`/posts/${postId}/like`, {
    method: 'POST',
  });
};

/**
 * Add comment to post
 */
export const addComment = async (
  postId: string,
  content: string
): Promise<ApiResponse<Post>> => {
  return fetchApi(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify({
      content,
      author_name: "Demo User", // Placeholder
      author_avatar: "https://github.com/shadcn.png" // Placeholder
    }),
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
// AI Features
export const extractSkills = async (file?: File, text?: string): Promise<ApiResponse<SkillExtractionResult>> => {
  try {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${AI_SERVICE_URL}/analyze-resume`, {
        method: 'POST',
        body: formData, // Content-Type header is automatically set by browser for FormData
      });
      const data = await res.json();
      return { data };
    } else if (text) {
      const formData = new FormData();
      formData.append('text', text);

      const res = await fetch(`${AI_SERVICE_URL}/analyze-resume`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      return { data };
    }
    return { error: "No input provided" };
  } catch (error) {
    console.error('AI Service Error:', error);
    return { error: "Failed to connect to AI service" };
  }
};

export const getMatchScore = async (jobDescription: string, resumeText: string): Promise<ApiResponse<MatchResult>> => {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/match-job`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resume_text: resumeText,
        job_description: jobDescription
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.detail || `Server error: ${res.status}` };
    }

    const data = await res.json();
    return { data };
  } catch (error) {
    console.error('AI Service Error:', error);
    return { error: "Failed to connect to AI service" };
  }
};

export const getAiRecommendations = async (jobs: Job[], profile: string): Promise<ApiResponse<any[]>> => {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/recommend-jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobs: jobs.map(j => ({
          id: j.id,
          title: j.title,
          description: j.description,
          skills: j.skills || []
        })),
        profile
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.detail || `Server error: ${res.status}` };
    }

    const data = await res.json();
    return { data: data.recommendations };
  } catch (error) {
    console.error('AI Service Error:', error);
    return { error: "Failed to connect to AI service" };
  }
};

export const generateCareerRoadmap = async (resumeText: string, skills: string[], desiredRole: string): Promise<ApiResponse<any>> => {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/generate-roadmap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resume_text: resumeText,
        skills: skills,
        desired_role: desiredRole
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.detail || `Server error: ${res.status}` };
    }

    const data = await res.json();
    return { data };
  } catch (error) {
    console.error('AI Service Error:', error);
    return { error: "Failed to connect to AI service" };
  }
};


export const generateInterviewQuestion = async (resumeText: string, jobDescription: string, difficulty: string, type: string): Promise<ApiResponse<any>> => {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/generate-interview-question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume_text: resumeText, job_description: jobDescription, difficulty, type })
    });
    const data = await res.json();
    return { data };
  } catch (error) {
    return { error: "Failed to connect to AI service" };
  }
};

export const evaluateInterviewAnswer = async (question: string, answer: string, jobDescription: string): Promise<ApiResponse<any>> => {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/evaluate-interview-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer, job_description: jobDescription })
    });
    const data = await res.json();
    return { data };
  } catch (error) {
    return { error: "Failed to connect to AI service" };
  }
};

export const generateAptitudeQuestion = async (topic: string, difficulty: string): Promise<ApiResponse<any>> => {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/generate-aptitude-question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, difficulty })
    });
    const data = await res.json();
    return { data };
  } catch (error) {
    return { error: "Failed to connect to AI service" };
  }
};

export const evaluateAptitudeAnswer = async (question: string, answer: string): Promise<ApiResponse<any>> => {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/evaluate-aptitude-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer })
    });
    const data = await res.json();
    return { data };
  } catch (error) {
    return { error: "Failed to connect to AI service" };
  }
};

export const chatWithAI = async (message: string, history: any[]): Promise<ApiResponse<string>> => {
  try {
    const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

    const res = await fetch(`${AI_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history })
    });
    const data = await res.json();
    return { data: data.message };
  } catch (error) {
    return { error: "Failed to connect to AI service" };
  }
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
  deletePost,
  togglePostLike,
  addComment,
  // Payments
  verifyPayment,
  // AI
  extractSkills,
  getMatchScore,
  getAiRecommendations,
  chatWithAI,
  generateCareerRoadmap,
  // Interview
  generateInterviewQuestion,
  evaluateInterviewAnswer,
  // Aptitude
  generateAptitudeQuestion,
  evaluateAptitudeAnswer
};
