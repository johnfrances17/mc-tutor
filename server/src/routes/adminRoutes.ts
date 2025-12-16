import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';
import { apiLimiter } from '../middleware/rateLimiter';
import {
  // User management
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  // Subject management
  createSubject,
  updateSubject,
  deleteSubject,
  // Session management
  getAllSessions,
  updateSessionStatus,
  deleteSession,
  // Material management
  getAllMaterials,
  deleteMaterial,
  // System stats
  getSystemStats,
  getActivityLog,
} from '../controllers/adminController';

const router = Router();

/**
 * ADMIN ROUTES
 * All routes are protected by authMiddleware + roleMiddleware(['admin'])
 * Only users with admin role can access these endpoints
 */

// Apply auth middleware to all admin routes
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));
router.use(apiLimiter);

// =====================================================
// USER MANAGEMENT ROUTES
// =====================================================

/**
 * GET /api/admin/users
 * Get all users with filters and pagination
 * Query params: ?role=tutor&status=active&search=john&page=1&limit=20
 */
router.get('/users', getAllUsers);

/**
 * GET /api/admin/users/:id
 * Get single user details by ID
 */
router.get('/users/:id', getUserById);

/**
 * POST /api/admin/users
 * Create new user (can create any role)
 * Body: { student_id, email, password, full_name, role, phone, year_level, course }
 */
router.post('/users', createUser);

/**
 * PUT /api/admin/users/:id
 * Update user information
 * Body: { full_name?, email?, phone?, role?, course?, year_level?, status?, bio? }
 */
router.put('/users/:id', updateUser);

/**
 * DELETE /api/admin/users/:id
 * Soft delete user (set status to inactive)
 * Query param: ?permanent=true (for permanent delete)
 */
router.delete('/users/:id', deleteUser);

/**
 * POST /api/admin/users/:id/reset-password
 * Reset user password
 * Body: { new_password }
 */
router.post('/users/:id/reset-password', resetUserPassword);

// =====================================================
// SUBJECT MANAGEMENT ROUTES
// =====================================================

/**
 * POST /api/admin/subjects
 * Create new subject
 * Body: { subject_code, subject_name, course, description? }
 */
router.post('/subjects', createSubject);

/**
 * PUT /api/admin/subjects/:id
 * Update subject information
 * Body: { subject_code?, subject_name?, course?, description? }
 */
router.put('/subjects/:id', updateSubject);

/**
 * DELETE /api/admin/subjects/:id
 * Delete subject (only if not used in sessions)
 */
router.delete('/subjects/:id', deleteSubject);

// =====================================================
// SESSION MANAGEMENT ROUTES
// =====================================================

/**
 * GET /api/admin/sessions
 * Get all sessions with filters
 * Query params: ?status=pending&session_type=online&subject_id=1&page=1&limit=100
 */
router.get('/sessions', getAllSessions);

/**
 * PUT /api/admin/sessions/:id
 * Update session status (approve, cancel, complete)
 * Body: { status, cancellation_reason? }
 */
router.put('/sessions/:id', updateSessionStatus);

/**
 * DELETE /api/admin/sessions/:id
 * Delete session permanently
 */
router.delete('/sessions/:id', deleteSession);

// =====================================================
// MATERIAL MANAGEMENT ROUTES
// =====================================================

/**
 * GET /api/admin/materials
 * Get all materials with filters
 * Query params: ?subject_id=1&search=math&page=1&limit=50
 */
router.get('/materials', getAllMaterials);

/**
 * DELETE /api/admin/materials/:id
 * Delete material (admin can remove malicious/inappropriate content)
 */
router.delete('/materials/:id', deleteMaterial);

// =====================================================
// SYSTEM STATISTICS ROUTES
// =====================================================

/**
 * GET /api/admin/stats
 * Get system-wide statistics (dashboard data)
 * Returns: user counts, session counts, subject count, materials count, feedback stats
 */
router.get('/stats', getSystemStats);

/**
 * GET /api/admin/activity
 * Get recent activity log
 * Query params: ?limit=20
 */
router.get('/activity', getActivityLog);

export default router;
