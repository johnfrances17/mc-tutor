import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/database';

/**
 * Get all subjects
 */
export const getAllSubjects = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { course_code } = req.query;

    // Get subjects with tutor count
    let query = supabase
      .from('subjects')
      .select(`
        *,
        tutor_subjects(count)
      `)
      .order('subject_code');

    if (course_code && typeof course_code === 'string') {
      query = query.eq('course_code', course_code);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching subjects:', error);
      return res.status(400).json({ success: false, message: 'Failed to fetch subjects' });
    }

    // Transform data to include tutor_count
    const subjects = data?.map((subject: any) => ({
      ...subject,
      tutor_count: subject.tutor_subjects?.[0]?.count || 0,
      tutor_subjects: undefined // Remove nested object
    })) || [];

    res.json({ success: true, subjects });
  } catch (error) {
    return next(error);
    }
};

/**
 * Get subjects by course
 */
export const getSubjectsByCourse = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { course_code } = req.params;

    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('course_code', course_code)
      .order('subject_code');

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

/**
 * Create custom subject (tutor-created)
 */
export const createCustomSubject = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { subject_code, subject_name, course_code, description } = req.body;
    const user = (req as any).user;

    // Validate required fields
    if (!subject_code || !subject_name || !course_code) {
      return res.status(400).json({
        success: false,
        message: 'Subject code, name, and course are required'
      });
    }

    // Validate course code
    const validCourses = ['BSA', 'BSBA', 'BSED', 'BSN', 'BSCS', 'BSCrim'];
    if (!validCourses.includes(course_code)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course code'
      });
    }

    // Check if subject code already exists
    const { data: existing } = await supabase
      .from('subjects')
      .select('subject_id, subject_code')
      .eq('subject_code', subject_code.toUpperCase())
      .single();

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Subject code ${subject_code.toUpperCase()} already exists. Please use a different code.`
      });
    }

    // Create the subject
    const { data, error } = await supabase
      .from('subjects')
      .insert({
        subject_code: subject_code.toUpperCase(),
        subject_name: subject_name,
        course_code: course_code,
        description: description || null,
        is_custom: true,
        created_by_tutor_id: user.user_id,
        approval_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating custom subject:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create custom subject'
      });
    }

    console.log('✅ Custom subject created by tutor:', {
      subject_id: data.subject_id,
      subject_code: data.subject_code,
      created_by: user.user_id,
      tutor_name: `${user.first_name} ${user.last_name}`
    });

    res.json({
      success: true,
      message: 'Custom subject created successfully',
      data: data
    });
  } catch (error) {
    console.error('Error in createCustomSubject:', error);
    return next(error);
  }
};
