import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/database';

/**
 * Get all subjects
 */
export const getAllSubjects = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { course } = req.query;

    let query = supabase.from('subjects').select('*').order('subject_name');

    if (course && typeof course === 'string') {
      query = query.eq('course', course);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to fetch subjects' });
    }

    res.json({ success: true, subjects: data });
  } catch (error) {
    return next(error);
    }
};

/**
 * Get subjects by course
 */
export const getSubjectsByCourse = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { course } = req.params;

    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('course', course)
      .order('subject_name');

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to fetch subjects' });
    }

    res.json({ success: true, subjects: data });
  } catch (error) {
    return next(error);
    }
};

/**
 * Get subject by ID
 */
export const getSubjectById = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('subject_id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    res.json({ success: true, subject: data });
  } catch (error) {
    return next(error);
    }
};

/**
 * Get available courses (distinct)
 */
export const getCourses = async (_req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('course')
      .order('course');

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to fetch courses' });
    }

    // Get unique courses
    const courses = [...new Set(data.map((item: any) => item.course))];

    res.json({ success: true, courses });
  } catch (error) {
    return next(error);
    }
};
