import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/database';
import { AuthRequest } from '../types';
import { validatePagination } from '../utils/validation';

/**
 * Search tutors with filters
 */
export const searchTutors = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { subject_id, course, search, page = '1', limit = '20' } = req.query;

    const { offset, limit: validLimit } = validatePagination(
      String(page),
      String(limit)
    );

    // If subject_id is provided, search tutor_subjects
    if (subject_id) {
      const { data, error, count } = await supabase
        .from('tutor_subjects')
        .select(
          `
          tutor_id,
          subject_id,
          user:users!tutor_subjects_tutor_id_fkey(
            user_id,
            school_id,
            first_name,
            middle_name,
            last_name,
            email,
            course_code,
            year_level,
            profile_picture,
            bio
          ),
          subject:subjects(subject_id, subject_code, subject_name, course_code)
        `,
          { count: 'exact' }
        )
        .eq('subject_id', subject_id)
        .range(offset, offset + validLimit - 1);

      if (error) {
        return res.status(400).json({ success: false, message: 'Failed to search tutors' });
      }

      // Transform data
      const tutors = data.map((item: any) => ({
        ...item.user,
        subjects: [item.subject],
      }));

      return res.json({
        success: true,
        tutors,
        pagination: {
          total: count || 0,
          page: Number(page),
          limit: validLimit,
          totalPages: Math.ceil((count || 0) / validLimit),
        },
      });
    }

    // Otherwise, search all tutors
    let query = supabase
      .from('users')
      .select('user_id, school_id, first_name, middle_name, last_name, email, course_code, year_level, profile_picture, bio', {
        count: 'exact',
      })
      .eq('role', 'tutor');

    // Apply filters
    if (course && typeof course === 'string') {
      query = query.eq('course_code', course);
    }

    if (search && typeof search === 'string') {
      query = query.or(`first_name.ilike.%${search}%,middle_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    query = query.range(offset, offset + validLimit - 1).order('first_name');

    const { data, error, count } = await query;

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to search tutors' });
    }

    res.json({
      success: true,
      tutors: data,
      pagination: {
        total: count || 0,
        page: Number(page),
        limit: validLimit,
        totalPages: Math.ceil((count || 0) / validLimit),
      },
    });
  } catch (error) {
    return next(error);
    }
};

/**
 * Get tutor by ID with subjects
 */
export const getTutorById = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;

    // Get tutor info
    const { data: tutor, error: tutorError } = await supabase
      .from('users')
      .select('user_id, school_id, first_name, middle_name, last_name, email, course_code, year_level, profile_picture, bio')
      .eq('user_id', id)
      .eq('role', 'tutor')
      .single();

    if (tutorError || !tutor) {
      return res.status(404).json({ success: false, message: 'Tutor not found' });
    }

    // Get course name
    let courseName = null;
    if (tutor.course_code) {
      const { data: course } = await supabase
        .from('courses')
        .select('course_name')
        .eq('course_code', tutor.course_code)
        .single();
      courseName = course?.course_name || null;
    }

    // Get tutor subjects
    const { data: subjects } = await supabase
      .from('tutor_subjects')
      .select('subject:subjects(subject_id, subject_code, subject_name, course_code)')
      .eq('tutor_id', id);

    res.json({
      success: true,
      tutor: {
        ...tutor,
        course_name: courseName,
        subjects: subjects?.map((s: any) => s.subject) || [],
      },
    });
  } catch (error) {
    return next(error);
    }
};

/**
 * Get subjects taught by a tutor
 */
export const getTutorSubjects = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('tutor_subjects')
      .select('subject:subjects(*)')
      .eq('tutor_id', id);

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to fetch tutor subjects' });
    }

    const subjects = data.map((item: any) => item.subject);

    res.json({ success: true, subjects });
  } catch (error) {
    return next(error);
    }
};

/**
 * Add subject to tutor (tutor only)
 */
export const addTutorSubject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tutorId = req.user!.user_id;
    const { subject_id } = req.body;

    if (!subject_id) {
      return res.status(400).json({ success: false, message: 'Subject ID is required' });
    }

    // Check if subject exists
    const { data: subject } = await supabase
      .from('subjects')
      .select('*')
      .eq('subject_id', subject_id)
      .single();

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // Check if already added
    const { data: existing } = await supabase
      .from('tutor_subjects')
      .select('*')
      .eq('tutor_id', tutorId)
      .eq('subject_id', subject_id)
      .single();

    if (existing) {
      return res.status(400).json({ success: false, message: 'Subject already added' });
    }

    // Add subject
    const { data, error } = await supabase
      .from('tutor_subjects')
      .insert({ tutor_id: tutorId, subject_id })
      .select('*, subject:subjects(*)')
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to add subject' });
    }

    res.status(201).json({
      success: true,
      message: 'Subject added successfully',
      tutor_subject: data,
    });
  } catch (error) {
    return next(error);
    }
};

/**
 * Remove subject from tutor (tutor only)
 */
export const removeTutorSubject = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tutorId = req.user!.user_id;
    const { subjectId } = req.params;

    const { error } = await supabase
      .from('tutor_subjects')
      .delete()
      .eq('tutor_id', tutorId)
      .eq('subject_id', subjectId);

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to remove subject' });
    }

    res.json({ success: true, message: 'Subject removed successfully' });
  } catch (error) {
    return next(error);
    }
};
