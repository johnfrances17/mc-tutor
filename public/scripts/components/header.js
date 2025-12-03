/**
 * Header Component
 * Renders dynamic header with logo, user info, and logout button
 */

/**
 * Render header component
 * @param {object} user - Current user object
 * @returns {string} HTML string for header
 */
export function renderHeader(user) {
  if (!user) return '';

  const roleLabel = user.role === 'tutee' ? 'Student' : 
                    user.role === 'tutor' ? 'Tutor' : 
                    user.role === 'admin' ? 'Admin' : 'User';

  return `
    <header>
      <div class="header-content">
        <div class="logo">
          <h1>MC Tutor - ${roleLabel} Panel</h1>
          <p>Mabini College Inc. | Cloud-Based Peer Tutoring Platform</p>
        </div>
        <div class="user-info">
          <span>Welcome, <strong data-user-name>${user.full_name || user.fullName || 'User'}</strong></span>
          <a href="profile.html" class="btn btn-sm btn-secondary">
            <i class="fas fa-user"></i> Profile
          </a>
          <a href="#" class="logout-btn" data-logout>
            <i class="fas fa-sign-out-alt"></i> Logout
          </a>
        </div>
      </div>
    </header>
  `;
}

/**
 * Initialize header on page
 * Auto-injects header into body if user is logged in
 */
export function initHeader() {
  const user = window.auth?.getCurrentUser();
  
  if (user) {
    const headerHTML = renderHeader(user);
    
    // Check if header already exists
    let headerElement = document.querySelector('header');
    
    if (!headerElement) {
      // Insert at beginning of body
      document.body.insertAdjacentHTML('afterbegin', headerHTML);
    } else {
      // Replace existing header content
      headerElement.outerHTML = headerHTML;
    }

    // Re-attach logout listeners (in case header was replaced)
    const logoutButtons = document.querySelectorAll('[data-logout], .logout-btn');
    logoutButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
          window.auth.handleLogout();
        }
      });
    });
  }
}

// Auto-initialize if auth is available
if (typeof window !== 'undefined') {
  window.headerComponent = {
    renderHeader,
    initHeader
  };
}
