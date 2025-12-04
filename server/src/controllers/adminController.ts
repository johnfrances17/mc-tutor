import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/database';
import { validatePagination, sanitizeInput, isValidEmail, isValidRole } from '../utils/validation';
import bcrypt from 'bcryptjs';

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
      .select('user_id, school_id, full_name, email, phone, role, course, year_level, status, created_at, last_active', { count: 'exact' });

    // Apply filters
    if (role && typeof role === 'string') {
      query = query.eq('role', role);
    }

    if (status && typeof status === 'string') {
      query = query.eq('status', status);
    }

    if (search && typeof search === 'string') {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,school_id.ilike.%${search}%`);
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
      .select('user_id, school_id, full_name, email, phone, role, course, year_level, profile_picture, bio, status, created_at, updated_at, last_active')
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
      full_name,
      role,
      phone,
      year_level,
      course,
      status = 'active',
    } = req.body;

    // Validate required fields
    if (!school_id || !email || !password || !full_name || !role) {
      return res.status(400).json({
        success: false,
        message: 'Student ID, email, password, full name, and role are required',
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        school_id: sanitizeInput(school_id),
        email: sanitizeInput(email),
        password: hashedPassword,
        full_name: sanitizeInput(full_name),
        role,
        phone: phone ? sanitizeInput(phone) : null,
        year_level: year_level || null,
        course: course ? sanitizeInput(course) : null,
        status,
      })
      .select('user_id, school_id, full_name, email, role, phone, year_level, course, status, created_at')
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
      full_name,
      email,
      phone,
      role,
      course,
      year_level,
      status,
      bio,
    } = req.body;

    // Build update object (only include provided fields)
    const updateData: any = {};

    if (school_id) updateData.school_id = sanitizeInput(school_id);
    if (full_name) updateData.full_name = sanitizeInput(full_name);
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
    if (course) updateData.course = sanitizeInput(course);
    if (year_level) updateData.year_level = year_level;
    if (status) updateData.status = status;
    if (bio !== undefined) updateData.bio = sanitizeInput(bio);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('user_id', id)
      .select('user_id, school_id, full_name, email, phone, role, course, year_level, status, updated_at')
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

    if (permanent === 'true') {
      // Permanent delete (dangerous!)
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('user_id', id);

      if (error) {
        return res.status(400).json({ success: false, message: 'Failed to delete user' });
      }

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

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    const { error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
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
    const { subject_code, subject_name, course, description } = req.body;

    if (!subject_code || !subject_name || !course) {
      return res.status(400).json({
        success: false,
        message: 'Subject code, name, and course are required',
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
        course: sanitizeInput(course),
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
    const { subject_code, subject_name, course, description } = req.body;

    const updateData: any = {};

    if (subject_code) updateData.subject_code = sanitizeInput(subject_code);
    if (subject_name) updateData.subject_name = sanitizeInput(subject_name);
    if (course) updateData.course = sanitizeInput(course);
    if (description !== undefined) updateData.description = sanitizeInput(description);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const { data, error } = await supabase
      .from('subjects')
      .update(updateData)
      .eq('subject_id', id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Subject not found or update failed' });
    }

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
      .select('user_id, full_name, role, created_at')
      .order('created_at', { ascending: false })
      .limit(validLimit);

    // Get recent sessions
    const { data: recentSessions } = await supabase
      .from('sessions')
      .select(`
        session_id,
        status,
        created_at,
        tutor:users!sessions_tutor_id_fkey(full_name),
        tutee:users!sessions_tutee_id_fkey(full_name)
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
