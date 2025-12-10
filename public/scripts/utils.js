/**
 * Utility Functions
 * Common helper functions used across the application
 */

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
function showToast(message, type = 'info', duration = 3000) {
  // Create toast container if it doesn't exist
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 400px;
    `;
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };

  const colors = {
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107',
    info: '#5865F2'
  };

  toast.style.cssText = `
    background: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    border-left: 4px solid ${colors[type]};
    animation: slideInRight 0.3s ease;
  `;

  toast.innerHTML = `
    <i class="fas ${icons[type]}" style="color: ${colors[type]}; font-size: 20px;"></i>
    <span style="flex: 1; color: #333; font-size: 14px; line-height: 1.4;">${message}</span>
    <button onclick="this.parentElement.remove()" style="background: none; border: none; color: #999; cursor: pointer; font-size: 18px; padding: 0; line-height: 1;">×</button>
  `;

  container.appendChild(toast);

  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => {
      toast.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // Add animation styles if not already added
  if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Show loading spinner in container
 * @param {HTMLElement} container - Container element
 * @param {string} message - Loading message
 */
function showLoading(container, message = 'Loading...') {
  if (!container) return;
  
  container.innerHTML = `
    <div style="text-align: center; padding: 40px; color: #666;">
      <div class="loading-spinner" style="margin: 0 auto 20px;"></div>
      <p>${message}</p>
    </div>
  `;
}

/**
 * Show empty state in container
 * @param {HTMLElement} container - Container element
 * @param {string} message - Empty state message
 */
function showEmptyState(container, message) {
  if (!container) return;
    /**
     * Returns the badge class for a given status (for dashboard)
     * @param {string} status - Status string (Pending, Confirmed, Completed, Cancelled)
     * @returns {string} - CSS class for badge
     */
    function getStatusBadgeClass(status) {
      const statusMap = {
        'Pending': 'badge-warning',
        'Confirmed': 'badge-success',
        'Completed': 'badge-info',
        'Cancelled': 'badge-danger'
      };
      return statusMap[status] || 'badge-secondary';
    }

    window.getStatusBadgeClass = getStatusBadgeClass;
  
  container.innerHTML = `
    <div class="empty-state">
      <i class="fas fa-inbox" style="font-size: 64px; color: #ddd; margin-bottom: 20px;"></i>
      <p style="font-size: 16px; color: #666;">${message}</p>
    </div>
  `;
}

/**
 * Show error state in container
 * @param {HTMLElement} container - Container element
 * @param {string} message - Error message
 */
function showError(container, message = 'An error occurred') {
  if (!container) return;
  
  container.innerHTML = `
    <div style="text-align: center; padding: 40px;">
      <i class="fas fa-exclamation-triangle" style="font-size: 64px; color: #dc3545; margin-bottom: 20px;"></i>
      <p style="font-size: 16px; color: #721c24;">${message}</p>
      <button class="btn btn-secondary" onclick="location.reload()" style="margin-top: 20px;">
        <i class="fas fa-redo"></i> Try Again
      </button>
    </div>
  `;
}

/**
 * Handle API error and show toast
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Default message if error has none
 */
function handleApiError(error, defaultMessage = 'An error occurred') {
  console.error('API Error:', error);
  const message = error.message || defaultMessage;
  showToast(message, 'error', 5000);
}

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
