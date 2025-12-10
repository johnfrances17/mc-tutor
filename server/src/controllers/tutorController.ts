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
            profile_picture
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
      .select('user_id, school_id, first_name, middle_name, last_name, email, phone, course_code, year_level, profile_picture', {
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

    // Enrich tutors with subjects, stats, and course name
    const enrichedTutors = await Promise.all(
      (data || []).map(async (tutor: any) => {
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
        const { data: tutorSubjects } = await supabase
          .from('tutor_subjects')
          .select('subject:subjects(subject_id, subject_code, subject_name, course_code)')
          .eq('tutor_id', tutor.user_id);

        // Get tutor stats
        const { data: stats } = await supabase
          .from('tutor_stats')
          .select('total_sessions, completed_sessions, average_rating, total_hours, subjects_taught, students_helped')
          .eq('tutor_id', tutor.user_id)
          .single();

        return {
          ...tutor,
          course_name: courseName,
          subjects: tutorSubjects?.map((s: any) => s.subject) || [],
          total_sessions: stats?.total_sessions || 0,
          completed_sessions: stats?.completed_sessions || 0,
          average_rating: stats?.average_rating || 0,
          total_hours: stats?.total_hours || 0,
          subjects_taught: stats?.subjects_taught || 0,
          students_helped: stats?.students_helped || 0,
        };
      })
    );

    res.json({
      success: true,
      tutors: enrichedTutors,
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
      .select('user_id, school_id, first_name, middle_name, last_name, email, course_code, year_level, profile_picture')
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
          .select('subject:subjects(*), proficiency_level, preferred_location, physical_location, google_meet_link')
          .eq('tutor_id', id);

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to fetch tutor subjects' });
    }

        const subjects = data.map((item: any) => ({
          ...item.subject,
          proficiency_level: item.proficiency_level,
          preferred_location: item.preferred_location,
          physical_location: item.physical_location,
          google_meet_link: item.google_meet_link
        }));

    res.json({ success: true, subjects });
  } catch (error) {
    return next(error);
    }
};

/**
 * Get tutors by subject
 */
export const getTutorsBySubject = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { subjectId } = req.params;

    const { data, error } = await supabase
      .from('tutor_subjects')
      .select(`
        proficiency_level,
        tutor:users!tutor_subjects_tutor_id_fkey(
          user_id,
          school_id,
          first_name,
          middle_name,
          last_name,
          email,
          phone,
          course_code,
          year_level
        )
      `)
      .eq('subject_id', subjectId)
      .eq('tutor.role', 'tutor');

    if (error) {
      console.error('Error fetching tutors by subject:', error);
      return res.status(400).json({ success: false, error: error.message });
    }

    // Transform the data to flatten the tutor object
    const tutors = data.map((item: any) => ({
      id: item.tutor?.user_id,
      school_id: item.tutor?.school_id,
      first_name: item.tutor?.first_name,
      middle_name: item.tutor?.middle_name,
      last_name: item.tutor?.last_name,
      email: item.tutor?.email,
      phone: item.tutor?.phone,
      course_code: item.tutor?.course_code,
      year_level: item.tutor?.year_level,
      proficiency_level: item.proficiency_level,
    })).filter((tutor: any) => tutor.id); // Filter out null tutors

    res.json({ success: true, data: tutors });
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
    const { subject_id, proficiency_level, preferred_location, physical_location } = req.body;

    if (!subject_id) {
      return res.status(400).json({ success: false, message: 'Subject ID is required' });
    }

    if (!proficiency_level) {
      return res.status(400).json({ success: false, message: 'Proficiency level is required' });
    }

    if (!preferred_location) {
      return res.status(400).json({ success: false, message: 'Preferred location is required' });
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

    // Google Meet link starts as null - tutors will set it manually after creating their room
    // No automatic generation to avoid confusion with meet.google.com/new

    // Prepare insert data
    const insertData: any = {
      tutor_id: tutorId,
      subject_id,
      proficiency_level: proficiency_level || 'intermediate',
      preferred_location: preferred_location || 'online',
      google_meet_link: null, // Explicitly set to null
    };

    if (physical_location) {
      insertData.physical_location = physical_location;
    }

    // Add subject
    const { data, error } = await supabase
      .from('tutor_subjects')
      .insert(insertData)
      .select('*, subject:subjects(*)')
      .single();

    if (error) {
      console.error('Error adding tutor subject:', error);
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

/**
 * Update Google Meet link for tutor subject (tutor only)
 */
export const updateTutorSubjectMeetLink = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const tutorId = req.user!.user_id;
    const { subjectId } = req.params;
    const { google_meet_link } = req.body;

    // Validate Google Meet link format
    if (google_meet_link) {
      const { isValidGoogleMeetLink } = await import('../utils/googleMeet');
      if (!isValidGoogleMeetLink(google_meet_link)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid Google Meet link format. Expected: https://meet.google.com/xxx-yyyy-zzz' 
        });
      }
    }

    // Update the Google Meet link
    const { data, error } = await supabase
      .from('tutor_subjects')
      .update({ 
        google_meet_link,
        updated_at: new Date().toISOString()
      })
      .eq('tutor_id', tutorId)
      .eq('subject_id', subjectId)
      .select('*, subject:subjects(*)')
      .single();

    if (error) {
      console.error('Error updating Google Meet link:', error);
      return res.status(400).json({ success: false, message: 'Failed to update Google Meet link' });
    }

    if (!data) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    res.json({
      success: true,
      message: 'Google Meet link updated successfully',
      tutor_subject: data,
    });
  } catch (error) {
    return next(error);
  }
};
