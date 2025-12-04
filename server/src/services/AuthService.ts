import bcrypt from 'bcryptjs';
import { supabase, supabaseAdmin } from '../config/database';
import { generateToken, generateRefreshToken } from '../utils/jwt';
import { createError } from '../middleware/errorHandler';

interface RegisterData {
  school_id: string;
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
  role?: 'tutor' | 'tutee' | 'admin'; // Optional for backward compatibility
}

interface AuthResponse {
  user: {
    user_id: number;
    school_id: string;
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
    // Validate email format - only Mabini Colleges emails allowed for students/tutors
    const emailRegex = /^[^\s@]+@mabinicolleges\.edu\.ph$/i;
    if (!emailRegex.test(data.email)) {
      throw createError('Only @mabinicolleges.edu.ph email addresses are allowed', 400);
    }

    // Validate password strength
    if (data.password.length < 6) {
      throw createError('Password must be at least 6 characters', 400);
    }

    // Check if email already exists (using admin client to bypass RLS)
    const { data: existingEmail } = await supabaseAdmin
      .from('users')
      .select('user_id, email')
      .eq('email', data.email)
      .maybeSingle();

    if (existingEmail) {
      throw createError('Email already exists', 400);
    }

    // Check if school ID already exists (using admin client to bypass RLS)
    const { data: existingSchoolId } = await supabaseAdmin
      .from('users')
      .select('user_id, school_id')
      .eq('school_id', data.school_id)
      .maybeSingle();

    if (existingSchoolId) {
      throw createError('School ID already exists', 400);
    }

    // Hash password - use consistent bcrypt configuration
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    
    console.log('🔐 Registration password hash:', {
      originalLength: data.password.length,
      hashLength: hashedPassword.length,
      hashPrefix: hashedPassword.substring(0, 7),
      saltRounds: saltRounds
    });

    // Insert new user (using admin client to bypass RLS)
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        school_id: data.school_id,
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
      console.error('Insert error details:', {
        error: insertError,
        message: insertError?.message,
        details: insertError?.details,
        hint: insertError?.hint,
        code: insertError?.code
      });
      
      // Provide more specific error messages
      if (insertError?.code === '23505') {
        throw createError('Email or School ID already exists', 400);
      }
      if (insertError?.code === '42501') {
        throw createError('Database permission error. Please contact support.', 500);
      }
      
      throw createError(insertError?.message || 'Failed to create user', 500);
    }

    // Generate tokens
    const tokenPayload = {
      user_id: newUser.user_id,
      school_id: newUser.school_id,
      email: newUser.email,
      role: newUser.role,
      full_name: newUser.full_name,
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user: {
        user_id: newUser.user_id,
        school_id: newUser.school_id,
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
    console.log('🔐 Login attempt:', {
      email: data.email,
      role: data.role,
      passwordLength: data.password?.length,
      timestamp: new Date().toISOString()
    });

    // Validate email format (skip for admin role)
    if (data.role !== 'admin') {
      const emailRegex = /^[^\s@]+@mabinicolleges\.edu\.ph$/i;
      if (!emailRegex.test(data.email)) {
        console.log('❌ Email validation failed:', data.email);
        throw createError('Please use your Mabini Colleges email address', 400);
      }
    }

    // Build query - if role is provided, filter by it (backward compatibility)
    let query = supabase
      .from('users')
      .select('*')
      .eq('email', data.email)
      .eq('status', 'active');
    
    // Only filter by role if it's provided (for backward compatibility)
    if (data.role) {
      query = query.eq('role', data.role);
    }
    
    const { data: user, error } = await query.single();

    if (error || !user) {
      console.log('❌ User not found:', {
        email: data.email,
        error: error?.message,
        code: error?.code
      });
      throw createError('Invalid email or password', 401);
    }

    console.log('✅ User found:', {
      user_id: user.user_id,
      email: user.email,
      school_id: user.school_id,
      role: user.role,
      hashPrefix: user.password?.substring(0, 7),
      hashLength: user.password?.length
    });

    // Verify password
    console.log('🔍 Comparing password...', {
      providedPasswordLength: data.password.length,
      storedHashLength: user.password.length,
      storedHashPrefix: user.password.substring(0, 7)
    });
    
    // Ensure password is a string and not undefined
    if (!data.password || typeof data.password !== 'string') {
      console.log('❌ Invalid password type:', typeof data.password);
      throw createError('Invalid password', 401);
    }
    
    if (!user.password || typeof user.password !== 'string') {
      console.log('❌ Invalid stored hash type:', typeof user.password);
      throw createError('Invalid stored password hash', 500);
    }
    
    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(data.password, user.password);
    } catch (bcryptError) {
      console.error('❌ Bcrypt comparison error:', bcryptError);
      throw createError('Password verification failed', 500);
    }
    
    console.log('🔐 Password comparison result:', {
      isValid: isValidPassword,
      email: data.email
    });
    
    if (!isValidPassword) {
      console.log('❌ Password validation failed for:', data.email);
      throw createError('Invalid email or password', 401);
    }

    console.log('✅ Login successful for:', data.email);

    // Update last active
    await supabase
      .from('users')
      .update({ last_active: new Date().toISOString() })
      .eq('user_id', user.user_id);

    // Generate tokens
    const tokenPayload = {
      user_id: user.user_id,
      school_id: user.school_id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    };

    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user: {
        user_id: user.user_id,
        school_id: user.school_id,
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
      .select('user_id, school_id, email, full_name, role, phone, year_level, course, profile_picture, created_at, updated_at')
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

  /**
   * Request password reset - sends email with reset link
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('user_id, school_id, email, full_name, status')
      .eq('email', email)
      .eq('status', 'active')
      .single();

    // Always return success to prevent email enumeration
    if (error || !user) {
      return { message: 'If your email is registered, you will receive a password reset link' };
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = generateToken(
      { user_id: user.user_id, email: user.email, type: 'password_reset' },
      '1h'
    );

    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL || 'https://mc-tutor.vercel.app'}/html/reset-password.html?token=${resetToken}`;

    // Send reset email
    try {
      const { emailService } = await import('./emailService');
      await emailService.sendPasswordReset(user.email, resetLink, user.full_name);
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      // Don't throw - still return success
    }

    return { message: 'If your email is registered, you will receive a password reset link' };
  }

  /**
   * Reset password using reset token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    // Validate password
    if (newPassword.length < 6) {
      throw createError('Password must be at least 6 characters', 400);
    }

    // Verify reset token
    try {
      const { verifyToken } = await import('../utils/jwt');
      const payload = verifyToken(token);

      if (payload.type !== 'password_reset') {
        throw createError('Invalid reset token', 401);
      }

      // Verify user still exists and is active
      const { data: user, error } = await supabase
        .from('users')
        .select('user_id, email, status')
        .eq('user_id', payload.user_id)
        .eq('email', payload.email)
        .eq('status', 'active')
        .single();

      if (error || !user) {
        throw createError('Invalid or expired reset token', 401);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password: hashedPassword,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.user_id);

      if (updateError) {
        throw createError('Failed to reset password', 500);
      }

      return { message: 'Password reset successful. You can now login with your new password.' };
    } catch (error) {
      if (error instanceof Error && error.message.includes('jwt')) {
        throw createError('Invalid or expired reset token', 401);
      }
      throw error;
    }
  }
}
