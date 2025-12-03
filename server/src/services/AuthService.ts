import bcrypt from 'bcryptjs';
import { supabase } from '../config/database';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { createError } from '../middleware/errorHandler';

interface RegisterData {
  student_id: string;
  email: string;
  password: string;
  full_name: string;
  role: 'tutor' | 'tutee';
  phone: string;
  year_level: string;
  course: string;
}

interface LoginData {
  email: string;
  password: string;
  role: 'tutor' | 'tutee';
}

interface AuthResponse {
  user: {
    user_id: number;
    student_id: string;
    email: string;
    full_name: string;
    role: string;
    phone: string | null;
    year_level: string | null;
    course: string | null;
    profile_picture: string | null;
  };
  token: string;
  refreshToken: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw createError('Invalid email format', 400);
    }

    // Validate password strength
    if (data.password.length < 6) {
      throw createError('Password must be at least 6 characters', 400);
    }

    // Check if email or student ID already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('user_id, email, student_id')
      .or(`email.eq.${data.email},student_id.eq.${data.student_id}`)
      .single();

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw createError('Email already exists', 400);
      }
      if (existingUser.student_id === data.student_id) {
        throw createError('Student ID already exists', 400);
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        student_id: data.student_id,
        email: data.email,
        password: hashedPassword,
        full_name: data.full_name,
        role: data.role,
        phone: data.phone,
        year_level: data.year_level,
        course: data.course,
        status: 'active',
      })
      .select()
      .single();

    if (insertError || !newUser) {
      console.error('Insert error:', insertError);
      throw createError('Failed to create user', 500);
    }

    // Generate tokens
    const tokenPayload = {
      user_id: newUser.user_id,
      student_id: newUser.student_id,
      email: newUser.email,
      role: newUser.role,
      full_name: newUser.full_name,
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user: {
        user_id: newUser.user_id,
        student_id: newUser.student_id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        phone: newUser.phone,
        year_level: newUser.year_level,
        course: newUser.course,
        profile_picture: newUser.profile_picture,
      },
      token,
      refreshToken,
    };
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    // Find user by email and role
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', data.email)
      .eq('role', data.role)
      .eq('status', 'active')
      .single();

    if (error || !user) {
      throw createError('Invalid email or password, or wrong role selected', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      throw createError('Invalid email or password', 401);
    }

    // Update last active
    await supabase
      .from('users')
      .update({ last_active: new Date().toISOString() })
      .eq('user_id', user.user_id);

    // Generate tokens
    const tokenPayload = {
      user_id: user.user_id,
      student_id: user.student_id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user: {
        user_id: user.user_id,
        student_id: user.student_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        phone: user.phone,
        year_level: user.year_level,
        course: user.course,
        profile_picture: user.profile_picture,
      },
      token,
      refreshToken,
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: number) {
    const { data: user, error } = await supabase
      .from('users')
      .select('user_id, student_id, email, full_name, role, phone, year_level, course, profile_picture, created_at, updated_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error || !user) {
      throw createError('User not found', 404);
    }

    return user;
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ token: string }> {
    try {
      const { verifyToken } = await import('../utils/jwt');
      const payload = verifyToken(refreshToken);

      // Verify user still exists and is active
      const { data: user, error } = await supabase
        .from('users')
        .select('user_id, status')
        .eq('user_id', payload.user_id)
        .single();

      if (error || !user || user.status !== 'active') {
        throw createError('Invalid refresh token', 401);
      }

      // Generate new access token
      const token = generateToken(payload);

      return { token };
    } catch (error) {
      throw createError('Invalid refresh token', 401);
    }
  }
}
