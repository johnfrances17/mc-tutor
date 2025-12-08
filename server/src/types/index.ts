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

// Course type definition
export interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
  department?: string | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
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
  year_level?: number | null;  // 1-4
  course_code?: string | null; // BSA, BSBA, BSED, BSN, BSCS, BSCrim
  profile_picture?: string | null;
  bio?: string | null;
  chat_pin?: string | null;
  status: 'active' | 'inactive';
  last_active: string;
  created_at: string;
  updated_at: string;
  last_password_change?: string;
  failed_login_attempts?: number;
  last_failed_login?: string;
  account_locked_until?: string;
}

// Subject type definition
export interface Subject {
  subject_id: number;
  subject_code: string;  // BSA001, BSBA001, etc.
  subject_name: string;
  course_code: string;   // BSA, BSBA, BSED, BSN, BSCS, BSCrim
  description?: string | null;
  created_at: string;
  updated_at: string;
}

// Tutor Subject type definition
export interface TutorSubject {
  tutor_subject_id: number;
  tutor_id: number;
  subject_id: number;
  proficiency_level?: 'beginner' | 'intermediate' | 'expert' | null;
  years_of_experience?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Tutor Availability type definition
export interface TutorAvailability {
  availability_id: number;
  tutor_id: number;
  day_of_week: number;  // 0=Sunday, 6=Saturday
  start_time: string;   // TIME format
  end_time: string;     // TIME format
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

// Session type definition
export interface Session {
  session_id: number;
  tutee_id: number;
  tutor_id: number;
  subject_id: number;
  session_date: string;  // DATE
  session_time: string;  // TIME (changed from VARCHAR)
  duration_minutes: number;
  session_type: 'online' | 'face-to-face';
  location?: string | null;
  meeting_link?: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'confirmed' | 'completed' | 'cancelled';
  tutee_notes?: string | null;
  tutor_notes?: string | null;
  cancellation_reason?: string | null;
  requested_at: string;
  approved_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Material type definition
export interface Material {
  material_id: number;
  uploader_id: number;
  subject_id?: number | null;
  title: string;
  description?: string | null;
  file_path: string;
  file_name: string;
  file_type?: string | null;
  file_size?: number | null;
  category?: 'notes' | 'handout' | 'exercise' | 'exam' | 'other' | null;
  topic?: string | null;
  tags?: string[] | null;
  is_public: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
}

// Feedback type definition
export interface Feedback {
  feedback_id: number;
  session_id: number;
  tutee_id: number;
  tutor_id: number;
  rating: number;  // 1-5
  comment?: string | null;
  knowledge_rating?: number | null;      // 1-5
  communication_rating?: number | null;  // 1-5
  punctuality_rating?: number | null;    // 1-5
  created_at: string;
}

// Tutor Stats type definition
export interface TutorStats {
  tutor_id: number;
  total_sessions: number;
  completed_sessions: number;
  cancelled_sessions: number;
  average_rating: number;
  total_ratings: number;
  subjects_taught: number;
  last_session_date?: string | null;
  updated_at: string;
}

// Notification type definition
export interface Notification {
  notification_id: number;
  user_id: number;
  type: 'session_request' | 'session_approved' | 'session_rejected' | 
        'session_reminder' | 'session_completed' | 'new_material' |
        'new_feedback' | 'system_announcement';
  title: string;
  message: string;
  related_id?: number | null;
  related_type?: 'session' | 'material' | 'feedback' | 'user' | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
}

// Chat type definition
export interface Chat {
  chat_id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
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
