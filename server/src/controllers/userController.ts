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

    const { data: user, error } = await supabase
      .from('users')
      .select('user_id, school_id, full_name, email, phone, role, course, year_level, profile_picture, bio, created_at')
      .eq('user_id', userId)
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
 * Update user profile
 */
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user!.user_id;
    const { full_name, phone, course, year_level, bio } = req.body;

    const updateData: any = {};

    if (full_name) updateData.full_name = sanitizeInput(full_name);
    if (phone) updateData.phone = sanitizeInput(phone);
    if (course) updateData.course = sanitizeInput(course);
    if (year_level) updateData.year_level = year_level;
    if (bio !== undefined) updateData.bio = sanitizeInput(bio);

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

    // Check file size (max 2MB)
    if (req.file.size > 2 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'File size must be less than 2MB' });
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
      .select('user_id, school_id, full_name, email, role, course, year_level, profile_picture, bio')
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
      .select('password_hash')
      .eq('user_id', userId)
      .single();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // ⚠️ Verify current password in PLAIN TEXT (not secure!)
    const isValid = current_password === user.password_hash;

    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // ⚠️ Store new password in PLAIN TEXT (not secure!)
    const plainPassword = new_password;

    // Update password
    const { error } = await supabase
      .from('users')
      .update({ password_hash: plainPassword })
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ success: false, message: 'Failed to update password' });
    }

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    return next(error);
    }
};
