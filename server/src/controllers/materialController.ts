import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { MaterialsService } from '../services/MaterialsService';
import { StorageService } from '../services/StorageService';

const materialsService = new MaterialsService();
const storageService = StorageService.getInstance();

/**
 * Get all materials (with optional filters)
 */
export const getMaterials = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { subject_id, tutor_student_id, search } = req.query;
    const currentUserId = req.user!.user_id;
    const currentUserRole = req.user!.role;

    const { supabase } = await import('../config/database');

    let query = supabase
      .from('materials')
      .select(`
        *,
        subject:subjects(subject_code, subject_name, course_code),
        tutor:users!materials_tutor_id_fkey(school_id, first_name, middle_name, last_name)
      `)
      .order('uploaded_at', { ascending: false });

    // If tutor, show only their materials
    if (currentUserRole === 'tutor') {
      query = query.eq('tutor_id', currentUserId);
    }

    // Apply filters
    if (subject_id) {
      query = query.eq('subject_id', Number(subject_id));
    }

    if (tutor_student_id && typeof tutor_student_id === 'string') {
      // Get tutor by school_id
      const { data: tutorUser } = await supabase
        .from('users')
        .select('user_id')
        .eq('school_id', tutor_student_id)
        .single();
      
      if (tutorUser) {
        query = query.eq('tutor_id', tutorUser.user_id);
      }
    }

    if (search && typeof search === 'string') {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: materials, error } = await query;

    if (error) {
      console.error('Error fetching materials:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch materials' });
    }

    // Format the response
    const formattedMaterials = materials?.map(m => ({
      material_id: m.material_id,
      subject_id: m.subject_id,
      title: m.title,
      description: m.description,
      file_name: m.filename,
      file_url: m.file_url,
      file_size: m.file_size,
      file_type: m.file_type,
      subject_code: m.subject?.subject_code,
      subject_name: m.subject?.subject_name,
      uploaded_at: m.uploaded_at,
      tutor_info: m.tutor
    })) || [];

    res.json({ success: true, materials: formattedMaterials });
  } catch (error) {
    return next(error);
  }
};

/**
 * Upload study material (tutor only)
 */
export const uploadMaterial = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tutorStudentId = req.user!.school_id;
    const { subject_id, title, description } = req.body;

    console.log('📤 Upload request:', { tutorStudentId, subject_id, title, hasFile: !!req.file });

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    if (!subject_id || !title) {
      return res.status(400).json({ success: false, message: 'Subject ID and title are required' });
    }

    // Check file size (max 10MB)
    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'File size must be less than 10MB' });
    }

    console.log('☁️ Uploading to Supabase Storage (materials bucket)...');

    // Upload directly to Supabase Storage (materials bucket)
    const uploadResult = await storageService.uploadStudyMaterial(
      req.file,
      tutorStudentId,
      Number(subject_id)
    );

    console.log('✅ Upload result:', uploadResult);

    // Get subject info from database
    const { supabase } = await import('../config/database');
    console.log('🔍 Looking up subject:', subject_id);
    
    const { data: subjectInfo, error: subjectError } = await supabase
      .from('subjects')
      .select('subject_id, subject_code, subject_name, course_code')
      .eq('subject_id', subject_id)
      .single();

    if (subjectError) {
      console.error('❌ Subject lookup error:', subjectError);
      return res.status(404).json({ 
        success: false, 
        message: `Subject not found (ID: ${subject_id})`,
        error: subjectError.message 
      });
    }

    if (!subjectInfo) {
      console.error('❌ Subject not found in database:', subject_id);
      return res.status(404).json({ 
        success: false, 
        message: `Subject with ID ${subject_id} does not exist` 
      });
    }

    console.log('✅ Subject found:', subjectInfo.subject_code, '-', subjectInfo.subject_name);

    // Store material metadata in database
    const { data: material, error: insertError } = await supabase
      .from('materials')
      .insert({
        tutor_id: req.user!.user_id,
        subject_id: Number(subject_id),
        title,
        description: description || '',
        file_url: uploadResult.url,
        filename: uploadResult.filename,
        file_size: req.file.size,
        file_type: req.file.mimetype,
        category: 'reference',
        uploaded_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('❌ Database insert error:', insertError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save material metadata', 
        error: insertError.message 
      });
    }

    console.log('✅ Material metadata saved to database');

    res.status(201).json({
      success: true,
      message: 'Material uploaded successfully',
      material: {
        ...material,
        subject_code: subjectInfo.subject_code,
        subject_name: subjectInfo.subject_name
      },
      storage_url: uploadResult.url
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    return next(error);
  }
};

/**
 * Delete material (tutor only - own materials)
 */
export const deleteMaterial = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tutorUserId = req.user!.user_id;
    const tutorStudentId = req.user!.school_id;
    const { id } = req.params;

    const { supabase } = await import('../config/database');

    // Get material info first
    const { data: material, error: fetchError } = await supabase
      .from('materials')
      .select('*, subject:subjects(subject_id)')
      .eq('material_id', Number(id))
      .eq('tutor_id', tutorUserId)
      .single();

    if (fetchError || !material) {
      return res.status(404).json({ success: false, message: 'Material not found or unauthorized' });
    }

    // Delete from Supabase Storage
    if (material.filename) {
      const subjectId = material.subject?.subject_id || 0;
      await storageService.deleteStudyMaterial(
        tutorStudentId,
        subjectId,
        material.filename
      );
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('materials')
      .delete()
      .eq('material_id', Number(id))
      .eq('tutor_id', tutorUserId);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return res.status(500).json({ success: false, message: 'Failed to delete material' });
    }

    res.json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    return next(error);
  }
};

/**
 * Download material
 */
export const downloadMaterial = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { tutor_student_id, subject_id } = req.query;

    if (!tutor_student_id || !subject_id) {
      return res.status(400).json({
        success: false,
        message: 'Tutor student ID and subject ID are required',
      });
    }

    // Get material metadata
    const result = await materialsService.getMaterialForDownload(
      tutor_student_id as string,
      Number(subject_id),
      Number(id)
    );

    if (!result.success || !result.fileName) {
      return res.status(404).json({ success: false, message: result.error || 'File not found' });
    }

    // Get signed download URL from Supabase Storage (or local path)
    const downloadUrl = await storageService.getMaterialDownloadUrl(
      tutor_student_id as string,
      Number(subject_id),
      result.fileName
    );

    if (!downloadUrl) {
      return res.status(404).json({ success: false, message: 'File not found in storage' });
    }

    // If it's a signed URL, return it for frontend to handle
    if (downloadUrl.startsWith('http')) {
      return res.json({
        success: true,
        download_url: downloadUrl,
        filename: result.fileName,
        expires_in: 3600 // 1 hour
      });
    }

    // If it's a local path, serve the file directly
    res.download(downloadUrl, result.fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: 'Failed to download file' });
        }
      }
    });
  } catch (error) {
    return next(error);
    }
};
