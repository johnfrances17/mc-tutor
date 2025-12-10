import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';
import {
  searchTutors,
  getTutorById,
  getTutorSubjects,
  getTutorsBySubject,
  addTutorSubject,
  removeTutorSubject,
  updateTutorSubjectMeetLink,
} from '../controllers/tutorController';

const router = Router();

// Search tutors with filters
router.get('/search', searchTutors);

// Get tutors by subject
router.get('/by-subject/:subjectId', getTutorsBySubject);

// Get tutor by ID
router.get('/:id', getTutorById);

// Get subjects taught by tutor
router.get('/:id/subjects', getTutorSubjects);

// Add subject to tutor (tutor only)
router.post('/subjects', authMiddleware, roleMiddleware(['tutor']), addTutorSubject);

// Update Google Meet link for subject (tutor only)
router.patch('/subjects/:subjectId/meet-link', authMiddleware, roleMiddleware(['tutor']), updateTutorSubjectMeetLink);

// Remove subject from tutor (tutor only)
router.delete('/subjects/:subjectId', authMiddleware, roleMiddleware(['tutor']), removeTutorSubject);

export default router;
