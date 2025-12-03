/**
 * Utility Functions
 * Common helper functions used across the application
 */

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
}

/**
 * Format datetime to readable string
 * @param {string|Date} datetime - Datetime to format
 * @returns {string} Formatted datetime string
 */
function formatDateTime(datetime) {
  if (!datetime) return 'N/A';
  
  const d = new Date(datetime);
  const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit' };
  
  return d.toLocaleDateString('en-US', dateOptions) + ' ' + 
         d.toLocaleTimeString('en-US', timeOptions);
}

/**
 * Format time to readable string
 * @param {string} time - Time string (HH:MM:SS or HH:MM)
 * @returns {string} Formatted time string
 */
function formatTime(time) {
  if (!time) return 'N/A';
  
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Get status badge HTML
 * @param {string} status - Status value
 * @returns {string} HTML string for status badge
 */
function getStatusBadge(status) {
  const statusClasses = {
    pending: 'status-badge status-pending',
    confirmed: 'status-badge status-confirmed',
    completed: 'status-badge status-completed',
    cancelled: 'status-badge status-cancelled',
    active: 'status-badge status-confirmed',
    inactive: 'status-badge status-cancelled'
  };
  
  const className = statusClasses[status] || 'status-badge';
  const displayText = status.charAt(0).toUpperCase() + status.slice(1);
  
  return `<span class="${className}">${displayText}</span>`;
}

/**
 * Show alert message
 * @param {string} message - Alert message
 * @param {string} type - Alert type (success, danger, info, warning)
 */
function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  alertDiv.style.position = 'fixed';
  alertDiv.style.top = '20px';
  alertDiv.style.right = '20px';
  alertDiv.style.zIndex = '9999';
  alertDiv.style.minWidth = '300px';
  
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

/**
 * Debounce function
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {function} Debounced function
 */
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate student ID format (YYYY-XXXXX)
 * @param {string} studentId - Student ID to validate
 * @returns {boolean} True if valid
 */
function isValidStudentId(studentId) {
  const studentIdRegex = /^\d{4}-\d{5}$/;
  return studentIdRegex.test(studentId);
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeHTML(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Escape HTML entities
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHTML(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Get query parameter from URL
 * @param {string} param - Parameter name
 * @returns {string|null} Parameter value
 */
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Format file size to readable string
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<void>}
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showAlert('Copied to clipboard!', 'success');
  } catch (error) {
    console.error('Failed to copy:', error);
    showAlert('Failed to copy to clipboard', 'danger');
  }
}

/**
 * Generate random ID
 * @returns {string} Random ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} True if in viewport
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Scroll to element smoothly
 * @param {HTMLElement|string} element - Element or selector
 */
function scrollToElement(element) {
  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, length = 100) {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + '...';
}

// Export utilities for use in other scripts
if (typeof window !== 'undefined') {
  window.utils = {
    formatDate,
    formatDateTime,
    formatTime,
    getStatusBadge,
    showAlert,
    debounce,
    isValidEmail,
    isValidStudentId,
    sanitizeHTML,
    escapeHTML,
    getQueryParam,
    formatFileSize,
    copyToClipboard,
    generateId,
    isInViewport,
    scrollToElement,
    truncateText
  };
}
