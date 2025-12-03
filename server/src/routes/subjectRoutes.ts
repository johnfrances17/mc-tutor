import { Router } from 'express';
import {
  getAllSubjects,
  getSubjectsByCourse,
  getSubjectById,
  getCourses,
} from '../controllers/subjectController';

const router = Router();

// Get all subjects (with optional course filter)
router.get('/', getAllSubjects);

// Get available courses
router.get('/courses', getCourses);

// Get subjects by course
router.get('/course/:course', getSubjectsByCourse);

// Get subject by ID
router.get('/:id', getSubjectById);

export default router;
