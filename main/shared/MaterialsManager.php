<?php
/**
 * Materials Manager - File-Based Study Materials System
 * Manages tutor study materials stored in organized folders
 * Structure: materials/{tutor_student_id}/{subject_id}/file.pdf
 */

class MaterialsManager {
    private $materials_dir;
    private $conn;
    
    public function __construct($db_connection) {
        $this->materials_dir = __DIR__ . '/materials/';
        $this->conn = $db_connection;
        
        // Ensure directory exists
        if (!is_dir($this->materials_dir)) {
            mkdir($this->materials_dir, 0755, true);
        }
    }
    
    /**
     * Get materials directory for a tutor and subject
     * Structure: materials/{tutor_student_id}/{subject_id}/
     */
    private function getMaterialsPath($tutor_student_id, $subject_id) {
        $path = $this->materials_dir . $tutor_student_id . '/' . $subject_id . '/';
        
        // Create nested folders if don't exist
        if (!is_dir($path)) {
            mkdir($path, 0755, true);
        }
        
        return $path;
    }
    
    /**
     * Get metadata file path for a tutor-subject combination
     */
    private function getMetadataPath($tutor_student_id, $subject_id) {
        $path = $this->getMaterialsPath($tutor_student_id, $subject_id);
        return $path . 'metadata.json';
    }
    
    /**
     * Load metadata for materials
     */
    private function loadMetadata($tutor_student_id, $subject_id) {
        $file_path = $this->getMetadataPath($tutor_student_id, $subject_id);
        
        if (file_exists($file_path)) {
            $content = file_get_contents($file_path);
            return json_decode($content, true);
        }
        
        // Create new metadata
        $data = [
            'tutor_student_id' => $tutor_student_id,
            'subject_id' => $subject_id,
            'materials' => [],
            'created_at' => date('Y-m-d H:i:s'),
            'last_updated' => date('Y-m-d H:i:s')
        ];
        
        file_put_contents($file_path, json_encode($data, JSON_PRETTY_PRINT));
        return $data;
    }
    
    /**
     * Save metadata
     */
    private function saveMetadata($tutor_student_id, $subject_id, $data) {
        $file_path = $this->getMetadataPath($tutor_student_id, $subject_id);
        $data['last_updated'] = date('Y-m-d H:i:s');
        return file_put_contents($file_path, json_encode($data, JSON_PRETTY_PRINT));
    }
    
