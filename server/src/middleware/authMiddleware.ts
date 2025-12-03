import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';
import { createError } from './errorHandler';

interface JWTPayload {
  userId: number;
  studentId: string;
  email: string;
  role: string;
  fullName: string;
}

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authMiddleware = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Get token from Authorization header or cookie
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw createError('Authentication required. Please login.', 401);
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw createError('Server configuration error', 500);
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Attach user to request
    req.user = {
      userId: decoded.userId,
      studentId: decoded.studentId,
      email: decoded.email,
      role: decoded.role,
      fullName: decoded.fullName,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(createError('Invalid token. Please login again.', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(createError('Token expired. Please login again.', 401));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware to check if user has required role(s)
 */
export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('Authentication required', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        createError(
          `Access denied. Required role: ${allowedRoles.join(' or ')}`,
          403
        )
      );
    }

    next();
  };
};

/**
 * Optional auth middleware - doesn't fail if no token
 */
export const optionalAuthMiddleware = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      const jwtSecret = process.env.JWT_SECRET;
      if (jwtSecret) {
        const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
        req.user = {
          userId: decoded.userId,
          studentId: decoded.studentId,
          email: decoded.email,
          role: decoded.role,
          fullName: decoded.fullName,
        };
      }
    }

    next();
  } catch (error) {
    // Just continue without user
    next();
  }
};
