import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Validate environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client for public operations
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

// Create Supabase client with service role for admin operations
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Database types based on Supabase schema
export enum UserRole {
  ADMIN = 'admin',
  TUTOR = 'tutor',
  TUTEE = 'tutee',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum SessionType {
  ONLINE = 'online',
  FACE_TO_FACE = 'face-to-face',
}

export enum SessionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum NotificationType {
  SESSION_REQUEST = 'session_request',
  SESSION_CONFIRMED = 'session_confirmed',
  SESSION_CANCELLED = 'session_cancelled',
  FEEDBACK = 'feedback',
  GENERAL = 'general',
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: number;
          school_id: string;
          email: string;
          password: string;
          full_name: string;
          role: UserRole;
          phone: string | null;
          year_level: string | null;
          course: string | null;
          profile_picture: string | null;
          chat_pin_hash: string | null;
          last_active: string;
          created_at: string;
          updated_at: string;
          status: UserStatus;
        };
      };
      sessions: {
        Row: {
          session_id: number;
          tutor_id: number;
          tutee_id: number;
          subject_id: number;
          session_date: string;
          start_time: string;
          end_time: string;
          location: string | null;
          session_type: SessionType;
          status: SessionStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      subjects: {
        Row: {
          subject_id: number;
          subject_code: string;
          subject_name: string;
          description: string | null;
          course: string | null;
          created_at: string;
        };
      };
    };
  };
}

console.log('✅ Supabase client initialized');