    /**
     * Upload study material
     */
    public function uploadMaterial($tutor_student_id, $subject_id, $file, $title, $description = '') {
        // Get subject info
        $subject_info = $this->getSubjectInfo($subject_id);
        if (!$subject_info) {
            return ['success' => false, 'error' => 'Subject not found'];
        }
        
        // Validate file
        $allowed_types = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt', 'zip', 'rar'];
        $file_ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        if (!in_array($file_ext, $allowed_types)) {
            return ['success' => false, 'error' => 'Invalid file type'];
        }
        
        // Generate unique filename
        $timestamp = time();
        $unique_id = uniqid();
        $safe_filename = preg_replace('/[^a-zA-Z0-9_-]/', '_', pathinfo($file['name'], PATHINFO_FILENAME));
        $new_filename = $timestamp . '_' . $unique_id . '_' . $safe_filename . '.' . $file_ext;
        
        // Get upload path
        $upload_path = $this->getMaterialsPath($tutor_student_id, $subject_id);
        $file_path = $upload_path . $new_filename;
        
        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $file_path)) {
            return ['success' => false, 'error' => 'Failed to upload file'];
        }
        
        // Load metadata
        $metadata = $this->loadMetadata($tutor_student_id, $subject_id);
        
        // Add material info
        $material_id = count($metadata['materials']) + 1;
        $material = [
            'material_id' => $material_id,
            'title' => $title,
            'description' => $description,
            'file_name' => $file['name'],
            'stored_name' => $new_filename,
            'file_type' => $file['type'],
            'file_size' => $file['size'],
            'file_ext' => $file_ext,
            'subject_code' => $subject_info['subject_code'],
            'subject_name' => $subject_info['subject_name'],
            'uploaded_at' => date('Y-m-d H:i:s')
        ];
        
        $metadata['materials'][] = $material;
        $this->saveMetadata($tutor_student_id, $subject_id, $metadata);
        
        return [
            'success' => true,
            'material_id' => $material_id,
            'file_path' => $file_path,
            'material' => $material
        ];
    }
    
    /**
     * Get all materials for a tutor and subject
     */
    public function getMaterials($tutor_student_id, $subject_id) {
        $metadata = $this->loadMetadata($tutor_student_id, $subject_id);
        return $metadata['materials'];
    }
    
    /**
     * Get all materials by a tutor (across all subjects)
     */
    public function getAllMaterialsByTutor($tutor_student_id) {
        $tutor_dir = $this->materials_dir . $tutor_student_id . '/';
        
        if (!is_dir($tutor_dir)) {
            return [];
        }
        
        $all_materials = [];
        $subject_dirs = scandir($tutor_dir);
        
        foreach ($subject_dirs as $subject_id) {
            if ($subject_id == '.' || $subject_id == '..') continue;
            
            $materials = $this->getMaterials($tutor_student_id, $subject_id);
            $all_materials = array_merge($all_materials, $materials);
        }
        
        return $all_materials;
    }
    
    /**
     * Get all materials for a subject (from all tutors)
     */
    public function getMaterialsBySubject($subject_id) {
        $all_materials = [];
        $tutor_dirs = scandir($this->materials_dir);
        
        foreach ($tutor_dirs as $tutor_student_id) {
            if ($tutor_student_id == '.' || $tutor_student_id == '..') continue;
            
            $materials = $this->getMaterials($tutor_student_id, $subject_id);
            
            // Add tutor info to each material
            foreach ($materials as &$material) {
                $material['tutor_student_id'] = $tutor_student_id;
                $material['tutor_info'] = $this->getTutorInfo($tutor_student_id);
            }
            
            $all_materials = array_merge($all_materials, $materials);
        }
        
        return $all_materials;
    }
    
    /**
     * Delete material
     */
    public function deleteMaterial($tutor_student_id, $subject_id, $material_id) {
        $metadata = $this->loadMetadata($tutor_student_id, $subject_id);
        
        // Find material
        $material = null;
        foreach ($metadata['materials'] as $key => $mat) {
            if ($mat['material_id'] == $material_id) {
                $material = $mat;
                unset($metadata['materials'][$key]);
                break;
            }
        }
        
        if (!$material) {
            return ['success' => false, 'error' => 'Material not found'];
        }
        
        // Delete file
        $file_path = $this->getMaterialsPath($tutor_student_id, $subject_id) . $material['stored_name'];
        if (file_exists($file_path)) {
            unlink($file_path);
        }
        
        // Re-index array
        $metadata['materials'] = array_values($metadata['materials']);
        
        $this->saveMetadata($tutor_student_id, $subject_id, $metadata);
        
        return ['success' => true];
    }
    
    /**
     * Download material
     */
    public function downloadMaterial($tutor_student_id, $subject_id, $material_id) {
        $metadata = $this->loadMetadata($tutor_student_id, $subject_id);
        
        // Find material
        foreach ($metadata['materials'] as $material) {
            if ($material['material_id'] == $material_id) {
                $file_path = $this->getMaterialsPath($tutor_student_id, $subject_id) . $material['stored_name'];
                
                if (file_exists($file_path)) {
                    return [
                        'success' => true,
                        'file_path' => $file_path,
                        'file_name' => $material['file_name'],
                        'file_type' => $material['file_type']
                    ];
                }
                
                return ['success' => false, 'error' => 'File not found'];
            }
        }
        
        return ['success' => false, 'error' => 'Material not found'];
    }
    
    /**
     * Get subject info
     */
    private function getSubjectInfo($subject_id) {
        $sql = "SELECT subject_id, subject_code, subject_name, course FROM subjects WHERE subject_id = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $subject_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        return $result->fetch_assoc();
    }
    
    /**
     * Get tutor info
     */
    private function getTutorInfo($tutor_student_id) {
        $sql = "SELECT student_id, full_name, email FROM users WHERE student_id = ? AND role = 'tutor'";
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("s", $tutor_student_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        return $result->fetch_assoc();
    }
}
?>
