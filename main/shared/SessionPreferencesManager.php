<?php
/**
 * Session Preferences Manager
 * Manages tutor's location/link preferences for each subject
 */
class SessionPreferencesManager {
    private $base_path;
    
    public function __construct() {
        $this->base_path = __DIR__ . '/sessions/';
        
        // Ensure base directory exists
        if (!is_dir($this->base_path)) {
            mkdir($this->base_path, 0755, true);
        }
    }
    
    /**
     * Get tutor's preferences for a specific subject
     */
    public function getPreferences($tutor_id, $subject_id) {
        $file_path = $this->getFilePath($tutor_id, $subject_id);
        
        if (!file_exists($file_path)) {
            return $this->getDefaultPreferences($tutor_id, $subject_id);
        }
        
        $content = file_get_contents($file_path);
        return json_decode($content, true);
    }
    
    /**
     * Save tutor's preferences for a specific subject
     */
    public function savePreferences($tutor_id, $subject_id, $preferences) {
        $tutor_dir = $this->base_path . $tutor_id . '/';
        
        // Create tutor directory if doesn't exist
        if (!is_dir($tutor_dir)) {
            mkdir($tutor_dir, 0755, true);
        }
        
        $data = [
            'subject_id' => $subject_id,
            'tutor_id' => $tutor_id,
            'preferences' => $preferences,
            'updated_at' => date('Y-m-d H:i:s')
        ];
        
        $file_path = $this->getFilePath($tutor_id, $subject_id);
        return file_put_contents($file_path, json_encode($data, JSON_PRETTY_PRINT));
    }
    
    /**
     * Get all preferences for a tutor (all subjects)
     */
    public function getAllPreferences($tutor_id) {
        $tutor_dir = $this->base_path . $tutor_id . '/';
        
        if (!is_dir($tutor_dir)) {
            return [];
        }
        
        $preferences = [];
        $files = glob($tutor_dir . '*.json');
        
        foreach ($files as $file) {
            $content = file_get_contents($file);
            $data = json_decode($content, true);
            $preferences[$data['subject_id']] = $data;
        }
        
        return $preferences;
    }
    
    /**
     * Check if tutor has set preferences for a subject
     */
    public function hasPreferences($tutor_id, $subject_id) {
        $file_path = $this->getFilePath($tutor_id, $subject_id);
        return file_exists($file_path);
    }
    
    /**
     * Get available session types for a subject
     */
    public function getAvailableTypes($tutor_id, $subject_id) {
        $prefs = $this->getPreferences($tutor_id, $subject_id);
        $available = [];
        
        if (isset($prefs['preferences']['face-to-face']) && $prefs['preferences']['face-to-face']['available']) {
            $available[] = [
                'type' => 'face-to-face',
                'label' => 'Face-to-Face',
                'location' => $prefs['preferences']['face-to-face']['location']
            ];
        }
        
        if (isset($prefs['preferences']['online']) && $prefs['preferences']['online']['available']) {
            $available[] = [
                'type' => 'online',
                'label' => 'Online',
                'location' => $prefs['preferences']['online']['meeting_link']
            ];
        }
        
        return $available;
    }
    
    /**
     * Get default preferences structure
     */
    private function getDefaultPreferences($tutor_id, $subject_id) {
        return [
            'subject_id' => $subject_id,
            'tutor_id' => $tutor_id,
            'preferences' => [
                'face-to-face' => [
                    'available' => false,
                    'location' => ''
                ],
                'online' => [
                    'available' => false,
                    'meeting_link' => ''
                ]
            ],
            'updated_at' => null
        ];
    }
    
    /**
     * Get file path for tutor-subject preferences
     */
    private function getFilePath($tutor_id, $subject_id) {
        return $this->base_path . $tutor_id . '/' . $subject_id . '.json';
    }
    
    /**
     * Delete preferences for a subject
     */
    public function deletePreferences($tutor_id, $subject_id) {
        $file_path = $this->getFilePath($tutor_id, $subject_id);
        
        if (file_exists($file_path)) {
            return unlink($file_path);
        }
        
        return true;
    }
}
