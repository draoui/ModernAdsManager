// Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  lastLogin?: string;
  lastPasswordChange?: string;
  twoFactorEnabled?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  securityIssues: string[];
}

// API Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

// Re-export all ad types
export * from './ads';