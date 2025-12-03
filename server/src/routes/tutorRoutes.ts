import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';
import {
  searchTutors,
  getTutorById,
  getTutorSubjects,
  addTutorSubject,
  removeTutorSubject,
} from '../controllers/tutorController';

const router = Router();

// Search tutors with filters
router.get('/search', searchTutors);

// Get tutor by ID
router.get('/:id', getTutorById);

// Get subjects taught by tutor
router.get('/:id/subjects', getTutorSubjects);

// Add subject to tutor (tutor only)
router.post('/subjects', authMiddleware, roleMiddleware(['tutor']), addTutorSubject);

// Remove subject from tutor (tutor only)
router.delete('/subjects/:subjectId', authMiddleware, roleMiddleware(['tutor']), removeTutorSubject);

export default router;
