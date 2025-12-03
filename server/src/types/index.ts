import { Request } from 'express';

// Extend Express Request type to include authenticated user
export interface AuthRequest extends Request {
  user?: {
    user_id: number;
    student_id: string;
    email: string;
    role: string;
    full_name: string;
  };
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
