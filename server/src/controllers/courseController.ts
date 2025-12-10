import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/database';
import { Course } from '../types';

/**
 * Get all courses
 * GET /api/courses
 */
export const getAllCourses = async (_req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('course_code');

    if (error) {
      return res.status(400).json({
        success: false,
        error: { message: 'Failed to fetch courses' }
      });
    }

    res.json({
      success: true,
      data: data as Course[]
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get course by ID
 * GET /api/courses/:id
 */
export const getCourseById = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('course_id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: { message: 'Course not found' }
      });
    }

    res.json({
      success: true,
      data: data as Course
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get course by code
 * GET /api/courses/code/:code
 */
export const getCourseByCode = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { code } = req.params;

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('course_code', code.toUpperCase())
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: { message: 'Course not found' }
      });
    }

    res.json({
      success: true,
      data: data as Course
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Helper function to get course_id from course_code
 */
export const getCourseIdByCode = async (courseCode: string): Promise<number | null> => {
  const { data, error } = await supabase
    .from('courses')
    .select('course_id')
    .eq('course_code', courseCode.toUpperCase())
    .single();

  if (error || !data) {
    return null;
  }

  return data.course_id;
};

/**
 * Helper function to get course_code from course_id
 */
export const getCourseCodeById = async (courseId: number): Promise<string | null> => {
  const { data, error } = await supabase
    .from('courses')
    .select('course_code')
    .eq('course_id', courseId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.course_code;
};
