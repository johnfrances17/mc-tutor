import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/database';
import { validatePagination, sanitizeInput, isValidEmail, isValidRole } from '../utils/validation';

/**
 * ADMIN CONTROLLER
 * Handles admin-only operations (CRUD for users, subjects, etc.)
 * All endpoints require admin role (protected by roleMiddleware)
 */

// =====================================================
// USER MANAGEMENT
// =====================================================

/**
 * Get all users with filters and pagination
 * GET /api/admin/users
 */
export const getAllUsers = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { role, status, search, page = '1', limit = '20' } = req.query;

    const { offset, limit: validLimit } = validatePagination(String(page), String(limit));

    let query = supabase
      .from('users')
      .select('user_id, school_id, first_name, middle_name, last_name, email, phone, role, course_code, year_level, status, created_at, last_active', { count: 'exact' });

    // Apply filters
    if (role && typeof role === 'string') {
      query = query.eq('role', role);
    }

    if (status && typeof status === 'string') {
      query = query.eq('status', status);
    }

    if (search && typeof search === 'string') {
      query = query.or(`first_name.ilike.%${search}%,middle_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,school_id.ilike.%${search}%`);
    }

    // Pagination and sorting
    query = query.range(offset, offset + validLimit - 1).order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to fetch users' });
    }

    res.json({
      success: true,
      users: data,
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
 * Get single user by ID
 * GET /api/admin/users/:id
 */
export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('user_id, school_id, first_name, middle_name, last_name, email, phone, role, course, year_level, profile_picture, status, created_at, updated_at, last_active')
      .eq('user_id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    return next(error);
  }
};

/**
 * Create new user (admin can create any role)
 * POST /api/admin/users
 */
export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const {
      school_id,
      email,
      password,
      first_name,
      middle_name,
      last_name,
      role,
      phone,
      year_level,
      course,
      course_code,
      status = 'active',
    } = req.body;

    // Validate required fields
    if (!school_id || !email || !password || !first_name || !last_name || !role) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, email, password, first name, last name, and role are required',
      });
    }

    // Validate email
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // Validate role
    if (!isValidRole(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be admin, tutor, or tutee' });
    }

    // Check if student_id or email already exists
    const { data: existing } = await supabase
      .from('users')
      .select('school_id, email')
      .or(`school_id.eq.${school_id},email.eq.${email}`)
      .single();

    if (existing) {
      if (existing.school_id === school_id) {
        return res.status(409).json({ success: false, message: 'School ID already exists' });
      }
      if (existing.email === email) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
    }

    // ⚠️ Store password in PLAIN TEXT (not secure!)
    const plainPassword = password;

    // Accept both course and course_code
    const courseValue = course_code || course;

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        school_id: sanitizeInput(school_id),
        email: sanitizeInput(email),
        password: plainPassword,
        first_name: sanitizeInput(first_name),
        middle_name: middle_name ? sanitizeInput(middle_name) : null,
        last_name: sanitizeInput(last_name),
        role,
        phone: phone ? sanitizeInput(phone) : null,
        year_level: year_level || null,
        course_code: courseValue ? sanitizeInput(courseValue) : null,
        status,
      })
      .select('user_id, school_id, first_name, middle_name, last_name, email, role, phone, year_level, course_code, status, created_at')
      .single();

    if (error) {
      console.error('User creation error:', error);
      return res.status(400).json({ success: false, message: 'Failed to create user' });
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: newUser,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update user information
 * PUT /api/admin/users/:id
 */
export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      school_id,
      first_name,
      middle_name,
      last_name,
      email,
      phone,
      role,
      course,
      year_level,
      status,
    } = req.body;

    // Build update object (only include provided fields)
    const updateData: any = {};

    if (school_id) updateData.school_id = sanitizeInput(school_id);
    if (first_name) updateData.first_name = sanitizeInput(first_name);
    if (middle_name !== undefined) updateData.middle_name = middle_name ? sanitizeInput(middle_name) : null;
    if (last_name) updateData.last_name = sanitizeInput(last_name);
    if (email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
      }
      updateData.email = sanitizeInput(email);
    }
    if (phone) updateData.phone = sanitizeInput(phone);
    if (role) {
      if (!isValidRole(role)) {
        return res.status(400).json({ success: false, message: 'Invalid role' });
      }
      updateData.role = role;
    }
    if (course) updateData.course_code = sanitizeInput(course);
    if (year_level) updateData.year_level = year_level;
    if (status) updateData.status = status;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('user_id', id)
      .select('user_id, school_id, first_name, middle_name, last_name, email, phone, role, course_code, year_level, status, updated_at')
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'User not found or update failed' });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user: data,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete user (soft delete - set status to inactive)
 * DELETE /api/admin/users/:id
 */
