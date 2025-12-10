import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/database';
import { AuthRequest } from '../types';
import { sanitizeInput } from '../utils/validation';
import { StorageService } from '../services/StorageService';

const storageService = StorageService.getInstance();

/**
 * Get current user profile
 */
export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.user_id;
    
    console.log('📋 Getting profile for user_id:', userId);

    const { data: user, error } = await supabase
      .from('users')
      .select('user_id, school_id, first_name, middle_name, last_name, email, phone, role, course_code, year_level, profile_picture, status, created_at')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('❌ Database error fetching user:', error);
      return res.status(404).json({ success: false, message: 'User not found', error: error.message });
    }
    
    if (!user) {
      console.error('❌ No user data returned for user_id:', userId);
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    console.log('✅ User found:', user.school_id, user.first_name, user.last_name);

    // Get course name
    let courseName = null;
    if (user.course_code) {
      const { data: course } = await supabase
        .from('courses')
        .select('course_name')
        .eq('course_code', user.course_code)
        .single();
      courseName = course?.course_name || null;
    }

    res.json({ 
      success: true, 
      user: {
        ...user,
        course_name: courseName
      }
    });
  } catch (error) {
    return next(error);
    }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.user_id;
    const { first_name, middle_name, last_name, phone, course_code, year_level } = req.body;

    const updateData: any = {};

    if (first_name) updateData.first_name = sanitizeInput(first_name);
    if (middle_name !== undefined) updateData.middle_name = middle_name ? sanitizeInput(middle_name) : null;
    if (last_name) updateData.last_name = sanitizeInput(last_name);
    if (phone) updateData.phone = sanitizeInput(phone);
    if (course_code) updateData.course_code = sanitizeInput(course_code);
    if (year_level) updateData.year_level = year_level;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to update profile' });
    }

    res.json({ success: true, message: 'Profile updated successfully', user: data });
  } catch (error) {
    return next(error);
    }
};

/**
 * Upload profile picture
 */
export const uploadProfilePicture = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.user_id;
    const studentId = req.user!.school_id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Check file size (max 5MB - frontend crops to 400x400 and compresses)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'File size must be less than 5MB' });
    }

    // Get old profile picture before updating
    const { data: oldUser } = await supabase
      .from('users')
      .select('profile_picture')
      .eq('user_id', userId)
      .single();

    // Upload to Supabase Storage (with local fallback)
    const fileUrl = await storageService.uploadProfilePicture(req.file, studentId);

    // Delete old profile picture if exists
    if (oldUser?.profile_picture && oldUser.profile_picture !== 'default.png') {
      await storageService.deleteProfilePicture(oldUser.profile_picture);
    }

    // Update database with new picture URL
    const { error } = await supabase
      .from('users')
      .update({ profile_picture: fileUrl })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to update profile picture' });
    }

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profile_picture: fileUrl,
    });
  } catch (error) {
    return next(error);
    }
};

/**
 * Get user by student ID
 */
export const getUserByStudentId = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { studentId } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('user_id, school_id, first_name, middle_name, last_name, email, role, course_code, year_level, profile_picture')
      .eq('school_id', studentId)
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
 * Change password
 */
export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.user_id;
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Get current user
    const { data: user } = await supabase
      .from('users')
      .select('password')
      .eq('user_id', userId)
      .single();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // ⚠️ Verify current password in PLAIN TEXT (not secure!)
    const isValid = current_password === user.password;

    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // ⚠️ Store new password in PLAIN TEXT (not secure!)
    const plainPassword = new_password;

    // Update password
    const { error } = await supabase
      .from('users')
      .update({ password: plainPassword })
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to update password' });
    }

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    return next(error);
    }
};
