// Utility functions
const utils = {
  // Show loading spinner
  showLoading(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      element.innerHTML = '<div class="spinner">Loading...</div>';
    }
  },

  // Hide loading spinner
  hideLoading(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (element) {
      element.innerHTML = '';
    }
  },

  // Show toast notification
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  },

  // Show alert modal
  showAlert(title, message, type = 'info') {
    alert(`${title}\n\n${message}`);
  },

  // Confirm dialog
  async confirm(message) {
    return window.confirm(message);
  },

  // Format date
  formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  },

  // Format time
  formatTime(timeString) {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  },

  // Format datetime
  formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  // Get time ago
  timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
      }
    }

    return 'just now';
  },

  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Validate email
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Validate phone
  isValidPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10;
  },

  // Escape HTML
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Get status badge class
  getStatusBadgeClass(status) {
    const badges = {
      pending: 'badge-warning',
      confirmed: 'badge-info',
      completed: 'badge-success',
      cancelled: 'badge-danger',
    };
    return badges[status] || 'badge-secondary';
  },

  // Generate star rating HTML
  generateStarRating(rating, maxStars = 5) {
    let html = '';
    for (let i = 1; i <= maxStars; i++) {
      if (i <= rating) {
        html += '<span class="star filled">★</span>';
      } else if (i - 0.5 <= rating) {
        html += '<span class="star half">★</span>';
      } else {
        html += '<span class="star">☆</span>';
      }
    }
    return html;
  },

  // Pagination helper
  createPagination(totalPages, currentPage, onPageChange) {
    const container = document.createElement('div');
    container.className = 'pagination';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Previous';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => onPageChange(currentPage - 1);
    container.appendChild(prevBtn);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 2 && i <= currentPage + 2)
      ) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = i === currentPage ? 'active' : '';
        pageBtn.onclick = () => onPageChange(i);
        container.appendChild(pageBtn);
      } else if (
        i === currentPage - 3 ||
        i === currentPage + 3
      ) {
        const dots = document.createElement('span');
        dots.textContent = '...';
        container.appendChild(dots);
      }
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => onPageChange(currentPage + 1);
    container.appendChild(nextBtn);

    return container;
  },

  // Copy to clipboard
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('Copied to clipboard', 'success');
    } catch (error) {
      console.error('Failed to copy:', error);
      this.showToast('Failed to copy', 'error');
    }
  },

  // Handle form errors
  showFormErrors(errors, formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    // Clear previous errors
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

    // Show new errors
    Object.keys(errors).forEach(field => {
      const input = form.querySelector(`[name="${field}"]`);
      if (input) {
        input.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = errors[field];
        input.parentNode.appendChild(errorDiv);
      }
    });
  },

  // Clear form
  clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
      form.reset();
      form.querySelectorAll('.error-message').forEach(el => el.remove());
      form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    }
  },
};

// Export for use in other files
window.utils = utils;