export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;
    const currentUser = (req as any).user;

    // Check if user exists and get their role
    const { data: targetUser, error: getUserError } = await supabase
      .from('users')
      .select('user_id, role, first_name, last_name')
      .eq('user_id', id)
      .single();

    if (getUserError || !targetUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Prevent admin from deleting themselves
    if (currentUser.user_id === parseInt(id)) {
      return res.status(403).json({ 
        success: false, 
        message: 'You cannot delete your own account' 
      });
    }

    // Prevent admin from deleting other admins
    if (targetUser.role === 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'You cannot delete another admin account' 
      });
    }

    if (permanent === 'true') {
      // Permanent delete - must delete related records first to avoid foreign key constraint errors
      console.log(`🗑️ Permanently deleting user ${id} and all related data...`);
      
      // Delete in correct order to respect foreign key constraints
      
      // 1. Delete sessions (as tutee)
      const { error: sessionsAsTuteeError } = await supabase
        .from('sessions')
        .delete()
        .eq('tutee_id', id);
      
      if (sessionsAsTuteeError) {
        console.error('Error deleting sessions as tutee:', sessionsAsTuteeError);
      }
      
      // 2. Delete sessions (as tutor)
      const { error: sessionsAsTutorError } = await supabase
        .from('sessions')
        .delete()
        .eq('tutor_id', id);
      
      if (sessionsAsTutorError) {
        console.error('Error deleting sessions as tutor:', sessionsAsTutorError);
      }
      
      // 3. Delete materials
      const { error: materialsError } = await supabase
        .from('materials')
        .delete()
        .eq('tutor_id', id);
      
      if (materialsError) {
        console.error('Error deleting materials:', materialsError);
      }
      
      // 4. Delete tutor_subjects
      const { error: tutorSubjectsError } = await supabase
        .from('tutor_subjects')
        .delete()
        .eq('tutor_id', id);
      
      if (tutorSubjectsError) {
        console.error('Error deleting tutor subjects:', tutorSubjectsError);
      }
      
      // 5. Delete custom subjects created by this tutor
      const { error: customSubjectsError } = await supabase
        .from('subjects')
        .delete()
        .eq('created_by_tutor_id', id);
      
      if (customSubjectsError) {
        console.error('Error deleting custom subjects:', customSubjectsError);
      }
      
      // 6. Finally, delete the user
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('user_id', id);

      if (userError) {
        console.error('Error deleting user:', userError);
        return res.status(400).json({ 
          success: false, 
          message: 'Failed to delete user: ' + userError.message 
        });
      }

      console.log(`✅ User ${id} and all related data permanently deleted`);
      return res.json({ success: true, message: 'User permanently deleted' });
    } else {
      // Soft delete (set status to inactive)
      const { data, error } = await supabase
        .from('users')
        .update({ status: 'inactive' })
        .eq('user_id', id)
        .select()
        .single();

      if (error || !data) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.json({ success: true, message: 'User deactivated successfully' });
    }
  } catch (error) {
    return next(error);
  }
};

/**
 * Reset user password
 * POST /api/admin/users/:id/reset-password
 */
export const resetUserPassword = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;

    if (!new_password || new_password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    // ⚠️ Store password in PLAIN TEXT (not secure!)
    const plainPassword = new_password;

    const { error } = await supabase
      .from('users')
      .update({ password: plainPassword })
      .eq('user_id', id);

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to reset password' });
    }

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// SUBJECT MANAGEMENT
// =====================================================

/**
 * Create new subject
 * POST /api/admin/subjects
 */
