import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { supabase } from '../config/database';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';

const router = Router();

/**
 * Search users by school_id or name
 */
router.get('/users', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ success: false, message: 'Query parameter required' });
    }

    const query = q.trim().toLowerCase();
    
    // Search by school_id or name (first_name + last_name)
    const { data: users, error } = await supabase
      .from('users')
      .select('user_id, school_id, first_name, middle_name, last_name, role, profile_picture')
      .or(`school_id.ilike.%${query}%,first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error('Search users error:', error);
      return res.status(500).json({ success: false, message: 'Search failed' });
    }

    // Transform to include full_name
    const transformedUsers = (users || []).map(user => ({
      ...user,
      full_name: `${user.first_name} ${user.middle_name || ''} ${user.last_name}`.replace(/\s+/g, ' ').trim()
    }));

    return res.json({ success: true, users: transformedUsers });
  } catch (error) {
    return next(error);
  }
});

/**
 * Get ongoing session between current user and another user
 */
router.get('/ongoing-session/:otherUserId', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const currentUserId = req.user!.user_id;
    const { otherUserId } = req.params;

    // Search for ongoing session between these two users
    const { data: session, error } = await supabase
      .from('sessions')
      .select(`
        session_id,
        subject_id,
        status,
        session_date,
        start_time,
        subjects (
          subject_code,
          subject_name
        )
      `)
      .eq('status', 'ongoing')
      .or(`student_id.eq.${currentUserId},tutor_id.eq.${currentUserId}`)
      .or(`student_id.eq.${otherUserId},tutor_id.eq.${otherUserId}`)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Get ongoing session error:', error);
    }

    return res.json({ 
      success: true, 
      session: session || null 
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
