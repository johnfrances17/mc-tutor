/**
 * Input Validation Utilities
 * Helps prevent SQL injection, XSS, and invalid data
 * Beginner-friendly validation with clear error messages
 */

/**
 * Validate email format
 * Only accepts @mabinicolleges.edu.ph emails
 * Example: john.doe@mabinicolleges.edu.ph
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@mabinicolleges\.edu\.ph$/i;
  return emailRegex.test(email);
};

/**
 * Validate Philippine phone number
 * Accepts: 09123456789, +639123456789
 */
export const isValidPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\s|-/g, '');
  const phoneRegex = /^(\+63|0)?9\d{9}$/;
  return phoneRegex.test(cleanPhone);
};

/**
 * Validate student ID format
 * Accepts: 2021-12345, 21-12345, 202112345
 */
export const isValidStudentId = (studentId: string): boolean => {
  return studentId.length >= 5 && studentId.length <= 50;
};

/**
 * Validate password strength
 * Minimum 6 characters for security
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * Validate user role
 */
export const isValidRole = (role: string): boolean => {
  return ['admin', 'tutor', 'tutee'].includes(role);
};

/**
 * Validate year level (now accepts numbers 1-4)
 */
export const isValidYearLevel = (yearLevel: string | number): boolean => {
  const year = typeof yearLevel === 'string' ? parseInt(yearLevel) : yearLevel;
  return Number.isInteger(year) && year >= 1 && year <= 4;
};

/**
 * Validate course code (updated for Mabini College courses)
 */
export const isValidCourse = (course: string): boolean => {
  const validCourses = ['BSA', 'BSBA', 'BSED', 'BSN', 'BSCS', 'BSCrim'];
  return validCourses.includes(course);
};

/**
 * Validate rating (1-5 stars)
 */
export const isValidRating = (rating: number): boolean => {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
};

/**
 * Sanitize user input
 * Removes potentially dangerous characters to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>'"]/g, '') // Remove HTML/script tags
    .substring(0, 5000); // Prevent excessive input
};

/**
 * Validate file type for uploads
 */
export const isValidFileType = (mimetype: string, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(mimetype);
};

/**
 * Validate file size (in MB)
 */
export const isValidFileSize = (sizeInBytes: number, maxSizeInMB: number): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return sizeInBytes <= maxSizeInBytes;
};

/**
 * Validate and sanitize pagination parameters
 * Prevents negative pages and excessive limits
 */
export const validatePagination = (page?: string | number, limit?: string | number) => {
  const parsedPage = typeof page === 'number' ? page : parseInt(page || '1', 10);
  const parsedLimit = typeof limit === 'number' ? limit : parseInt(limit || '10', 10);

  const validPage = Math.max(1, isNaN(parsedPage) ? 1 : parsedPage);
  const validLimit = Math.min(100, Math.max(1, isNaN(parsedLimit) ? 10 : parsedLimit));

  return {
    page: validPage,
    limit: validLimit,
    offset: (validPage - 1) * validLimit,
  };
};
