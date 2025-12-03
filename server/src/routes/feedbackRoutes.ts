import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';
import {
  submitFeedback,
  getTutorFeedback,
  getMyFeedback,
  getReceivedFeedback,
} from '../controllers/feedbackController';

const router = Router();

// Submit feedback (tutee only)
router.post('/', authMiddleware, roleMiddleware(['tutee']), submitFeedback);

// Get my submitted feedback (tutee)
router.get('/my', authMiddleware, roleMiddleware(['tutee']), getMyFeedback);

// Get received feedback (tutor)
router.get('/received', authMiddleware, roleMiddleware(['tutor']), getReceivedFeedback);

// Get feedback for a specific tutor (public)
router.get('/tutor/:tutorId', getTutorFeedback);

export default router;
