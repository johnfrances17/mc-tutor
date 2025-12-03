import path from 'path';
import { ensureDirectoryExists, readJsonFile, writeJsonFile } from '../utils/fileSystem';

export interface SessionPreference {
  preference_id: number;
  tutor_student_id: string;
  subject_code: string;
  session_type: 'online' | 'in_person' | 'both';
  available_days: string[];
  time_slots: string[];
  location?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PreferenceFile {
  tutor_student_id: string;
  subject_code: string;
  preferences: SessionPreference[];
  last_updated: string;
}

/**
 * Session Preferences Manager Service
 * File-based session preferences storage - port of PHP SessionPreferencesManager
 */
export class SessionPreferencesService {
  private sessionsDir: string;

  constructor() {
    const baseDir = process.env.UPLOAD_DIR || './data';
    this.sessionsDir = path.join(baseDir, 'sessions');
    ensureDirectoryExists(this.sessionsDir);
  }

  /**
   * Get preference file path for a tutor and subject
   */
  private getPreferenceFilePath(tutorStudentId: string, subjectCode: string): string {
    const tutorDir = path.join(this.sessionsDir, tutorStudentId);
    ensureDirectoryExists(tutorDir);
    return path.join(tutorDir, `${subjectCode}.json`);
  }

  /**
   * Load preferences for a tutor and subject
   */
  private loadPreferences(tutorStudentId: string, subjectCode: string): PreferenceFile {
    const filePath = this.getPreferenceFilePath(tutorStudentId, subjectCode);
    const existing = readJsonFile<PreferenceFile>(filePath, null as any);

    if (existing) {
      return existing;
    }

    // Create new preference file
    const newFile: PreferenceFile = {
      tutor_student_id: tutorStudentId,
      subject_code: subjectCode,
      preferences: [],
      last_updated: new Date().toISOString(),
    };

    writeJsonFile(filePath, newFile);
    return newFile;
  }

  /**
   * Save preferences
   */
  private savePreferences(data: PreferenceFile): void {
    data.last_updated = new Date().toISOString();
    const filePath = this.getPreferenceFilePath(data.tutor_student_id, data.subject_code);
    writeJsonFile(filePath, data);
  }

  /**
   * Create or update session preference
   */
  savePreference(
    tutorStudentId: string,
    subjectCode: string,
    sessionType: SessionPreference['session_type'],
    availableDays: string[],
    timeSlots: string[],
    location?: string,
    notes?: string,
    preferenceId?: number
  ): SessionPreference {
    const prefData = this.loadPreferences(tutorStudentId, subjectCode);

    if (preferenceId) {
      // Update existing preference
      const existing = prefData.preferences.find((p) => p.preference_id === preferenceId);
      if (existing) {
        existing.session_type = sessionType;
        existing.available_days = availableDays;
        existing.time_slots = timeSlots;
        existing.location = location;
        existing.notes = notes;
        existing.updated_at = new Date().toISOString();

        this.savePreferences(prefData);
        return existing;
      }
    }

    // Create new preference
    const nextId =
      prefData.preferences.length > 0
        ? Math.max(...prefData.preferences.map((p) => p.preference_id)) + 1
        : 1;

    const preference: SessionPreference = {
      preference_id: nextId,
      tutor_student_id: tutorStudentId,
      subject_code: subjectCode,
      session_type: sessionType,
      available_days: availableDays,
      time_slots: timeSlots,
      location,
      notes,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    prefData.preferences.push(preference);
    this.savePreferences(prefData);

    return preference;
  }

  /**
   * Get preferences for a tutor and subject
   */
  getPreferences(tutorStudentId: string, subjectCode: string, activeOnly: boolean = false): SessionPreference[] {
    const prefData = this.loadPreferences(tutorStudentId, subjectCode);

    let preferences = prefData.preferences;

    if (activeOnly) {
      preferences = preferences.filter((p) => p.is_active);
    }

    // Sort by newest first
    return preferences.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  /**
   * Get all preferences for a tutor (across all subjects)
   */
  getAllTutorPreferences(tutorStudentId: string): SessionPreference[] {
    const tutorDir = path.join(this.sessionsDir, tutorStudentId);

    if (!require('fs').existsSync(tutorDir)) {
      return [];
    }

    const fs = require('fs');
    const files = fs.readdirSync(tutorDir).filter((f: string) => f.endsWith('.json'));

    const allPreferences: SessionPreference[] = [];

    for (const file of files) {
      const filePath = path.join(tutorDir, file);
      const prefData = readJsonFile<PreferenceFile>(filePath, null as any);
      if (prefData) {
        allPreferences.push(...prefData.preferences);
      }
    }

    // Sort by newest first
    return allPreferences.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }

  /**
   * Get a specific preference by ID
   */
  getPreferenceById(
    tutorStudentId: string,
    subjectCode: string,
    preferenceId: number
  ): SessionPreference | null {
    const prefData = this.loadPreferences(tutorStudentId, subjectCode);
    return prefData.preferences.find((p) => p.preference_id === preferenceId) || null;
  }

  /**
   * Delete a preference
   */
  deletePreference(tutorStudentId: string, subjectCode: string, preferenceId: number): { success: boolean } {
    const prefData = this.loadPreferences(tutorStudentId, subjectCode);

    const index = prefData.preferences.findIndex((p) => p.preference_id === preferenceId);

    if (index === -1) {
      return { success: false };
    }

    prefData.preferences.splice(index, 1);
    this.savePreferences(prefData);

    return { success: true };
  }

  /**
   * Deactivate a preference (soft delete)
   */
  deactivatePreference(tutorStudentId: string, subjectCode: string, preferenceId: number): { success: boolean } {
    const prefData = this.loadPreferences(tutorStudentId, subjectCode);

    const preference = prefData.preferences.find((p) => p.preference_id === preferenceId);

    if (!preference) {
      return { success: false };
    }

    preference.is_active = false;
    preference.updated_at = new Date().toISOString();
    this.savePreferences(prefData);

    return { success: true };
  }

  /**
   * Activate a preference
   */
  activatePreference(tutorStudentId: string, subjectCode: string, preferenceId: number): { success: boolean } {
    const prefData = this.loadPreferences(tutorStudentId, subjectCode);

    const preference = prefData.preferences.find((p) => p.preference_id === preferenceId);

    if (!preference) {
      return { success: false };
    }

    preference.is_active = true;
    preference.updated_at = new Date().toISOString();
    this.savePreferences(prefData);

    return { success: true };
  }

  /**
   * Check if tutor has active preferences for a subject
   */
  hasActivePreferences(tutorStudentId: string, subjectCode: string): boolean {
    const preferences = this.getPreferences(tutorStudentId, subjectCode, true);
    return preferences.length > 0;
  }

  /**
   * Get available session types for a tutor and subject
   */
  getAvailableSessionTypes(tutorStudentId: string, subjectCode: string): Array<'online' | 'in_person' | 'both'> {
    const preferences = this.getPreferences(tutorStudentId, subjectCode, true);
    const types = new Set<'online' | 'in_person' | 'both'>();

    preferences.forEach((pref) => {
      if (pref.session_type === 'both') {
        types.add('online');
        types.add('in_person');
      } else {
        types.add(pref.session_type);
      }
    });

    return Array.from(types);
  }
}
