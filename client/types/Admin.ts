/**
 * Authentication DTOs
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string; // minLength: 8
}

export interface AuthenticationRequest {
  username: string;
  password: string; // minLength: 8
}

export interface AuthenticationResponse {
  token: string;
}

/**
 * Image and Report DTOs
 */
export interface SubmitReportRequestDTO {
  description?: string;
}

export interface HintResponseDTO {
  fake: boolean;
  signs: string[];
}

export interface ImageReportResponseDTO {
  reportId: number;
  imageId: string;
  imageUrl: string;
  username: string;
  description?: string;
  timestamp: string; // ISO date-time format
  resolved: boolean;
}

/**
 * Admin DTOs
 */
export interface AdminUserDTO {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: string; // ISO date-time format
  lastLoginAt: string; // ISO date-time format
  totalGames: number;
  totalScore: number;
  accuracy: number;
  role: 'user' | 'admin';
}

export interface AdminUserListResponseDTO {
  users: AdminUserDTO[];
  totalUsers: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminUserDetailsDTO extends AdminUserDTO {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  website?: string;
  timezone?: string;
  language: string;
  loginHistory: AdminLoginHistoryDTO[];
  gameHistory: AdminGameHistoryDTO[];
}

export interface AdminLoginHistoryDTO {
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  location: string;
  success: boolean;
}

export interface AdminGameHistoryDTO {
  gameId: string;
  createdAt: string;
  score: number;
  accuracy: number;
  totalImages: number;
  correctGuesses: number;
  difficulty: number;
  finished: boolean;
}

export interface AdminUserUpdateDTO {
  isActive?: boolean;
  role?: 'user' | 'admin';
}

export interface AdminDashboardStatsDTO {
  totalUsers: number;
  activeUsers: number;
  totalGames: number;
  totalImages: number;
  pendingReports: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}
