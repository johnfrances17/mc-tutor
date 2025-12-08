import { Router } from 'express';
import { getAllCourses, getCourseById, getCourseByCode } from '../controllers/courseController';

const router = Router();

/**
 * @route   GET /api/courses
 * @desc    Get all courses
 * @access  Public
 */
router.get('/', getAllCourses);

/**
 * @route   GET /api/courses/:id
 * @desc    Get course by ID
 * @access  Public
 */
router.get('/:id', getCourseById);

/**
 * @route   GET /api/courses/code/:code
 * @desc    Get course by code (e.g., BSA, BSBA)
 * @access  Public
 */
router.get('/code/:code', getCourseByCode);

export default router;
