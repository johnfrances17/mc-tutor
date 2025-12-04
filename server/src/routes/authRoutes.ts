import { Router } from 'express';
import {
  register,
  login,
  getCurrentUser,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
} from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes (with rate limiting for security)
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', authLimiter, refreshToken);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);
router.post('/logout', authMiddleware, logout);

export default router;
