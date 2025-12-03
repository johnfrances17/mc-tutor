import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';
import {
  getSessions,
  createSession,
  confirmSession,
  cancelSession,
  completeSession,
  getSessionOptions,
  saveSessionPreferences,
} from '../controllers/sessionController';

const router = Router();

// Get all sessions for current user
router.get('/', authMiddleware, getSessions);

// Create new session (student only)
router.post('/', authMiddleware, roleMiddleware(['tutee']), createSession);

// Get session options for booking
router.get('/options/:tutorStudentId/:subjectCode', authMiddleware, getSessionOptions);

// Confirm session (tutor only)
router.put('/:id/confirm', authMiddleware, roleMiddleware(['tutor']), confirmSession);

// Cancel session
router.put('/:id/cancel', authMiddleware, cancelSession);

// Complete session (tutor only)
router.put('/:id/complete', authMiddleware, roleMiddleware(['tutor']), completeSession);

// Save session preferences (tutor only)
router.post('/preferences', authMiddleware, roleMiddleware(['tutor']), saveSessionPreferences);

export default router;