export const createSubject = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { subject_code, subject_name, course_code, description } = req.body;

    if (!subject_code || !subject_name || !course_code) {
      return res.status(400).json({
        success: false,
        message: 'Subject code, name, and course code are required',
      });
    }

    // Validate course_code
    const validCourses = ['BSA', 'BSBA', 'BSED', 'BSN', 'BSCS', 'BSCrim'];
    if (!validCourses.includes(course_code)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course code',
      });
    }

    // Check if subject code already exists
    const { data: existing } = await supabase
      .from('subjects')
      .select('subject_code')
      .eq('subject_code', subject_code)
      .single();

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Subject code already exists',
      });
    }

    const { data, error } = await supabase
      .from('subjects')
      .insert({
        subject_code: sanitizeInput(subject_code),
        subject_name: sanitizeInput(subject_name),
        course_code: sanitizeInput(course_code),
        description: description ? sanitizeInput(description) : null,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to create subject' });
    }

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      subject: data,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update subject
 * PUT /api/admin/subjects/:id
 */
export const updateSubject = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;
    const { subject_code, subject_name, course_code, description } = req.body;

    const updateData: any = {};

    if (subject_code) updateData.subject_code = sanitizeInput(subject_code);
    if (subject_name) updateData.subject_name = sanitizeInput(subject_name);
    if (course_code) updateData.course_code = sanitizeInput(course_code);
    if (description !== undefined) updateData.description = sanitizeInput(description);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('subjects')
      .update(updateData)
      .eq('subject_id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Error updating subject:', error);
      return res.status(404).json({ success: false, message: 'Subject not found or update failed' });
    }

    console.log('✅ Subject updated:', {
      subject_id: id,
      updated_fields: Object.keys(updateData)
    });

    res.json({
      success: true,
      message: 'Subject updated successfully',
      subject: data,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete subject
 * DELETE /api/admin/subjects/:id
 */
export const deleteSubject = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;

    // Check if subject is being used in sessions or tutor_subjects
    const { data: sessions } = await supabase
      .from('sessions')
      .select('session_id')
      .eq('subject_id', id)
      .limit(1);

    if (sessions && sessions.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete subject that has associated sessions',
      });
    }

    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('subject_id', id);

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to delete subject' });
    }

    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// SYSTEM STATISTICS
// =====================================================

/**
 * Get dashboard statistics
 * GET /api/admin/stats
 */
