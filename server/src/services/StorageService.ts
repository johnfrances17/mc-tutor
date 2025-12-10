import { supabase } from '../config/database';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs/promises';

/**
 * ===================================================================
 * STORAGE CONFIGURATION - EASY TO SWITCH BETWEEN LOCAL AND SUPABASE
 * ===================================================================
 * 
 * LOCALHOST MODE (XAMPP):
 *   - Set USE_LOCAL_STORAGE=true in .env
 *   - Files stored in: c:\xampp\htdocs\mc-tutor\uploads\
 *   - Fast testing, no internet needed
 * 
 * PRODUCTION MODE (Vercel):
 *   - Set USE_LOCAL_STORAGE=false (or remove from .env)
 *   - Files stored in: Supabase Cloud Storage
 *   - Permanent, CDN-backed, accessible from anywhere
 * 
 * EASY REMOVAL:
 *   - To remove Supabase: Set USE_LOCAL_STORAGE=true permanently
 *   - Delete this section and Supabase imports
 * ===================================================================
 */
const USE_LOCAL_STORAGE = process.env.USE_LOCAL_STORAGE === 'true';

export class StorageService {
  private static instance: StorageService;

  private constructor() {
    const mode = USE_LOCAL_STORAGE ? '📁 LOCAL FILESYSTEM (XAMPP)' : '☁️ SUPABASE CLOUD STORAGE';
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📦 STORAGE MODE: ${mode}`);
    console.log(`${'='.repeat(60)}\n`);
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Upload profile picture
   */
  async uploadProfilePicture(file: Express.Multer.File, userId: string): Promise<string> {
    // Force local storage if configured
    if (USE_LOCAL_STORAGE) {
      console.log('📁 [LOCAL] Uploading profile picture to filesystem...');
      return this.uploadProfilePictureLocal(file, userId);
    }

    try {
      console.log('☁️ [SUPABASE] Uploading profile picture to cloud...');
      const fileExt = path.extname(file.originalname);
      const fileName = `${userId}_${Date.now()}${fileExt}`;
      const filePath = `profiles/${fileName}`;

      // Upload to Supabase Storage (avatars bucket)
      const { error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        console.error('❌ Supabase upload error:', error);
        console.log('💡 Tip: Create "avatars" bucket in Supabase Dashboard (Settings > Storage)');
        console.log('🔄 Falling back to local storage...');
        return this.uploadProfilePictureLocal(file, userId);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('✅ Profile picture uploaded to Supabase:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error: any) {
      console.error('❌ Upload profile picture error:', error);
      if (error?.message?.includes('Bucket not found') || error?.message?.includes('bucket')) {
        console.log('⚠️  Supabase bucket "avatars" not found!');
        console.log('💡 To fix: Go to Supabase Dashboard > Storage > Create bucket "avatars" (Public)');
        console.log('📍 Storage endpoint: https://axrzqrzlnceaiuiyixif.storage.supabase.co');
      }
      console.log('🔄 Falling back to local storage...');
      return this.uploadProfilePictureLocal(file, userId);
    }
  }

  /**
   * Fallback: Upload profile picture to local filesystem
   */
  private async uploadProfilePictureLocal(file: Express.Multer.File, userId: string): Promise<string> {
    // Determine base directory based on environment
    let uploadsDir: string;
    
    if (process.env.VERCEL) {
      // On Vercel, use /tmp directory (only writable directory in serverless)
      const tmpDir = process.env.TMPDIR || '/tmp';
      uploadsDir = path.join(tmpDir, 'uploads', 'profiles');
    } else {
      // Local development (XAMPP) - use relative path from project root
      uploadsDir = path.join(process.cwd(), '..', 'uploads', 'profiles');
    }
    
    await fs.mkdir(uploadsDir, { recursive: true });

    const fileExt = path.extname(file.originalname);
    const fileName = `${userId}_${Date.now()}${fileExt}`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.writeFile(filePath, file.buffer);
    
    console.log('✅ Profile picture saved locally:', fileName);
    return `/uploads/profiles/${fileName}`;
  }

  /**
   * Delete profile picture
   */
  async deleteProfilePicture(fileUrl: string): Promise<boolean> {
    // Force local if configured
    if (USE_LOCAL_STORAGE) {
      return this.deleteProfilePictureLocal(fileUrl);
    }

    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `profiles/${fileName}`;

      const { error } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (error) {
        console.error('❌ Delete error:', error);
        return this.deleteProfilePictureLocal(fileUrl);
      }

      console.log('✅ Profile picture deleted from Supabase');
      return true;
    } catch (error) {
      console.error('❌ Delete profile picture error:', error);
      return this.deleteProfilePictureLocal(fileUrl);
    }
  }

  private async deleteProfilePictureLocal(fileUrl: string): Promise<boolean> {
    try {
      const fileName = path.basename(fileUrl);
      const filePath = path.join(process.cwd(), '..', 'uploads', 'profiles', fileName);
      await fs.unlink(filePath);
      console.log('✅ Profile picture deleted locally');
      return true;
    } catch (error) {
      console.error('❌ Local delete error:', error);
      return false;
    }
  }

  /**
   * Upload study material
   */
  async uploadStudyMaterial(
    file: Express.Multer.File,
    tutorId: string,
    subjectId: number
  ): Promise<{ url: string; filename: string }> {
    // Force local storage if configured
    if (USE_LOCAL_STORAGE) {
      console.log('📁 [LOCAL] Uploading study material to filesystem...');
      return this.uploadStudyMaterialLocal(file, tutorId, subjectId);
    }

    try {
      console.log('☁️ [SUPABASE] Uploading study material to cloud...');
      const uniqueId = randomUUID().substring(0, 8);
      const fileName = `${Date.now()}_${uniqueId}_${file.originalname}`;
      const filePath = `${tutorId}/${subjectId}/${fileName}`;

      // Upload to Supabase Storage (materials bucket - PUBLIC)
      const { error } = await supabase.storage
        .from('materials')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        console.error('❌ Supabase upload error:', error);
        console.log('💡 Tip: Create "materials" bucket in Supabase Dashboard (Settings > Storage)');
        console.log('🔄 Falling back to local storage...');
        return this.uploadStudyMaterialLocal(file, tutorId, subjectId);
      }

      // Get public URL (bucket is public, no signed URL needed)
      const { data: urlData } = supabase.storage
        .from('materials')
        .getPublicUrl(filePath);

      console.log('✅ Study material uploaded to Supabase:', urlData.publicUrl);
      
      return {
        url: urlData.publicUrl,
        filename: fileName
      };
    } catch (error: any) {
      console.error('❌ Upload study material error:', error);
      if (error?.message?.includes('Bucket not found') || error?.message?.includes('bucket')) {
        console.log('⚠️  Supabase bucket "materials" not found!');
        console.log('💡 To fix: Go to Supabase Dashboard > Storage > Create bucket "materials" (Public)');
        console.log('📍 Storage endpoint: https://axrzqrzlnceaiuiyixif.storage.supabase.co');
      }
      console.log('🔄 Falling back to local storage...');
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
    // Determine base directory based on environment
    let baseDir: string;
    
    if (process.env.VERCEL) {
      // On Vercel, use /tmp directory (only writable directory in serverless)
      const tmpDir = process.env.TMPDIR || '/tmp';
      baseDir = path.join(tmpDir, 'uploads', 'study_materials', tutorId, subjectId.toString());
    } else {
      // Local development (XAMPP) - use relative path from project root
      baseDir = path.join(process.cwd(), '..', 'uploads', 'study_materials', tutorId, subjectId.toString());
    }
    
    await fs.mkdir(baseDir, { recursive: true });

    const uniqueId = randomUUID().substring(0, 8);
    const fileName = `${Date.now()}_${uniqueId}_${file.originalname}`;
    const filePath = path.join(baseDir, fileName);

    await fs.writeFile(filePath, file.buffer);

    console.log('✅ Study material saved locally:', fileName);
    
    return {
      url: `/uploads/study_materials/${tutorId}/${subjectId}/${fileName}`,
      filename: fileName
    };
  }

  /**
   * Delete study material
   */
  async deleteStudyMaterial(tutorId: string, subjectId: number, filename: string): Promise<boolean> {
    // Force local if configured
    if (USE_LOCAL_STORAGE) {
      console.log('📁 [LOCAL] Deleting from filesystem...');
      return this.deleteStudyMaterialLocal(tutorId, subjectId, filename);
    }

    try {
      console.log('☁️ [SUPABASE] Deleting from cloud...');
      const filePath = `${tutorId}/${subjectId}/${filename}`;

      const { error } = await supabase.storage
        .from('materials')
        .remove([filePath]);

      if (error) {
        console.error('❌ Delete error:', error);
        return this.deleteStudyMaterialLocal(tutorId, subjectId, filename);
      }

      console.log('✅ File deleted from Supabase');
      return true;
    } catch (error) {
      console.error('❌ Delete study material error:', error);
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
      console.log('✅ File deleted locally');
      return true;
    } catch (error) {
      console.error('❌ Local delete error:', error);
      return false;
    }
  }

  /**
   * Get download URL for study material
   */
  async getMaterialDownloadUrl(tutorId: string, subjectId: number, filename: string): Promise<string | null> {
    // Force local if configured
    if (USE_LOCAL_STORAGE) {
      return `/uploads/study_materials/${tutorId}/${subjectId}/${filename}`;
    }

    try {
      const filePath = `${tutorId}/${subjectId}/${filename}`;

      // Get public URL (materials bucket is public)
      const { data } = supabase.storage
        .from('materials')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('❌ Get download URL error:', error);
      return `/uploads/study_materials/${tutorId}/${subjectId}/${filename}`;
    }
  }

  /**
   * List all files in a storage bucket (for admin)
   */
  async listFiles(bucket: 'avatars' | 'materials', folderPath?: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folderPath || '', {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.error('❌ List files error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ List files error:', error);
      return [];
    }
  }

  /**
   * Get storage bucket info (for admin)
   */
  async getBucketInfo(bucket: 'avatars' | 'materials'): Promise<any> {
    try {
      const { data, error } = await supabase.storage.getBucket(bucket);

      if (error) {
        console.error('❌ Get bucket info error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Get bucket info error:', error);
      return null;
    }
  }
}

export default StorageService;
