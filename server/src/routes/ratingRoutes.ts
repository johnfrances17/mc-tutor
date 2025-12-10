import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';
import {
  submitRating,
  getTuteeRatings,
  getTutorRatings,
  checkRatingEligibility
} from '../controllers/ratingController';

const router = Router();

// Submit rating for a tutor (tutee only, one-time per session)
router.post('/', authMiddleware, roleMiddleware(['tutee']), submitRating);

// Get ratings given by tutee (tutee only)
router.get('/my-ratings', authMiddleware, roleMiddleware(['tutee']), getTuteeRatings);

// Get ratings received by tutor (tutor only)
router.get('/tutor-ratings', authMiddleware, roleMiddleware(['tutor']), getTutorRatings);

// Check if a session can be rated
router.get('/check/:session_id', authMiddleware, roleMiddleware(['tutee']), checkRatingEligibility);

export default router;
