import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { AuthRequest } from '../types';

const authService = new AuthService();

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const {
      school_id,
      email,
      password,
      confirm_password,
      full_name,
      role,
      phone,
      year_level,
      course,
    } = req.body;

    // Validate required fields
    if (!school_id || !email || !password || !full_name || !role || !phone || !year_level || !course) {
      return res.status(400).json({
        success: false,
        error: { message: 'All fields are required' },
      });
    }

    // Validate password confirmation
    if (password !== confirm_password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Passwords do not match' },
      });
    }

    // Validate role
    if (!['tutor', 'tutee'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid role. Must be tutor or tutee' },
      });
    }

    const result = await authService.register({
      school_id,
      email,
      password,
      full_name,
      role,
      phone,
      year_level,
      course,
    });

    // Send welcome email (lazy load and don't await - send in background)
    import('../services/emailService')
      .then(({ emailService }) => emailService.sendWelcomeEmail(email, full_name))
      .catch(err => console.error('Welcome email failed:', err));

    res.status(201).json({
      success: true,
      data: result,
      message: 'Registration successful',
    });
  } catch (error) {
    return next(error);
    }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { email, password, role } = req.body;

    // Validate required fields (role is now optional)
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email and password are required' },
      });
    }

    // Validate email format (skip for admin role)
    if (role !== 'admin') {
      const emailRegex = /^[^\s@]+@mabinicolleges\.edu\.ph$/i;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Please use your Mabini Colleges email address' },
        });
      }
    }

    // Validate role if provided (for backward compatibility)
    if (role && !['tutor', 'tutee', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid role' },
      });
    }

    const result = await authService.login({ email, password, role });

    res.json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  } catch (error) {
    return next(error);
    }
};

/**
 * Get current user
 * GET /api/auth/me
 */
export const getCurrentUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Not authenticated' },
      });
    }

    const user = await authService.getUserById(req.user.user_id);

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    return next(error);
    }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: { message: 'Refresh token is required' },
      });
    }

    const result = await authService.refreshAccessToken(refreshToken);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
    }
};

/**
 * Logout user (client-side token removal)
 * POST /api/auth/logout
 */
export const logout = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    // In JWT, logout is primarily client-side (remove token)
    // Here we just acknowledge the logout
    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    return next(error);
    }
};

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email is required' },
      });
    }

    const result = await authService.requestPasswordReset(email);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { token, password, confirm_password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Token and password are required' },
      });
    }

    if (password !== confirm_password) {
      return res.status(400).json({
        success: false,
        error: { message: 'Passwords do not match' },
      });
    }

    const result = await authService.resetPassword(token, password);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Quick password reset (for debugging/admin use)
 * POST /api/auth/quick-reset
 */
export const quickPasswordReset = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email and new password are required' },
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: { message: 'Password must be at least 6 characters' },
      });
    }

    // Use the auth service reset method
    const { supabaseAdmin } = require('../config/database');
    
    // Verify user exists
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('user_id, email, full_name')
      .eq('email', email)
      .eq('status', 'active')
      .single();

    if (fetchError || !user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
    }

    // ⚠️ Store password in PLAIN TEXT (not secure!)
    const plainPassword = newPassword;

    // Update password
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        password: plainPassword,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.user_id);

    if (updateError) {
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to reset password' },
      });
    }

    res.json({
      success: true,
      message: 'Password reset successful',
      data: {
        email: user.email,
        full_name: user.full_name
      }
    });
  } catch (error) {
    return next(error);
  }
};