export const getSystemStats = async (_req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    // Get user counts by role
    const { data: users } = await supabase
      .from('users')
      .select('role, status');

    const userStats = {
      total: users?.length || 0,
      active: users?.filter(u => u.status === 'active').length || 0,
      inactive: users?.filter(u => u.status === 'inactive').length || 0,
      admins: users?.filter(u => u.role === 'admin').length || 0,
      tutors: users?.filter(u => u.role === 'tutor').length || 0,
      tutees: users?.filter(u => u.role === 'tutee').length || 0,
    };

    // Get session counts by status
    const { data: sessions } = await supabase
      .from('sessions')
      .select('status');

    const sessionStats = {
      total: sessions?.length || 0,
      pending: sessions?.filter(s => s.status === 'pending').length || 0,
      confirmed: sessions?.filter(s => s.status === 'confirmed').length || 0,
      completed: sessions?.filter(s => s.status === 'completed').length || 0,
      cancelled: sessions?.filter(s => s.status === 'cancelled').length || 0,
    };

    // Get subject count
    const { count: subjectCount } = await supabase
      .from('subjects')
      .select('*', { count: 'exact', head: true });

    // Get materials count
    const { count: materialsCount } = await supabase
      .from('study_materials')
      .select('*', { count: 'exact', head: true });

    // Get feedback stats
    const { data: feedback } = await supabase
      .from('feedback')
      .select('rating');

    const feedbackStats = {
      total: feedback?.length || 0,
      averageRating: feedback && feedback.length > 0
        ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
        : 0,
    };

    res.json({
      success: true,
      stats: {
        users: userStats,
        sessions: sessionStats,
        subjects: subjectCount || 0,
        materials: materialsCount || 0,
        feedback: feedbackStats,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get recent activity log
 * GET /api/admin/activity
 */
export const getActivityLog = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { limit = '20' } = req.query;
    const validLimit = Math.min(100, Math.max(1, parseInt(String(limit)) || 20));

    // Get recent users
    const { data: recentUsers } = await supabase
      .from('users')
      .select('user_id, first_name, middle_name, last_name, role, created_at')
      .order('created_at', { ascending: false })
      .limit(validLimit);

    // Get recent sessions
    const { data: recentSessions } = await supabase
      .from('sessions')
      .select(`
        session_id,
        status,
        created_at,
        tutor:users!sessions_tutor_id_fkey(first_name, middle_name, last_name),
        tutee:users!sessions_tutee_id_fkey(first_name, middle_name, last_name)
      `)
      .order('created_at', { ascending: false })
      .limit(validLimit);

    res.json({
      success: true,
      activity: {
        recentUsers: recentUsers || [],
        recentSessions: recentSessions || [],
      },
    });
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// SESSION MANAGEMENT
// =====================================================

/**
 * Get all sessions (admin view)
 * GET /api/admin/sessions
 */
export const getAllSessions = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { status, session_type, subject_id, page = '1', limit = '100' } = req.query;

    const { offset, limit: validLimit } = validatePagination(String(page), String(limit));

    let query = supabase
      .from('sessions')
      .select(`
        *,
        tutor:users!sessions_tutor_id_fkey(user_id, school_id, first_name, middle_name, last_name, email),
        tutee:users!sessions_tutee_id_fkey(user_id, school_id, first_name, middle_name, last_name, email),
        subject:subjects(subject_id, subject_code, subject_name, course_code)
      `, { count: 'exact' });

    // Apply filters
    if (status && typeof status === 'string') {
      query = query.eq('status', status);
    }

    if (session_type && typeof session_type === 'string') {
      query = query.eq('session_type', session_type);
    }

    if (subject_id && typeof subject_id === 'string') {
      query = query.eq('subject_id', parseInt(subject_id));
    }

    // Pagination and sorting
    query = query.range(offset, offset + validLimit - 1).order('session_date', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching sessions:', error);
      return res.status(400).json({ success: false, message: 'Failed to fetch sessions' });
    }

    // Format the data
    const sessions = (data || []).map(session => ({
      session_id: session.session_id,
      tutee_id: session.tutee_id,
      tutor_id: session.tutor_id,
      subject_id: session.subject_id,
      session_date: session.session_date,
      start_time: session.start_time,
      end_time: session.end_time,
      session_type: session.session_type,
      physical_location: session.physical_location,
      google_meet_link: session.google_meet_link,
      location: session.location,
      notes: session.notes,
      status: session.status,
      cancellation_reason: session.cancellation_reason,
      created_at: session.created_at,
      updated_at: session.updated_at,
      // User data
      tutee_name: session.tutee ? `${session.tutee.first_name} ${session.tutee.last_name}` : 'N/A',
      tutee_first_name: session.tutee?.first_name,
      tutee_last_name: session.tutee?.last_name,
      tutee_email: session.tutee?.email,
      tutee_school_id: session.tutee?.school_id,
      tutor_name: session.tutor ? `${session.tutor.first_name} ${session.tutor.last_name}` : 'N/A',
      tutor_first_name: session.tutor?.first_name,
      tutor_last_name: session.tutor?.last_name,
      tutor_email: session.tutor?.email,
      tutor_school_id: session.tutor?.school_id,
      // Subject data
      subject_code: session.subject?.subject_code,
      subject_name: session.subject?.subject_name,
      course_code: session.subject?.course_code,
    }));

    res.json({
      success: true,
      sessions,
      pagination: {
        total: count || 0,
        page: parseInt(String(page)),
        limit: validLimit,
        totalPages: Math.ceil((count || 0) / validLimit),
      },
    });
  } catch (error) {
    console.error('Get all sessions error:', error);
    return next(error);
  }
};

/**
 * Update session status (admin can approve, cancel, complete any session)
 * PUT /api/admin/sessions/:id
 */
export const updateSessionStatus = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;
    const { status, cancellation_reason } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'cancelled' && cancellation_reason) {
      updateData.cancellation_reason = sanitizeInput(cancellation_reason);
    }

    const { data, error } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('session_id', id)
      .select()
      .single();

    if (error) {
      console.error('Update session error:', error);
      return res.status(400).json({ success: false, message: 'Failed to update session' });
    }

    res.json({
      success: true,
      message: `Session ${status} successfully`,
      session: data,
    });
  } catch (error) {
    console.error('Update session status error:', error);
    return next(error);
  }
};

