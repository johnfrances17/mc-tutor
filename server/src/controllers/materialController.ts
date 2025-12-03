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

    let materials;

    if (search && typeof search === 'string') {
      // Search materials
      materials = await materialsService.searchMaterials(
        search,
        subject_id ? Number(subject_id) : undefined
      );
    } else if (subject_id) {
      // Get by subject
      materials = await materialsService.getMaterialsBySubject(Number(subject_id));
    } else if (tutor_student_id && typeof tutor_student_id === 'string') {
      // Get by tutor
      materials = await materialsService.getAllMaterialsByTutor(tutor_student_id);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject_id, tutor_student_id, or search query',
      });
    }

    res.json({ success: true, materials });
  } catch (error) {
    return next(error);
    }
};

/**
 * Upload study material (tutor only)
 */
export const uploadMaterial = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tutorStudentId = req.user!.studentId;
    const { subject_id, title, description } = req.body;

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

    // Upload to Supabase Storage (with local fallback)
    const uploadResult = await storageService.uploadStudyMaterial(
      req.file,
      tutorStudentId,
      Number(subject_id)
    );

    // Save metadata using file-based system
    const result = await materialsService.uploadMaterial(
      tutorStudentId,
      Number(subject_id),
      req.file as any,
      title,
      description || ''
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Update the file_name to use Supabase URL
    if (result.material) {
      result.material.file_name = uploadResult.filename;
    }

    res.status(201).json({
      success: true,
      message: 'Material uploaded successfully',
      material: result.material,
      storage_url: uploadResult.url
    });
  } catch (error) {
    return next(error);
    }
};

/**
 * Delete material (tutor only - own materials)
 */
export const deleteMaterial = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tutorStudentId = req.user!.studentId;
    const { id } = req.params;
    const { subject_id } = req.query;

    if (!subject_id) {
      return res.status(400).json({ success: false, message: 'Subject ID is required' });
    }

    // Get material info first
    const material = await materialsService.getMaterialById(
      tutorStudentId,
      Number(subject_id),
      Number(id)
    );

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    // Delete from Supabase Storage (or local)
    if (material.file_name) {
      await storageService.deleteStudyMaterial(
        tutorStudentId,
        Number(subject_id),
        material.file_name
      );
    }

    // Delete metadata from file-based system
    const result = await materialsService.deleteMaterial(
      tutorStudentId,
      Number(subject_id),
      Number(id)
    );

    if (!result.success) {
      return res.status(404).json(result);
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
