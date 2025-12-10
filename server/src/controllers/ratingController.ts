import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/database';

// Submit rating for a tutor (one-time per session)
export const submitRating = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { session_id, rating, review_text } = req.body;
    const tutee_id = (req as any).user.userId;

    // Validate rating value
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5 stars'
      });
    }

    // Check if session exists and belongs to this tutee
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('session_id, tutor_id, tutee_id, status')
      .eq('session_id', session_id)
      .single();

    if (sessionError || !sessionData) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Verify session belongs to this tutee
    if (sessionData.tutee_id !== tutee_id) {
      return res.status(403).json({
        success: false,
        message: 'You can only rate sessions you attended'
      });
    }

    // Verify session is completed
    if (sessionData.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only rate completed sessions'
      });
    }

    // Check if rating already exists for this session
    const { data: existingRating } = await supabase
      .from('tutor_ratings')
      .select('rating_id')
      .eq('session_id', session_id)
      .single();

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this session'
      });
    }

    // Insert rating
    const { data: newRating, error: insertError } = await supabase
      .from('tutor_ratings')
      .insert({
        session_id: session_id,
        tutor_id: sessionData.tutor_id,
        tutee_id: tutee_id,
        rating: rating,
        review_text: review_text || null
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert rating error:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit rating'
      });
    }

    // Update tutor's average rating and total ratings manually
    // Get all ratings for this tutor
    const { data: allRatings } = await supabase
      .from('tutor_ratings')
      .select('rating')
      .eq('tutor_id', sessionData.tutor_id);

    if (allRatings && allRatings.length > 0) {
      const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
      const totalRatings = allRatings.length;

      // Update user record
      await supabase
        .from('users')
        .update({
          average_rating: avgRating.toFixed(2),
          total_ratings: totalRatings
        })
        .eq('user_id', sessionData.tutor_id);
    }

    return res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: newRating
    });

  } catch (error) {
    console.error('Error submitting rating:', error);
    next(error);
  }
};

// Get ratings given by a tutee (student-my-ratings.html)
export const getTuteeRatings = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const tutee_id = (req as any).user.userId;

    const { data, error } = await supabase
      .from('tutor_ratings')
      .select(`
        rating_id,
        session_id,
        rating,
        review_text,
        created_at,
        tutor:users!tutor_ratings_tutor_id_fkey(
          user_id,
          first_name,
          last_name,
          profile_picture
        ),
        session:sessions(
          session_date,
          start_time,
          end_time,
          tutor_subject:tutor_subjects(
            subject:subjects(subject_name)
          )
        )
      `)
      .eq('tutee_id', tutee_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get tutee ratings error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to load ratings'
      });
    }

    // Transform data
    const ratings = (data || []).map((r: any) => ({
      rating_id: r.rating_id,
      session_id: r.session_id,
      rating: r.rating,
      review_text: r.review_text,
      created_at: r.created_at,
      tutor_id: r.tutor?.user_id,
      tutor_name: r.tutor ? `${r.tutor.first_name} ${r.tutor.last_name}` : 'Unknown',
      tutor_picture: r.tutor?.profile_picture,
      session_date: r.session?.session_date,
      start_time: r.session?.start_time,
      end_time: r.session?.end_time,
      subject_name: r.session?.tutor_subject?.subject?.subject_name || 'Subject'
    }));

    return res.status(200).json({
      success: true,
      data: ratings
    });

  } catch (error) {
    console.error('Error fetching tutee ratings:', error);
    next(error);
  }
};

// Get ratings received by a tutor (tutor-my-ratings.html)
export const getTutorRatings = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const tutor_id = (req as any).user.userId;

    // Get tutor stats
    const { data: tutorData } = await supabase
      .from('users')
      .select('average_rating, total_ratings')
      .eq('user_id', tutor_id)
      .single();

    // Get all ratings with details
    const { data: ratingsData, error: ratingsError } = await supabase
      .from('tutor_ratings')
      .select(`
        rating_id,
        session_id,
        rating,
        review_text,
        created_at,
        tutee:users!tutor_ratings_tutee_id_fkey(
          user_id,
          first_name,
          last_name,
          profile_picture
        ),
        session:sessions(
          session_date,
          start_time,
          end_time,
          tutor_subject:tutor_subjects(
            subject:subjects(subject_name)
          )
        )
      `)
      .eq('tutor_id', tutor_id)
      .order('created_at', { ascending: false });

    if (ratingsError) {
      console.error('Get tutor ratings error:', ratingsError);
      return res.status(500).json({
        success: false,
        message: 'Failed to load ratings'
      });
    }

    // Get rating distribution
    const { data: allRatings } = await supabase
      .from('tutor_ratings')
      .select('rating')
      .eq('tutor_id', tutor_id);

    const distribution = [5, 4, 3, 2, 1].map(star => ({
      rating: star,
      count: (allRatings || []).filter(r => r.rating === star).length
    }));

    // Transform ratings data
    const ratings = (ratingsData || []).map((r: any) => ({
      rating_id: r.rating_id,
      session_id: r.session_id,
      rating: r.rating,
      review_text: r.review_text,
      created_at: r.created_at,
      tutee_id: r.tutee?.user_id,
      tutee_name: r.tutee ? `${r.tutee.first_name} ${r.tutee.last_name}` : 'Unknown',
      tutee_picture: r.tutee?.profile_picture,
      session_date: r.session?.session_date,
      start_time: r.session?.start_time,
      end_time: r.session?.end_time,
      subject_name: r.session?.tutor_subject?.subject?.subject_name || 'Subject'
    }));

    return res.status(200).json({
      success: true,
      data: {
        stats: tutorData || { average_rating: 0, total_ratings: 0 },
        ratings: ratings,
        distribution: distribution
      }
    });

  } catch (error) {
    console.error('Error fetching tutor ratings:', error);
    next(error);
  }
};

// Check if a session can be rated
export const checkRatingEligibility = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { session_id } = req.params;
    const tutee_id = (req as any).user.userId;

    // Check session details
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        session_id,
        tutor_id,
        tutee_id,
        status,
        tutor:users!sessions_tutor_id_fkey(
          first_name,
          last_name
        )
      `)
      .eq('session_id', session_id)
      .eq('tutee_id', tutee_id)
      .single();

    if (sessionError || !sessionData) {
      return res.status(404).json({
        success: false,
        canRate: false,
        message: 'Session not found or does not belong to you'
      });
    }

    // Check if already rated
    const { data: ratingData } = await supabase
      .from('tutor_ratings')
      .select('rating_id')
      .eq('session_id', session_id)
      .single();

    const alreadyRated = !!ratingData;
    const isCompleted = sessionData.status === 'completed';
    const tutor = Array.isArray(sessionData.tutor) ? sessionData.tutor[0] : sessionData.tutor;
    const tutorName = tutor 
      ? `${tutor.first_name} ${tutor.last_name}` 
      : 'Unknown';

    return res.status(200).json({
      success: true,
      canRate: isCompleted && !alreadyRated,
      alreadyRated,
      isCompleted,
      tutorName
    });

  } catch (error) {
    console.error('Error checking rating eligibility:', error);
    next(error);
  }
};
