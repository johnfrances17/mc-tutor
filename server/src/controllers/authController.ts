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
      studentId,
      email,
      password,
      confirmPassword,
      fullName,
      role,
      phone,
      yearLevel,
      course,
    } = req.body;

    // Validate required fields
    if (!studentId || !email || !password || !fullName || !role || !phone || !yearLevel || !course) {
      return res.status(400).json({
        success: false,
        error: { message: 'All fields are required' },
      });
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
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
      studentId,
      email,
      password,
      fullName,
      role,
      phone,
      yearLevel,
      course,
    });

    // Send welcome email (lazy load and don't await - send in background)
    import('../services/emailService')
      .then(({ emailService }) => emailService.sendWelcomeEmail(email, fullName))
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

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email, password, and role are required' },
      });
    }

    // Validate role
    if (!['tutor', 'tutee', 'admin'].includes(role)) {
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

    const user = await authService.getUserById(req.user.userId);

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
