/**
 * Google Meet Link Generator
 * Generates Google Meet instant meeting links for tutors
 * Note: Uses meet.google.com/new which creates instant meetings when first accessed
 */

/**
 * Generate a Google Meet instant meeting link
 * This uses Google's "new" endpoint which creates an instant meeting
 * when the tutor first clicks it, then the link becomes permanent
 * 
 * Alternative: Returns a unique meeting code that tutors should use to create
 * their own Google Meet room for consistency
 * 
 * @param {string} _tutorId - Tutor ID (currently unused, for future enhancement)
 * @returns {string} Google Meet instant meeting URL
 */
export function generateGoogleMeetLink(_tutorId?: string | number): string {
  // Option 1: Use Google Meet's instant meeting feature
  // When a tutor clicks this link, Google creates a new permanent meeting room
  // The tutor should then copy the actual generated link and update their subject
  
  // For now, we'll generate a code that tutors can use as reference
  // They should create their own meet link: https://meet.google.com/new
  // Then replace it in their subject settings
  
  // Return Google Meet's instant meeting link
  // This will create a new meeting when first accessed by the tutor
  // The tutor should save the actual generated link after creating it
  return `https://meet.google.com/new`;
}

/**
 * Generate a random Google Meet-style code for reference
 * Format: xxx-xxxx-xxx (e.g., abc-defg-hij)
 * Note: This is just for display purposes - tutors should create actual Meet links
 * @returns {string} Random meeting code
 */
export function generateMeetCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  
  const randomChar = () => chars[Math.floor(Math.random() * chars.length)];
  
  // Generate format: xxx-xxxx-xxx
  const part1 = Array(3).fill(0).map(() => randomChar()).join('');
  const part2 = Array(4).fill(0).map(() => randomChar()).join('');
  const part3 = Array(3).fill(0).map(() => randomChar()).join('');
  
  return `${part1}-${part2}-${part3}`;
}

/**
 * Validate if a string is a valid Google Meet link
 * @param {string} link - Link to validate
 * @returns {boolean} True if valid Google Meet link
 */
export function isValidGoogleMeetLink(link: string): boolean {
  if (!link) return false;
  
  const meetRegex = /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/;
  return meetRegex.test(link);
}

/**
 * Extract meet code from full Google Meet URL
 * @param {string} link - Full Google Meet URL
 * @returns {string | null} Meeting code or null if invalid
 */
export function extractMeetCode(link: string): string | null {
  if (!isValidGoogleMeetLink(link)) return null;
  
  const match = link.match(/meet\.google\.com\/([a-z]{3}-[a-z]{4}-[a-z]{3})/);
  return match ? match[1] : null;
}

// Default export
export default {
  generateMeetCode,
  generateGoogleMeetLink,
  isValidGoogleMeetLink,
  extractMeetCode
};
