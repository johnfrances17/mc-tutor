import path from 'path';
import { supabase } from '../config/database';
import { ensureDirectoryExists, readJsonFile, writeJsonFile } from '../utils/fileSystem';

export interface Material {
  material_id: number;
  title: string;
  description: string;
  file_name: string;
  stored_name: string;
  file_type: string;
  file_size: number;
  file_ext: string;
  subject_code: string;
  subject_name: string;
  uploaded_at: string;
  tutor_student_id?: string;
  tutor_info?: any;
}

interface MaterialMetadata {
  tutor_student_id: string;
  subject_id: number;
  materials: Material[];
  created_at: string;
  last_updated: string;
}

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

/**
 * Materials Manager Service
 * File-based study materials system - port of PHP MaterialsManager
 * Structure: materials/{tutor_student_id}/{subject_id}/file.pdf
 */
export class MaterialsService {
  private materialsDir: string;

  constructor() {
    const baseDir = process.env.UPLOAD_DIR || './data';
    this.materialsDir = path.join(baseDir, 'materials');
    ensureDirectoryExists(this.materialsDir);
  }

  /**
   * Get materials directory path for a tutor and subject
   */
  private getMaterialsPath(tutorStudentId: string, subjectId: number): string {
    const matPath = path.join(this.materialsDir, tutorStudentId, subjectId.toString());
    ensureDirectoryExists(matPath);
    return matPath;
  }

  /**
   * Get metadata file path
   */
  private getMetadataPath(tutorStudentId: string, subjectId: number): string {
    const matPath = this.getMaterialsPath(tutorStudentId, subjectId);
    return path.join(matPath, 'metadata.json');
  }

  /**
   * Load metadata for a tutor-subject combination
   */
  private async loadMetadata(tutorStudentId: string, subjectId: number): Promise<MaterialMetadata> {
    const filePath = this.getMetadataPath(tutorStudentId, subjectId);
    const existing = readJsonFile<MaterialMetadata>(filePath, null as any);

    if (existing) {
      return existing;
    }

    // Create new metadata
    const newMetadata: MaterialMetadata = {
      tutor_student_id: tutorStudentId,
      subject_id: subjectId,
      materials: [],
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
    };

    writeJsonFile(filePath, newMetadata);
    return newMetadata;
  }

  /**
   * Save metadata
   */
  private saveMetadata(metadata: MaterialMetadata): void {
    metadata.last_updated = new Date().toISOString();
    const filePath = this.getMetadataPath(metadata.tutor_student_id, metadata.subject_id);
    writeJsonFile(filePath, metadata);
  }

  /**
   * Get subject info from database
   */
  private async getSubjectInfo(subjectId: number) {
    const { data, error } = await supabase
      .from('subjects')
      .select('subject_id, subject_code, subject_name, course')
      .eq('subject_id', subjectId)
      .single();

    if (error) {
      console.error('Error fetching subject info:', error);
      return null;
    }

    return data;
  }

  /**
   * Get tutor info from database
   */
  private async getTutorInfo(tutorStudentId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('school_id, full_name, email, profile_picture')
      .eq('school_id', tutorStudentId)
      .eq('role', 'tutor')
      .single();

    if (error) {
      console.error('Error fetching tutor info:', error);
      return null;
    }

    return data;
  }

  /**
   * Upload study material
   */
  async uploadMaterial(
    tutorStudentId: string,
    subjectId: number,
    file: UploadedFile,
    title: string,
    description: string = ''
  ): Promise<{ success: boolean; material?: Material; error?: string }> {
    // Validate allowed file types
    const allowedTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'zip', 'rar'];
    const fileExt = path.extname(file.originalname).toLowerCase().replace('.', '');

    if (!allowedTypes.includes(fileExt)) {
      return { success: false, error: 'Invalid file type' };
    }

    // Get subject info
    const subjectInfo = await this.getSubjectInfo(subjectId);
    if (!subjectInfo) {
      return { success: false, error: 'Subject not found' };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const safeFilename = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const newFilename = `${timestamp}_${uniqueId}_${safeFilename}.${fileExt}`;

    // Get upload path
    const uploadPath = this.getMaterialsPath(tutorStudentId, subjectId);
    const destPath = path.join(uploadPath, newFilename);

    // Move file from temp location
    const fs = require('fs');
    try {
      fs.copyFileSync(file.path, destPath);
      fs.unlinkSync(file.path); // Delete temp file
    } catch (error) {
      console.error('Error moving file:', error);
      return { success: false, error: 'Failed to upload file' };
    }

    // Load metadata
    const metadata = await this.loadMetadata(tutorStudentId, subjectId);

    // Add material info
    const materialId =
      metadata.materials.length > 0
        ? Math.max(...metadata.materials.map((m) => m.material_id)) + 1
        : 1;

    const material: Material = {
      material_id: materialId,
      title,
      description,
      file_name: file.originalname,
      stored_name: newFilename,
      file_type: file.mimetype,
      file_size: file.size,
      file_ext: fileExt,
      subject_code: subjectInfo.subject_code,
      subject_name: subjectInfo.subject_name,
      uploaded_at: new Date().toISOString(),
    };

    metadata.materials.push(material);
    this.saveMetadata(metadata);

    return {
      success: true,
      material,
    };
  }

