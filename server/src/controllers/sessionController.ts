import { Response, NextFunction } from 'express';
import { supabase } from '../config/database';
import { AuthRequest } from '../types';
import { validatePagination } from '../utils/validation';
import { SessionPreferencesService } from '../services/SessionPreferencesService';

const sessionPrefsService = new SessionPreferencesService();

/**
 * Get all sessions for current user
 */
export const getSessions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.user_id;
    const role = req.user!.role;
    const { status, page = '1', limit = '20' } = req.query;

    const { offset, limit: validLimit } = validatePagination(
      String(page),
      String(limit)
    );

    let query = supabase
      .from('tutoring_sessions')
      .select(`
        *,
        subject:subjects(subject_code, subject_name),
        tutor:users!tutoring_sessions_tutor_id_fkey(student_id, full_name, profile_picture),
        tutee:users!tutoring_sessions_tutee_id_fkey(student_id, full_name, profile_picture)
      `, { count: 'exact' });

    // Filter by role
    if (role === 'tutor') {
      query = query.eq('tutor_id', userId);
    } else {
      query = query.eq('tutee_id', userId);
    }

    // Filter by status
    if (status && typeof status === 'string') {
      query = query.eq('status', status);
    }

    // Pagination
    query = query.range(offset, offset + validLimit - 1).order('session_date', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to fetch sessions' });
    }

    res.json({
      success: true,
      sessions: data,
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
 * Create a new session booking
 */
export const createSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const tuteeId = req.user!.user_id;
    const {
      tutor_id,
      subject_id,
      session_type,
      session_date,
      start_time,
      end_time,
      location,
      notes,
    } = req.body;

    // Validate required fields
    if (!tutor_id || !subject_id || !session_type || !session_date || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Create session
    const { data, error } = await supabase
      .from('tutoring_sessions')
      .insert({
        tutee_id: tuteeId,
        tutor_id,
        subject_id,
        session_type,
        session_date,
        start_time,
        end_time,
        location,
        notes,
        status: 'pending',
      })
      .select(`
        *,
        subject:subjects(subject_code, subject_name),
        tutor:users!tutoring_sessions_tutor_id_fkey(student_id, full_name, profile_picture),
        tutee:users!tutoring_sessions_tutee_id_fkey(student_id, full_name, profile_picture)
      `)
      .single();

    if (error) {
      console.error('Session creation error:', error);
      return res.status(400).json({ success: false, message: 'Failed to create session' });
    }

    res.status(201).json({
      success: true,
      message: 'Session booked successfully',
      session: data,
    });
  } catch (error) {
    return next(error);
    }
};

/**
 * Confirm a session (tutor only)
 */
export const confirmSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.user_id;
    const { id } = req.params;

    // Check if session exists and user is the tutor
    const { data: session } = await supabase
      .from('tutoring_sessions')
      .select('*')
      .eq('session_id', id)
      .eq('tutor_id', userId)
      .single();

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found or unauthorized' });
    }

    if (session.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Session cannot be confirmed' });
    }

    // Update session
    const { data, error } = await supabase
      .from('tutoring_sessions')
      .update({ status: 'confirmed' })
      .eq('session_id', id)
      .select(`
        *,
        subject:subjects(subject_code, subject_name),
        tutor:users!tutoring_sessions_tutor_id_fkey(student_id, full_name, profile_picture),
        tutee:users!tutoring_sessions_tutee_id_fkey(student_id, full_name, profile_picture)
      `)
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to confirm session' });
    }

    res.json({ success: true, message: 'Session confirmed', session: data });
  } catch (error) {
    return next(error);
    }
};

/**
 * Cancel a session
 */
export const cancelSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.user_id;
    const { id } = req.params;
    const { reason } = req.body;

    // Check if session exists and user is involved
    const { data: session } = await supabase
      .from('tutoring_sessions')
      .select('*')
      .eq('session_id', id)
      .or(`tutor_id.eq.${userId},tutee_id.eq.${userId}`)
      .single();

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found or unauthorized' });
    }

    if (session.status === 'completed' || session.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Session cannot be cancelled' });
    }

    // Update session
    const { data, error } = await supabase
      .from('tutoring_sessions')
      .update({
        status: 'cancelled',
        cancellation_reason: reason || null,
      })
      .eq('session_id', id)
      .select(`
        *,
        subject:subjects(subject_code, subject_name),
        tutor:users!tutoring_sessions_tutor_id_fkey(student_id, full_name, profile_picture),
        tutee:users!tutoring_sessions_tutee_id_fkey(student_id, full_name, profile_picture)
      `)
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to cancel session' });
    }

    res.json({ success: true, message: 'Session cancelled', session: data });
  } catch (error) {
    return next(error);
    }
};

/**
 * Complete a session (tutor only)
 */
export const completeSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.user_id;
    const { id } = req.params;

    // Check if session exists and user is the tutor
    const { data: session } = await supabase
      .from('tutoring_sessions')
      .select('*')
      .eq('session_id', id)
      .eq('tutor_id', userId)
      .single();

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found or unauthorized' });
    }

    if (session.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: 'Only confirmed sessions can be completed' });
    }

    // Update session
    const { data, error } = await supabase
      .from('tutoring_sessions')
      .update({ status: 'completed' })
      .eq('session_id', id)
      .select(`
        *,
        subject:subjects(subject_code, subject_name),
        tutor:users!tutoring_sessions_tutor_id_fkey(student_id, full_name, profile_picture),
        tutee:users!tutoring_sessions_tutee_id_fkey(student_id, full_name, profile_picture)
      `)
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to complete session' });
    }

    res.json({ success: true, message: 'Session marked as completed', session: data });
  } catch (error) {
    return next(error);
    }
};

/**
 * Get session options for a tutor and subject
 */
export const getSessionOptions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { tutorStudentId, subjectCode } = req.params;

    const preferences = sessionPrefsService.getPreferences(tutorStudentId, subjectCode, true);

    if (preferences.length === 0) {
      return res.json({
        success: true,
        preferences: [],
        message: 'No active preferences found',
      });
    }

    res.json({ success: true, preferences });
  } catch (error) {
    return next(error);
    }
};

/**
 * Save session preferences (tutor only)
 */
export const saveSessionPreferences = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const tutorStudentId = req.user!.student_id;
    const {
      subject_code,
      session_type,
      available_days,
      time_slots,
      location,
      notes,
      preference_id,
    } = req.body;

    if (!subject_code || !session_type || !available_days || !time_slots) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const preference = sessionPrefsService.savePreference(
      tutorStudentId,
      subject_code,
      session_type,
      available_days,
      time_slots,
      location,
      notes,
      preference_id
    );

    res.json({
      success: true,
      message: preference_id ? 'Preference updated' : 'Preference created',
      preference,
    });
  } catch (error) {
    return next(error);
    }
};
