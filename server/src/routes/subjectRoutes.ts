import { Router } from 'express';
import {
  getAllSubjects,
  getSubjectsByCourse,
  getSubjectById,
  getCourses,
  createCustomSubject,
} from '../controllers/subjectController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Get all subjects (with optional course filter)
router.get('/', getAllSubjects);

// Get available courses
router.get('/courses', getCourses);

// Get subjects by course
router.get('/course/:course', getSubjectsByCourse);

// Get subject by ID
router.get('/:id', getSubjectById);

// Create custom subject (tutor-created, requires authentication)
router.post('/custom', authMiddleware, createCustomSubject);

export default router;
