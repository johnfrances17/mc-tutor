import { Request } from 'express';

// Extend Express Request type to include authenticated user
export interface AuthRequest extends Request {
  user?: {
    user_id: number;
    school_id: string;
    email: string;
    role: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
  };
}

// User type definition
export interface User {
  user_id: number;
  school_id: string;
  email: string;
  password: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  role: 'admin' | 'tutor' | 'tutee';
  phone?: string | null;
  year_level?: string | null;
  course?: string | null;
  profile_picture?: string | null;
  bio?: string | null;
  chat_pin_hash?: string | null;
  status: 'active' | 'inactive';
  last_active: string;
  created_at: string;
  updated_at: string;
  last_password_change?: string;
  failed_login_attempts?: number;
  last_failed_login?: string;
  account_locked_until?: string;
}

// Helper function to get full name
export function getFullName(user: Pick<User, 'first_name' | 'middle_name' | 'last_name'>): string {
  if (user.middle_name && user.middle_name.trim()) {
    return `${user.first_name} ${user.middle_name} ${user.last_name}`;
  }
  return `${user.first_name} ${user.last_name}`;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

// File upload types
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}
