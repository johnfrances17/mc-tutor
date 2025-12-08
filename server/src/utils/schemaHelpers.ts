import { supabase } from '../config/database.js';

/**
 * Validate course code
 */
export function isValidCourseCode(courseCode: string): boolean {
  const validCourses = ['BSA', 'BSBA', 'BSED', 'BSN', 'BSCS', 'BSCrim'];
  return validCourses.includes(courseCode);
}

/**
 * Get course name from course code
 */
export async function getCourseNameByCode(courseCode: string): Promise<string | null> {
  if (!courseCode) return null;
  
  const { data, error } = await supabase
    .from('courses')
    .select('course_name')
    .eq('course_code', courseCode.toUpperCase())
    .single();

  if (error || !data) {
    return null;
  }

  return data.course_name;
}

/**
 * Validate and parse year level
 */
export function parseYearLevel(yearLevel: any): number | null {
  const parsed = parseInt(yearLevel);
  
  if (isNaN(parsed) || parsed < 1 || parsed > 4) {
    return null;
  }
  
  return parsed;
}

/**
 * Convert time string to 24-hour TIME format (HH:MM:SS)
 */
export function convertTo24HourTime(time: string): string {
  if (!time) return '00:00:00';
  
  // Already in 24-hour format (HH:MM or HH:MM:SS)
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(time)) {
    // Add seconds if missing
    return time.includes(':') && time.split(':').length === 2 ? `${time}:00` : time;
  }
  
  // Convert 12-hour to 24-hour (e.g., "2:00 PM" or "02:00 PM")
  const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (match) {
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const period = match[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
  }
  
  // Fallback
  return time;
}

/**
 * Convert 24-hour TIME to 12-hour format for display
 */
export function convertTo12HourTime(time: string): string {
  if (!time) return '';
  
  const match = time.match(/(\d{1,2}):(\d{2})(:\d{2})?/);
  if (!match) return time;
  
  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = hours >= 12 ? 'PM' : 'AM';
  
  if (hours > 12) {
    hours -= 12;
  } else if (hours === 0) {
    hours = 12;
  }
  
  return `${hours}:${minutes} ${period}`;
}

/**
 * Format year level for display
 */
export function formatYearLevel(yearLevel: number): string {
  const suffixes = ['st', 'nd', 'rd', 'th'];
  const suffix = yearLevel <= 3 ? suffixes[yearLevel - 1] : suffixes[3];
  return `${yearLevel}${suffix} Year`;
}

/**
 * Validate session status
 */
export function isValidSessionStatus(status: string): boolean {
  const validStatuses = ['pending', 'approved', 'rejected', 'confirmed', 'completed', 'cancelled'];
  return validStatuses.includes(status);
}

/**
 * Validate session type
 */
export function isValidSessionType(type: string): boolean {
  const validTypes = ['online', 'face-to-face'];
  return validTypes.includes(type);
}

/**
 * Validate rating (1-5)
 */
export function isValidRating(rating: any): boolean {
  const parsed = parseInt(rating);
  return !isNaN(parsed) && parsed >= 1 && parsed <= 5;
}

/**
 * Validate material category
 */
export function isValidMaterialCategory(category: string): boolean {
  const validCategories = ['notes', 'handout', 'exercise', 'exam', 'other'];
  return validCategories.includes(category);
}

/**
 * Validate proficiency level
 */
export function isValidProficiency(level: string): boolean {
  const validLevels = ['beginner', 'intermediate', 'expert'];
  return validLevels.includes(level);
}
