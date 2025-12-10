/**
 * Google Meet Link Generator
 * Generates non-expiring Google Meet links for tutors
 */

/**
 * Generate a random Google Meet-style code
 * Format: xxx-xxxx-xxx (e.g., abc-defg-hij)
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
 * Generate a full Google Meet link
 * @param {string} tutorId - Optional tutor ID to seed the code
 * @returns {string} Full Google Meet URL
 */
export function generateGoogleMeetLink(tutorId?: string | number): string {
  let code = generateMeetCode();
  
  // If tutorId provided, incorporate it for uniqueness
  if (tutorId) {
    const idStr = String(tutorId);
    const seedChars = 'abcdefghijklmnopqrstuvwxyz';
    
    // Use tutor ID to influence the code generation
    const seedIndex = parseInt(idStr) % 26;
    const seedChar = seedChars[seedIndex];
    
    // Replace middle character with seed-based character
    const parts = code.split('-');
    parts[1] = parts[1].substring(0, 2) + seedChar + parts[1].substring(3);
    code = parts.join('-');
  }
  
  return `https://meet.google.com/${code}`;
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
