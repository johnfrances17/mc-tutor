import { Router } from 'express';
import {
  register,
  login,
  getCurrentUser,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  quickPasswordReset,
  updateHeartbeat,
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
router.post('/quick-reset', authLimiter, quickPasswordReset); // Quick password reset

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);
router.post('/logout', authMiddleware, logout);
router.post('/heartbeat', authMiddleware, updateHeartbeat);

export default router;
