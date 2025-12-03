/**
 * Navigation Menu Component
 * Dynamically generates role-based navigation menu
 */

class NavigationMenu {
  constructor(containerId = 'navMenu') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Navigation container #${containerId} not found`);
      return;
    }
    
    this.user = window.auth?.getCurrentUser();
    this.init();
  }
  
  init() {
    if (!this.user) {
      this.renderGuestMenu();
    } else {
      this.renderUserMenu();
    }
  }
  
  renderGuestMenu() {
    this.container.innerHTML = `
      <nav class="navbar">
        <div class="nav-brand">
          <a href="/html/index.html">MC Tutor</a>
        </div>
        <ul class="nav-links">
          <li><a href="/html/index.html">Home</a></li>
          <li><a href="/html/login.html">Login</a></li>
          <li><a href="/html/register.html">Register</a></li>
        </ul>
      </nav>
    `;
  }
  
  renderUserMenu() {
    const menuItems = this.getMenuItemsForRole(this.user.role);
    
    const menuHTML = menuItems.map(item => `
      <li><a href="${item.url}" class="${this.isActive(item.url) ? 'active' : ''}">${item.label}</a></li>
    `).join('');
    
    this.container.innerHTML = `
      <nav class="navbar">
        <div class="nav-brand">
          <a href="${this.getDashboardUrl()}">MC Tutor</a>
        </div>
        <ul class="nav-links">
          ${menuHTML}
          <li class="nav-user">
            <span class="user-name">${this.user.fullName || this.user.full_name}</span>
            <button class="logout-btn" data-logout>Logout</button>
          </li>
        </ul>
      </nav>
    `;
    
    // Re-attach logout handler
    this.attachLogoutHandler();
  }
  
  getMenuItemsForRole(role) {
    const menus = {
      admin: [
        { label: 'Dashboard', url: '/html/admin-dashboard.html' },
        { label: 'Manage Users', url: '/main/admin/manage_users.php' },
        { label: 'Manage Subjects', url: '/main/admin/manage_subjects.php' },
        { label: 'View Sessions', url: '/main/admin/view_sessions.php' },
        { label: 'View Materials', url: '/main/admin/view_materials.php' }
      ],
      tutor: [
        { label: 'Dashboard', url: '/html/tutor-dashboard.html' },
        { label: 'My Sessions', url: '/main/tutor/my_sessions.php' },
        { label: 'My Subjects', url: '/main/tutor/my_subjects.php' },
        { label: 'Upload Materials', url: '/main/tutor/upload_materials.php' },
        { label: 'My Feedback', url: '/main/tutor/my_feedback.php' },
        { label: 'Messages', url: '/html/messenger.html' }
      ],
      tutee: [
        { label: 'Dashboard', url: '/html/student-dashboard.html' },
        { label: 'Find Tutors', url: '/html/find-tutors.html' },
        { label: 'My Sessions', url: '/main/student/my_sessions.php' },
        { label: 'Study Materials', url: '/html/materials.html' },
        { label: 'My Feedback', url: '/main/student/my_feedback.php' },
        { label: 'Messages', url: '/html/messenger.html' }
      ]
    };
    
    return menus[role] || [];
  }
  
  getDashboardUrl() {
    const dashboards = {
      admin: '/html/admin-dashboard.html',
      tutor: '/html/tutor-dashboard.html',
      tutee: '/html/student-dashboard.html'
    };
    
    return dashboards[this.user.role] || '/html/index.html';
  }
  
  isActive(url) {
    return window.location.pathname.endsWith(url);
  }
  
  attachLogoutHandler() {
    const logoutBtn = this.container.querySelector('[data-logout]');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
          window.auth?.handleLogout();
        }
      });
    }
  }
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new NavigationMenu();
  });
} else {
  new NavigationMenu();
}

// Export for manual initialization
if (typeof window !== 'undefined') {
  window.NavigationMenu = NavigationMenu;
}
