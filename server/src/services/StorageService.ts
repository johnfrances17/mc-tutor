import { supabase } from '../config/database';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs/promises';

export class StorageService {
  private static instance: StorageService;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Upload profile picture to Supabase Storage
   */
  async uploadProfilePicture(file: Express.Multer.File, userId: string): Promise<string> {
    try {
      const fileExt = path.extname(file.originalname);
      const fileName = `${userId}_${Date.now()}${fileExt}`;
      const filePath = `profiles/${fileName}`;

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        // Fallback to local storage
        return this.uploadProfilePictureLocal(file, userId);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload profile picture error:', error);
      // Fallback to local storage
      return this.uploadProfilePictureLocal(file, userId);
    }
  }

  /**
   * Fallback: Upload profile picture to local filesystem
   */
  private async uploadProfilePictureLocal(file: Express.Multer.File, userId: string): Promise<string> {
    const uploadsDir = path.join(process.cwd(), '..', 'uploads', 'profiles');
    await fs.mkdir(uploadsDir, { recursive: true });

    const fileExt = path.extname(file.originalname);
    const fileName = `${userId}_${Date.now()}${fileExt}`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.writeFile(filePath, file.buffer);
    
    return `/uploads/profiles/${fileName}`;
  }

  /**
   * Delete profile picture from Supabase Storage
   */
  async deleteProfilePicture(fileUrl: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `profiles/${fileName}`;

      const { error } = await supabase.storage
        .from('profile-pictures')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete profile picture error:', error);
      return false;
    }
  }

  /**
   * Upload study material to Supabase Storage
   */
  async uploadStudyMaterial(
    file: Express.Multer.File,
    tutorId: string,
    subjectId: number
  ): Promise<{ url: string; filename: string }> {
    try {
      const uniqueId = randomUUID().substring(0, 8);
      const fileName = `${Date.now()}_${uniqueId}_${file.originalname}`;
      const filePath = `materials/${tutorId}/${subjectId}/${fileName}`;

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('study-materials')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        // Fallback to local storage
        return this.uploadStudyMaterialLocal(file, tutorId, subjectId);
      }

      // Get signed URL (private bucket)
      const { data: urlData, error: urlError } = await supabase.storage
        .from('study-materials')
        .createSignedUrl(filePath, 31536000); // 1 year expiry

      if (urlError) {
        console.error('Signed URL error:', urlError);
        return this.uploadStudyMaterialLocal(file, tutorId, subjectId);
      }

      return {
        url: urlData.signedUrl,
        filename: fileName
      };
    } catch (error) {
      console.error('Upload study material error:', error);
      // Fallback to local storage
      return this.uploadStudyMaterialLocal(file, tutorId, subjectId);
    }
  }

  /**
   * Fallback: Upload study material to local filesystem
   */
  private async uploadStudyMaterialLocal(
    file: Express.Multer.File,
    tutorId: string,
    subjectId: number
  ): Promise<{ url: string; filename: string }> {
    const baseDir = path.join(process.cwd(), '..', 'uploads', 'study_materials', tutorId, subjectId.toString());
    await fs.mkdir(baseDir, { recursive: true });

    const uniqueId = randomUUID().substring(0, 8);
    const fileName = `${Date.now()}_${uniqueId}_${file.originalname}`;
    const filePath = path.join(baseDir, fileName);

    await fs.writeFile(filePath, file.buffer);

    return {
      url: `/uploads/study_materials/${tutorId}/${subjectId}/${fileName}`,
      filename: fileName
    };
  }

  /**
   * Delete study material from Supabase Storage
   */
  async deleteStudyMaterial(tutorId: string, subjectId: number, filename: string): Promise<boolean> {
    try {
      const filePath = `materials/${tutorId}/${subjectId}/${filename}`;

      const { error } = await supabase.storage
        .from('study-materials')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        // Try local delete
        return this.deleteStudyMaterialLocal(tutorId, subjectId, filename);
      }

      return true;
    } catch (error) {
      console.error('Delete study material error:', error);
      return this.deleteStudyMaterialLocal(tutorId, subjectId, filename);
    }
  }

  /**
   * Fallback: Delete study material from local filesystem
   */
  private async deleteStudyMaterialLocal(tutorId: string, subjectId: number, filename: string): Promise<boolean> {
    try {
      const filePath = path.join(process.cwd(), '..', 'uploads', 'study_materials', tutorId, subjectId.toString(), filename);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Local delete error:', error);
      return false;
    }
  }

  /**
   * Get download URL for study material
   */
  async getMaterialDownloadUrl(tutorId: string, subjectId: number, filename: string): Promise<string | null> {
    try {
      const filePath = `materials/${tutorId}/${subjectId}/${filename}`;

      // Try to get signed URL from Supabase
      const { data, error } = await supabase.storage
        .from('study-materials')
        .createSignedUrl(filePath, 3600); // 1 hour expiry

      if (error || !data) {
        console.error('Get signed URL error:', error);
        // Return local path
        return `/uploads/study_materials/${tutorId}/${subjectId}/${filename}`;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Get download URL error:', error);
      return `/uploads/study_materials/${tutorId}/${subjectId}/${filename}`;
    }
  }

  /**
   * List all files in a storage bucket (for admin)
   */
  async listFiles(bucket: 'profile-pictures' | 'study-materials', folderPath?: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folderPath || '', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.error('List files error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('List files error:', error);
      return [];
    }
  }

  /**
   * Get storage bucket info (for admin)
   */
  async getBucketInfo(bucket: 'profile-pictures' | 'study-materials'): Promise<any> {
    try {
      const { data, error } = await supabase.storage.getBucket(bucket);

      if (error) {
        console.error('Get bucket info error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Get bucket info error:', error);
      return null;
    }
  }

  /**
   * Create storage buckets (run once on setup)
   */
  async createBuckets(): Promise<void> {
    try {
      // Create profile-pictures bucket (public)
      const { error: profileError } = await supabase.storage.createBucket('profile-pictures', {
        public: true,
        fileSizeLimit: 2097152, // 2MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });

      if (profileError && !profileError.message.includes('already exists')) {
        console.error('Create profile-pictures bucket error:', profileError);
      } else {
        console.log('✅ Profile pictures bucket created/verified');
      }

      // Create study-materials bucket (private)
      const { error: materialsError } = await supabase.storage.createBucket('study-materials', {
        public: false,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'text/plain',
          'application/zip',
          'application/x-rar-compressed'
        ]
      });

      if (materialsError && !materialsError.message.includes('already exists')) {
        console.error('Create study-materials bucket error:', materialsError);
      } else {
        console.log('✅ Study materials bucket created/verified');
      }
    } catch (error) {
      console.error('Create buckets error:', error);
    }
  }
}

export default StorageService;