/**
 * Delete session (admin only)
 * DELETE /api/admin/sessions/:id
 */
export const deleteSession = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('session_id', id);

    if (error) {
      console.error('Delete session error:', error);
      return res.status(400).json({ success: false, message: 'Failed to delete session' });
    }

    res.json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    console.error('Delete session error:', error);
    return next(error);
  }
};

// =====================================================
// MATERIAL MANAGEMENT
// =====================================================

/**
 * Get all materials (admin view)
 * GET /api/admin/materials
 */
export const getAllMaterials = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { subject_id, search, page = '1', limit = '50' } = req.query;

    const { offset, limit: validLimit } = validatePagination(String(page), String(limit));

    let query = supabase
      .from('materials')
      .select(`
        *,
        tutor:users!materials_tutor_id_fkey(user_id, school_id, first_name, middle_name, last_name, email),
        subject:subjects(subject_id, subject_code, subject_name, course_code)
      `, { count: 'exact' });

    // Apply filters
    if (subject_id && typeof subject_id === 'string') {
      query = query.eq('subject_id', parseInt(subject_id));
    }

    if (search && typeof search === 'string') {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Pagination and sorting
    query = query.range(offset, offset + validLimit - 1).order('uploaded_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching materials:', error);
      return res.status(400).json({ success: false, message: 'Failed to fetch materials' });
    }

    // Format the data
    const materials = (data || []).map(material => ({
      id: material.material_id,
      material_id: material.material_id,
      tutor_id: material.tutor_id,
      subject_id: material.subject_id,
      title: material.title,
      description: material.description,
      filename: material.filename,
      file_url: material.file_url,
      file_size: material.file_size,
      file_type: material.file_type,
      category: material.category,
      tags: material.tags,
      download_count: material.download_count,
      uploaded_at: material.uploaded_at,
      updated_at: material.updated_at,
      // User data
      tutor_name: material.tutor ? `${material.tutor.first_name} ${material.tutor.last_name}` : 'N/A',
      tutor_first_name: material.tutor?.first_name,
      tutor_last_name: material.tutor?.last_name,
      tutor_email: material.tutor?.email,
      tutor_student_id: material.tutor?.school_id,
      // Subject data
      subject_code: material.subject?.subject_code,
      subject_name: material.subject?.subject_name,
      course_code: material.subject?.course_code,
    }));

    res.json({
      success: true,
      materials,
      pagination: {
        total: count || 0,
        page: parseInt(String(page)),
        limit: validLimit,
        totalPages: Math.ceil((count || 0) / validLimit),
      },
    });
  } catch (error) {
    console.error('Get all materials error:', error);
    return next(error);
  }
};

/**
 * Delete material (admin can delete any material)
 * DELETE /api/admin/materials/:id
 */
export const deleteMaterial = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { id } = req.params;

    // Get material info first (for file deletion if needed)
    const { data: material, error: getMaterialError } = await supabase
      .from('materials')
      .select('material_id, filename, file_url, title')
      .eq('material_id', id)
      .single();

    if (getMaterialError || !material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    // Delete from database
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('material_id', id);

    if (error) {
      console.error('Delete material error:', error);
      return res.status(400).json({ success: false, message: 'Failed to delete material' });
    }

    // Note: In a production environment, you would also want to delete the actual file from storage
    // For example, if using Supabase Storage:
    // if (material.file_url) {
    //   const filePath = material.file_url.split('/').slice(-2).join('/');
    //   await supabase.storage.from('study_materials').remove([filePath]);
    // }

    console.log(`✅ Material ${id} deleted by admin`);

    res.json({
      success: true,
      message: 'Material deleted successfully',
    });
  } catch (error) {
    console.error('Delete material error:', error);
    return next(error);
  }
};
    }

    res.json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error) {
    console.error('Delete session error:', error);
    return next(error);
  }
};

