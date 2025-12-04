import { Response, NextFunction } from 'express';
import { supabase } from '../config/database';
import { AuthRequest } from '../types';

/**
 * Submit feedback for a session
 */
export const submitFeedback = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tuteeId = req.user!.user_id;
    const { session_id, rating, comment } = req.body;

    if (!session_id || !rating) {
      return res.status(400).json({ success: false, message: 'Session ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }

    // Verify session exists and user is the tutee
    const { data: session } = await supabase
      .from('sessions')
      .select('*, tutor:users!sessions_tutor_id_fkey(school_id, full_name)')
      .eq('session_id', session_id)
      .eq('tutee_id', tuteeId)
      .single();

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found or unauthorized' });
    }

    if (session.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Can only review completed sessions' });
    }

    // Check if feedback already exists
    const { data: existing } = await supabase
      .from('feedback')
      .select('*')
      .eq('session_id', session_id)
      .single();

    if (existing) {
      return res.status(400).json({ success: false, message: 'Feedback already submitted for this session' });
    }

    // Create feedback
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        session_id,
        tutor_id: session.tutor_id,
        tutee_id: tuteeId,
        rating,
        comment: comment || null,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Feedback creation error:', error);
      return res.status(400).json({ success: false, message: 'Failed to submit feedback' });
    }

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      feedback: data,
    });
  } catch (error) {
    return next(error);
    }
};

/**
 * Get feedback for a tutor
 */
export const getTutorFeedback = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { tutorId } = req.params;

    const { data, error } = await supabase
      .from('feedback')
      .select(`
        *,
        tutee:users!feedback_tutee_id_fkey(school_id, full_name, profile_picture),
        session:sessions(session_date, subject:subjects(subject_code, subject_name))
      `)
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: false});

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to fetch feedback' });
    }

    // Calculate average rating
    const avgRating = data.length > 0
      ? data.reduce((sum: number, fb: any) => sum + fb.rating, 0) / data.length
      : 0;

    res.json({
      success: true,
      feedback: data,
      stats: {
        total_reviews: data.length,
        average_rating: Math.round(avgRating * 10) / 10,
      },
    });
  } catch (error) {
    return next(error);
    }
};

/**
 * Get my feedback (as tutee)
 */
export const getMyFeedback = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tuteeId = req.user!.user_id;

    const { data, error } = await supabase
      .from('feedback')
      .select(`
        *,
        tutor:users!feedback_tutor_id_fkey(school_id, full_name, profile_picture),
        session:sessions(session_date, subject:subjects(subject_code, subject_name))
      `)
      .eq('tutee_id', tuteeId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to fetch feedback' });
    }

    res.json({ success: true, feedback: data });
  } catch (error) {
    return next(error);
    }
};

/**
 * Get feedback received by tutor (for tutor)
 */
export const getReceivedFeedback = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tutorId = req.user!.user_id;

    const { data, error } = await supabase
      .from('feedback')
      .select(`
        *,
        tutee:users!feedback_tutee_id_fkey(school_id, full_name, profile_picture),
        session:sessions(session_date, subject:subjects(subject_code, subject_name))
      `)
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to fetch feedback' });
    }

    // Calculate stats
    const avgRating = data.length > 0
      ? data.reduce((sum: number, fb: any) => sum + fb.rating, 0) / data.length
      : 0;

    const ratingDistribution = {
      5: data.filter((f: any) => f.rating === 5).length,
      4: data.filter((f: any) => f.rating === 4).length,
      3: data.filter((f: any) => f.rating === 3).length,
      2: data.filter((f: any) => f.rating === 2).length,
      1: data.filter((f: any) => f.rating === 1).length,
    };

    res.json({
      success: true,
      feedback: data,
      stats: {
        total_reviews: data.length,
        average_rating: Math.round(avgRating * 10) / 10,
        rating_distribution: ratingDistribution,
      },
    });
  } catch (error) {
    return next(error);
    }
};
