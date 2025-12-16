import { Response, NextFunction } from 'express';
import { supabase } from '../config/database';
import { AuthRequest } from '../types';

/**
 * Submit feedback for a session
 */
export const submitFeedback = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tuteeId = req.user!.user_id;
    const { 
      session_id, 
      tutor_id,
      communication_rating, 
      knowledge_rating, 
      punctuality_rating, 
      teaching_style_rating, 
      overall_rating, 
      comments 
    } = req.body;

    if (!session_id || !overall_rating) {
      return res.status(400).json({ success: false, message: 'Session ID and overall rating are required' });
    }

    // Validate all ratings
    const ratings = [communication_rating, knowledge_rating, punctuality_rating, teaching_style_rating, overall_rating];
    for (const rating of ratings) {
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'All ratings must be between 1 and 5' });
      }
    }

    // Verify session exists and user is the tutee
    const { data: session } = await supabase
      .from('sessions')
      .select('*, tutor:users!sessions_tutor_id_fkey(school_id, first_name, middle_name, last_name)')
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
      .eq('tutee_id', tuteeId)
      .single();

    if (existing) {
      return res.status(400).json({ success: false, message: 'Feedback already submitted for this session' });
    }

    // Create feedback
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        session_id,
        tutor_id: tutor_id || session.tutor_id,
        tutee_id: tuteeId,
        communication_rating,
        knowledge_rating,
        punctuality_rating,
        teaching_style_rating,
        overall_rating,
        comments: comments || null,
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
        tutee:users!feedback_tutee_id_fkey(school_id, first_name, middle_name, last_name, profile_picture),
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
        tutor:users!feedback_tutor_id_fkey(school_id, first_name, middle_name, last_name, profile_picture),
        session:sessions(session_date, subject:subjects(subject_code, subject_name))
      `)
      .eq('tutee_id', tuteeId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to fetch feedback' });
    }

    // Format data for frontend
    const formattedData = data.map((feedback: any) => ({
      ...feedback,
      session_date: feedback.session?.session_date,
      subject_code: feedback.session?.subject?.subject_code,
      subject_name: feedback.session?.subject?.subject_name,
      tutor_first_name: feedback.tutor?.first_name,
      tutor_middle_name: feedback.tutor?.middle_name,
      tutor_last_name: feedback.tutor?.last_name,
      tutor_school_id: feedback.tutor?.school_id,
    }));

    res.json({ success: true, data: formattedData });
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
        tutee:users!feedback_tutee_id_fkey(school_id, first_name, middle_name, last_name, profile_picture),
        session:sessions(session_date, subject:subjects(subject_code, subject_name))
      `)
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to fetch feedback' });
    }

    // Calculate stats using overall_rating
    const avgRating = data.length > 0
      ? data.reduce((sum: number, fb: any) => sum + (fb.overall_rating || 0), 0) / data.length
      : 0;

    const ratingDistribution = {
      5: data.filter((f: any) => f.overall_rating === 5).length,
      4: data.filter((f: any) => f.overall_rating === 4).length,
      3: data.filter((f: any) => f.overall_rating === 3).length,
      2: data.filter((f: any) => f.overall_rating === 2).length,
      1: data.filter((f: any) => f.overall_rating === 1).length,
    };

    // Format data for frontend
    const formattedData = data.map((feedback: any) => ({
      ...feedback,
      session_date: feedback.session?.session_date,
      subject_code: feedback.session?.subject?.subject_code,
      subject_name: feedback.session?.subject?.subject_name,
      tutee_first_name: feedback.tutee?.first_name,
      tutee_middle_name: feedback.tutee?.middle_name,
      tutee_last_name: feedback.tutee?.last_name,
      tutee_school_id: feedback.tutee?.school_id,
    }));

    res.json({
      success: true,
      data: formattedData,
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
