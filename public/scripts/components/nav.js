/**
 * Navigation Component
 * Renders role-based navigation menu with active state
 */

/**
 * Navigation menu definitions by role
 */
const NAV_MENUS = {
  tutee: [
    { url: 'student-dashboard.html', label: 'Dashboard', icon: 'fas fa-home' },
    { url: 'find-tutors.html', label: 'Find Tutors', icon: 'fas fa-search' },
    { url: 'materials.html', label: 'Study Materials', icon: 'fas fa-book' },
    { url: 'profile.html', label: 'Profile', icon: 'fas fa-user' }
  ],
  tutor: [
    { url: 'tutor-dashboard.html', label: 'Dashboard', icon: 'fas fa-home' },
    { url: 'materials.html', label: 'Study Materials', icon: 'fas fa-book' },
    { url: 'profile.html', label: 'Profile', icon: 'fas fa-user' }
  ],
  admin: [
    { url: 'admin-dashboard.html', label: 'Dashboard', icon: 'fas fa-home' },
    { url: 'admin-dashboard.html#users', label: 'Manage Users', icon: 'fas fa-users' },
    { url: 'admin-dashboard.html#subjects', label: 'Manage Subjects', icon: 'fas fa-book-open' },
    { url: 'admin-dashboard.html#sessions', label: 'View Sessions', icon: 'fas fa-calendar' },
    { url: 'materials.html', label: 'Materials', icon: 'fas fa-book' }
  ]
};

/**
 * Get current page filename
 * @returns {string} Current page filename
 */
function getCurrentPage() {
  const path = window.location.pathname;
  return path.split('/').pop() || 'index.html';
}

/**
 * Render navigation menu
 * @param {string} role - User role (tutee, tutor, admin)
 * @param {object} badges - Badge counts object { 'unread-messages': 5 }
 * @returns {string} HTML string for navigation
 */
export function renderNav(role, badges = {}) {
  const menuItems = NAV_MENUS[role] || NAV_MENUS.tutee;
  const currentPage = getCurrentPage();

  const navItems = menuItems.map(item => {
    const isActive = currentPage === item.url.split('#')[0] ? 'active' : '';
    const badgeHTML = item.badge && badges[item.badge] > 0 
      ? `<span class="badge badge-danger">${badges[item.badge]}</span>` 
      : '';

    return `
      <a href="${item.url}" class="nav-link ${isActive}">
        <i class="${item.icon}"></i> ${item.label}${badgeHTML}
      </a>
    `;
  }).join('');

  return `
    <nav class="navbar">
      <div class="nav-container">
        <a href="index.html" class="nav-brand">
          <i class="fas fa-graduation-cap"></i> MC Tutor
        </a>
        <div class="nav-links">
          ${navItems}
        </div>
      </div>
    </nav>
  `;
}

/**
 * Initialize navigation on page
 * Auto-injects nav after header if user is logged in
 */
export async function initNav() {
  const user = window.auth?.getCurrentUser();
  
  if (!user) return;

  // Fetch badge counts (unread messages, notifications, etc.)
  let badges = {};
  try {
    if (window.API?.chat?.getUnreadCount) {
      const unreadResponse = await window.API.notifications.getUnreadCount();
      if (unreadResponse.success) {
        badges['unread-messages'] = unreadResponse.data.count || 0;
      }
    }
  } catch (error) {
    console.error('Error fetching badge counts:', error);
  }

  const navHTML = renderNav(user.role, badges);
  
  // Check if nav already exists
  let navElement = document.querySelector('nav.navbar');
  
  if (!navElement) {
    // Insert after header
    const header = document.querySelector('header');
    if (header) {
      header.insertAdjacentHTML('afterend', navHTML);
    } else {
      // No header, insert at beginning of body
      document.body.insertAdjacentHTML('afterbegin', navHTML);
    }
  } else {
    // Replace existing nav
    navElement.outerHTML = navHTML;
  }
}

/**
 * Update badge count dynamically
 * @param {string} badgeId - Badge identifier (e.g., 'unread-messages')
 * @param {number} count - New count
 */
export function updateBadge(badgeId, count) {
  const badges = document.querySelectorAll(`.nav-link .badge`);
  // This would need more sophisticated tracking of which badge is which
  // For now, this is a placeholder for future enhancement
}

// Auto-export to window
if (typeof window !== 'undefined') {
  window.navComponent = {
    renderNav,
    initNav,
    updateBadge
  };
}
