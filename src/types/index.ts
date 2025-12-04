// User types
export interface User {
  id: string;
  email: string;
  displayName: string;
  fullName?: string;
  bio?: string;
  linkedinUrl?: string;
  resumeUrl?: string;
  skills: string[];
  walletAddress?: string;
  avatarUrl?: string;
  profileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

// Job types
export interface Job {
  id: string;
  title: string;
  description: string;
  company?: string;
  requiredSkills: string[];
  budget?: {
    min?: number;
    max?: number;
    currency: string;
    type: 'hourly' | 'fixed' | 'annual';
  };
  location?: string;
  remote: boolean;
  tags: string[];
  applicationLink?: string;
  postedBy: string;
  postedByUser?: Pick<User, 'id' | 'displayName' | 'avatarUrl'>;
  status: 'active' | 'closed' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface JobFilters {
  search?: string;
  skills?: string[];
  location?: string;
  remote?: boolean;
  tags?: string[];
  minBudget?: number;
  maxBudget?: number;
}

// Post types
export interface Post {
  id: string;
  content: string;
  authorId: string;
  author?: Pick<User, 'id' | 'displayName' | 'avatarUrl'>;
  likes: number;
  likedByUser?: boolean;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author?: Pick<User, 'id' | 'displayName' | 'avatarUrl'>;
  createdAt: string;
}

// Wallet types
export type WalletType = 'metamask' | 'phantom';
export type ChainType = 'evm' | 'solana';

export interface WalletState {
  connected: boolean;
  address: string | null;
  balance: string | null;
  chain: ChainType | null;
  walletType: WalletType | null;
  isTestnet: boolean;
}

// AI types
export interface SkillExtractionResult {
  skills: string[];
  confidence: number;
}

export interface MatchResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}

// Payment types
export interface PaymentVerification {
  txHash: string;
  chain: ChainType;
  amount: string;
  status: 'pending' | 'verified' | 'failed';
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