  /**
   * Get all materials for a tutor and subject
   */
  async getMaterials(tutorStudentId: string, subjectId: number): Promise<Material[]> {
    const metadata = await this.loadMetadata(tutorStudentId, subjectId);
    return metadata.materials;
  }

  /**
   * Get all materials by a tutor (across all subjects)
   */
  async getAllMaterialsByTutor(tutorStudentId: string): Promise<Material[]> {
    const tutorDir = path.join(this.materialsDir, tutorStudentId);

    const fs = require('fs');
    if (!fs.existsSync(tutorDir)) {
      return [];
    }

    const allMaterials: Material[] = [];
    const subjectDirs = fs.readdirSync(tutorDir);

    for (const subjectId of subjectDirs) {
      if (subjectId === '.' || subjectId === '..') continue;

      const materials = await this.getMaterials(tutorStudentId, parseInt(subjectId));
      allMaterials.push(...materials);
    }

    // Sort by newest first
    return allMaterials.sort((a, b) => {
      return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
    });
  }

  /**
   * Get all materials for a subject (from all tutors)
   */
  async getMaterialsBySubject(subjectId: number): Promise<Material[]> {
    const fs = require('fs');
    if (!fs.existsSync(this.materialsDir)) {
      return [];
    }

    const allMaterials: Material[] = [];
    const tutorDirs = fs.readdirSync(this.materialsDir);

    for (const tutorStudentId of tutorDirs) {
      if (tutorStudentId === '.' || tutorStudentId === '..') continue;

      const materials = await this.getMaterials(tutorStudentId, subjectId);

      // Add tutor info to each material
      const tutorInfo = await this.getTutorInfo(tutorStudentId);

      materials.forEach((material) => {
        material.tutor_student_id = tutorStudentId;
        material.tutor_info = tutorInfo;
      });

      allMaterials.push(...materials);
    }

    // Sort by newest first
    return allMaterials.sort((a, b) => {
      return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
    });
  }

  /**
   * Delete material
   */
  async deleteMaterial(
    tutorStudentId: string,
    subjectId: number,
    materialId: number
  ): Promise<{ success: boolean; error?: string }> {
    const metadata = await this.loadMetadata(tutorStudentId, subjectId);

    // Find material
    const materialIndex = metadata.materials.findIndex((m) => m.material_id === materialId);

    if (materialIndex === -1) {
      return { success: false, error: 'Material not found' };
    }

    const material = metadata.materials[materialIndex];

    // Delete file
    const filePath = path.join(this.getMaterialsPath(tutorStudentId, subjectId), material.stored_name);
    const fs = require('fs');

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    // Remove from metadata
    metadata.materials.splice(materialIndex, 1);
    this.saveMetadata(metadata);

    return { success: true };
  }

  /**
   * Get material file path for download
   */
  async getMaterialForDownload(
    tutorStudentId: string,
    subjectId: number,
    materialId: number
  ): Promise<{ success: boolean; filePath?: string; fileName?: string; fileType?: string; error?: string }> {
    const metadata = await this.loadMetadata(tutorStudentId, subjectId);

    // Find material
    const material = metadata.materials.find((m) => m.material_id === materialId);

    if (!material) {
      return { success: false, error: 'Material not found' };
    }

    const filePath = path.join(this.getMaterialsPath(tutorStudentId, subjectId), material.stored_name);

    const fs = require('fs');
    if (!fs.existsSync(filePath)) {
      return { success: false, error: 'File not found' };
    }

    return {
      success: true,
      filePath,
      fileName: material.file_name,
      fileType: material.file_type,
    };
  }

  /**
   * Get material by ID
   */
  async getMaterialById(
    tutorStudentId: string,
    subjectId: number,
    materialId: number
  ): Promise<Material | null> {
    const metadata = await this.loadMetadata(tutorStudentId, subjectId);
    return metadata.materials.find((m) => m.material_id === materialId) || null;
  }

  /**
   * Search materials by title or description
   */
  async searchMaterials(query: string, subjectId?: number): Promise<Material[]> {
    const fs = require('fs');
    if (!fs.existsSync(this.materialsDir)) {
      return [];
    }

    const allMaterials: Material[] = [];
    const tutorDirs = fs.readdirSync(this.materialsDir);

    for (const tutorStudentId of tutorDirs) {
      if (tutorStudentId === '.' || tutorStudentId === '..') continue;

      const tutorPath = path.join(this.materialsDir, tutorStudentId);
      const subjectDirs = fs.readdirSync(tutorPath);

      for (const subId of subjectDirs) {
        if (subId === '.' || subId === '..') continue;

        const subIdNum = parseInt(subId);
        if (subjectId && subIdNum !== subjectId) continue;

        const materials = await this.getMaterials(tutorStudentId, subIdNum);

        // Add tutor info
        const tutorInfo = await this.getTutorInfo(tutorStudentId);

        materials.forEach((material) => {
          material.tutor_student_id = tutorStudentId;
          material.tutor_info = tutorInfo;
        });

        allMaterials.push(...materials);
      }
    }

    // Filter by query
    const lowerQuery = query.toLowerCase();
    const filtered = allMaterials.filter(
      (m) =>
        m.title.toLowerCase().includes(lowerQuery) ||
        m.description.toLowerCase().includes(lowerQuery) ||
        m.subject_name.toLowerCase().includes(lowerQuery)
    );

    // Sort by newest first
    return filtered.sort((a, b) => {
      return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
    });
  }
}
