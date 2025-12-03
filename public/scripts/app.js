/**
 * Main Application Initialization
 * This script initializes all components for authenticated pages
 * Include this AFTER api.js and auth.js on every protected page
 */

/**
 * Initialize the application
 * Sets up header, nav, floating chat, and page-specific functionality
 */
async function initApp() {
  try {
    // Check authentication first
    if (!window.auth?.isLoggedIn()) {
      // Allow public pages
      const publicPages = ['index.html', 'login.html', 'register.html'];
      const currentPage = window.location.pathname.split('/').pop();
      
      if (!publicPages.includes(currentPage)) {
        window.location.href = '/html/login.html';
        return;
      }
    }

    const user = window.auth?.getCurrentUser();
    
    if (user) {
      // Initialize components in order
      await initializeComponents(user);
      
      // Page-specific initialization
      const currentPage = window.location.pathname.split('/').pop();
      await initializePage(currentPage, user);
    }
    
  } catch (error) {
    console.error('App initialization error:', error);
    showToast?.('Failed to initialize application', 'error');
  }
}

/**
 * Initialize all UI components
 * @param {object} user - Current user object
 */
async function initializeComponents(user) {
  // Load component scripts dynamically
  await loadScript('/scripts/components/header.js');
  await loadScript('/scripts/components/nav.js');
  await loadScript('/scripts/components/floatingChat.js');
  
  // Initialize header
  if (window.headerComponent?.initHeader) {
    window.headerComponent.initHeader();
  }
  
  // Initialize navigation
  if (window.navComponent?.initNav) {
    await window.navComponent.initNav();
  }
  
  // Initialize floating chat button
  if (window.floatingChatComponent?.initFloatingChat) {
    await window.floatingChatComponent.initFloatingChat();
  }
}

/**
 * Initialize page-specific functionality
 * @param {string} pageName - Current page filename
 * @param {object} user - Current user object
 */
async function initializePage(pageName, user) {
  const pageInitializers = {
    'student-dashboard.html': initStudentDashboard,
    'tutor-dashboard.html': initTutorDashboard,
    'admin-dashboard.html': initAdminDashboard,
    'find-tutors.html': initFindTutors,
    'materials.html': initMaterials,
    'messenger.html': initMessenger,
    'profile.html': initProfile
  };

  const initializer = pageInitializers[pageName];
  if (initializer && typeof initializer === 'function') {
    try {
      await initializer(user);
    } catch (error) {
      console.error(`Error initializing ${pageName}:`, error);
      handleApiError?.(error, `Failed to load ${pageName}`);
    }
  }
}

/**
 * Load script dynamically
 * @param {string} src - Script source URL
 * @returns {Promise} Promise that resolves when script is loaded
 */
function loadScript(src) {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.type = 'module';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Initialize Student Dashboard
 * @param {object} user - Current user object
 */
async function initStudentDashboard(user) {
  console.log('Initializing student dashboard...');
  
  // Update welcome message
  const studentNameEl = document.getElementById('studentName');
  if (studentNameEl) {
    studentNameEl.textContent = user.full_name || user.fullName || 'Student';
  }

  // Load dashboard stats
  await loadStudentStats();
  
  // Load upcoming sessions
  await loadUpcomingSessions();
}

/**
 * Load student statistics
 */
async function loadStudentStats() {
  try {
    const statsResponse = await API.sessions.getMySessions({ role: 'tutee' });
    
    if (statsResponse.success) {
      const sessions = statsResponse.data || [];
      
      // Calculate stats
      const totalSessions = sessions.length;
      const pendingSessions = sessions.filter(s => s.status === 'pending').length;
      const confirmedSessions = sessions.filter(s => s.status === 'confirmed').length;
      const completedSessions = sessions.filter(s => s.status === 'completed').length;
      
      // Update stat cards
      updateStatCard('totalSessions', totalSessions);
      updateStatCard('pendingSessions', pendingSessions);
      updateStatCard('confirmedSessions', confirmedSessions);
      updateStatCard('completedSessions', completedSessions);
    }
  } catch (error) {
    console.error('Error loading student stats:', error);
  }
}

/**
 * Load upcoming sessions for student
 */
async function loadUpcomingSessions() {
  const container = document.getElementById('upcomingSessionsList');
  if (!container) return;

  showLoading?.(container, 'Loading upcoming sessions...');

  try {
    const response = await API.sessions.getMySessions({ 
      role: 'tutee',
      status: 'confirmed'
    });
    
    if (response.success) {
      const sessions = response.data || [];
      
      if (sessions.length === 0) {
        showEmptyState?.(container, 'No upcoming sessions. Find a tutor to book a session!');
        return;
      }

      // Render sessions
      container.innerHTML = sessions.map(session => `
        <div class="session-item">
          <div class="session-info">
            <div class="session-subject">${session.subject_name || session.subjectName || 'Subject'}</div>
            <div class="session-details">
              <span><i class="fas fa-user"></i> ${session.tutor_name || session.tutorName || 'Tutor'}</span>
              <span><i class="fas fa-calendar"></i> ${formatDate?.(session.session_date || session.sessionDate)}</span>
              <span><i class="fas fa-clock"></i> ${formatTime?.(session.start_time || session.startTime)} - ${formatTime?.(session.end_time || session.endTime)}</span>
              <span><i class="fas fa-map-marker-alt"></i> ${session.location || 'TBD'}</span>
            </div>
          </div>
          <div class="session-actions">
            <button class="btn btn-sm btn-success" onclick="completeSession(${session.id || session.session_id})">
              <i class="fas fa-check"></i> Complete
            </button>
            <button class="btn btn-sm btn-danger" onclick="cancelSession(${session.id || session.session_id})">
              <i class="fas fa-times"></i> Cancel
            </button>
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading upcoming sessions:', error);
    showError?.(container, 'Failed to load sessions');
  }
}

/**
 * Initialize Tutor Dashboard
 * @param {object} user - Current user object
 */
async function initTutorDashboard(user) {
  console.log('Initializing tutor dashboard...');
  
  // Update welcome message
  const tutorNameEl = document.getElementById('tutorName');
  if (tutorNameEl) {
    tutorNameEl.textContent = user.full_name || user.fullName || 'Tutor';
  }

  // Load dashboard stats
  await loadTutorStats();
  
  // Load pending requests
  await loadPendingRequests();
  
  // Load upcoming sessions
  await loadTutorUpcomingSessions();
}

/**
 * Load tutor statistics
 */
async function loadTutorStats() {
  try {
    const statsResponse = await API.sessions.getMySessions({ role: 'tutor' });
    
    if (statsResponse.success) {
      const sessions = statsResponse.data || [];
      
      // Calculate stats
      const pendingSessions = sessions.filter(s => s.status === 'pending').length;
      const confirmedSessions = sessions.filter(s => s.status === 'confirmed').length;
      const completedSessions = sessions.filter(s => s.status === 'completed').length;
      
      // Update stat cards
      updateStatCard('pendingSessions', pendingSessions);
      updateStatCard('confirmedSessions', confirmedSessions);
      updateStatCard('completedSessions', completedSessions);
    }
  } catch (error) {
    console.error('Error loading tutor stats:', error);
  }
}

/**
 * Load pending session requests for tutor
 */
async function loadPendingRequests() {
  const container = document.getElementById('pendingRequestsList');
  if (!container) return;

  showLoading?.(container, 'Loading pending requests...');

  try {
    const response = await API.sessions.getMySessions({ 
      role: 'tutor',
      status: 'pending'
    });
    
    if (response.success) {
      const sessions = response.data || [];
      
      if (sessions.length === 0) {
        showEmptyState?.(container, 'No pending requests');
        return;
      }

      // Render pending requests
      container.innerHTML = sessions.map(session => `
        <div class="session-request-item">
          <div class="session-info">
            <div class="session-subject">${session.subject_name || session.subjectName || 'Subject'}</div>
            <div class="session-details">
              <span><i class="fas fa-user"></i> ${session.student_name || session.studentName || 'Student'}</span>
              <span><i class="fas fa-calendar"></i> ${formatDate?.(session.session_date || session.sessionDate)}</span>
              <span><i class="fas fa-clock"></i> ${formatTime?.(session.start_time || session.startTime)} - ${formatTime?.(session.end_time || session.endTime)}</span>
            </div>
            ${session.notes ? `<div class="session-notes"><i class="fas fa-comment"></i> ${session.notes}</div>` : ''}
          </div>
          <div class="session-actions">
            <button class="btn btn-sm btn-success" onclick="confirmSessionRequest(${session.id || session.session_id})">
              <i class="fas fa-check"></i> Confirm
            </button>
            <button class="btn btn-sm btn-danger" onclick="declineSessionRequest(${session.id || session.session_id})">
              <i class="fas fa-times"></i> Decline
            </button>
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading pending requests:', error);
    showError?.(container, 'Failed to load requests');
  }
}

/**
 * Load upcoming sessions for tutor
 */
async function loadTutorUpcomingSessions() {
  const container = document.getElementById('upcomingSessionsList');
  if (!container) return;

  showLoading?.(container, 'Loading upcoming sessions...');

  try {
    const response = await API.sessions.getMySessions({ 
      role: 'tutor',
      status: 'confirmed'
    });
    
    if (response.success) {
      const sessions = response.data || [];
      
      if (sessions.length === 0) {
        showEmptyState?.(container, 'No upcoming sessions');
        return;
      }

      // Render sessions
      container.innerHTML = sessions.map(session => `
        <div class="session-item">
          <div class="session-info">
            <div class="session-subject">${session.subject_name || session.subjectName || 'Subject'}</div>
            <div class="session-details">
              <span><i class="fas fa-user"></i> ${session.student_name || session.studentName || 'Student'}</span>
              <span><i class="fas fa-calendar"></i> ${formatDate?.(session.session_date || session.sessionDate)}</span>
              <span><i class="fas fa-clock"></i> ${formatTime?.(session.start_time || session.startTime)} - ${formatTime?.(session.end_time || session.endTime)}</span>
              <span><i class="fas fa-map-marker-alt"></i> ${session.location || 'TBD'}</span>
            </div>
          </div>
          <div class="session-actions">
            <button class="btn btn-sm btn-success" onclick="completeSession(${session.id || session.session_id})">
              <i class="fas fa-check"></i> Complete
            </button>
            <button class="btn btn-sm btn-danger" onclick="cancelSession(${session.id || session.session_id})">
              <i class="fas fa-times"></i> Cancel
            </button>
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading upcoming sessions:', error);
    showError?.(container, 'Failed to load sessions');
  }
}

/**
 * Update stat card value
 * @param {string} id - Stat card ID
 * @param {number} value - New value
 */
function updateStatCard(id, value) {
  const el = document.getElementById(id);
  if (el) {
    const numberEl = el.querySelector('.number, .stat-value');
    if (numberEl) {
      numberEl.textContent = value;
    }
  }
}

/**
 * Initialize Admin Dashboard
 * @param {object} user - Current user object
 */
async function initAdminDashboard(user) {
  console.log('Initializing admin dashboard...');
  // Admin dashboard initialization will be implemented separately
}

/**
 * Initialize Find Tutors page
 * @param {object} user - Current user object
 */
async function initFindTutors(user) {
  console.log('Initializing find tutors page...');
  // Find tutors page initialization will be implemented separately
}

/**
 * Initialize Materials page
 * @param {object} user - Current user object
 */
async function initMaterials(user) {
  console.log('Initializing materials page...');
  // Materials page initialization will be implemented separately
}

/**
 * Initialize Messenger page
 * @param {object} user - Current user object
 */
async function initMessenger(user) {
  console.log('Initializing messenger page...');
  // Messenger page initialization will be implemented separately
}

/**
 * Initialize Profile page
 * @param {object} user - Current user object
 */
async function initProfile(user) {
  console.log('Initializing profile page...');
  // Profile page initialization will be implemented separately
}

/**
 * Global action functions for session management
 */
window.confirmSessionRequest = async function(sessionId) {
  if (!confirm('Are you sure you want to confirm this session?')) return;
  
  try {
    const response = await API.sessions.confirmSession(sessionId);
    if (response.success) {
      showToast?.('Session confirmed successfully', 'success');
      setTimeout(() => location.reload(), 1000);
    }
  } catch (error) {
    handleApiError?.(error, 'Failed to confirm session');
  }
};

window.declineSessionRequest = async function(sessionId) {
  const reason = prompt('Reason for declining (optional):');
  if (reason === null) return; // User cancelled
  
  try {
    const response = await API.sessions.cancelSession(sessionId, reason);
    if (response.success) {
      showToast?.('Session declined', 'success');
      setTimeout(() => location.reload(), 1000);
    }
  } catch (error) {
    handleApiError?.(error, 'Failed to decline session');
  }
};

window.completeSession = async function(sessionId) {
  if (!confirm('Mark this session as completed?')) return;
  
  try {
    const response = await API.sessions.completeSession(sessionId);
    if (response.success) {
      showToast?.('Session marked as completed', 'success');
      setTimeout(() => location.reload(), 1000);
    }
  } catch (error) {
    handleApiError?.(error, 'Failed to complete session');
  }
};

window.cancelSession = async function(sessionId) {
  const reason = prompt('Reason for cancellation:');
  if (!reason) return;
  
  try {
    const response = await API.sessions.cancelSession(sessionId, reason);
    if (response.success) {
      showToast?.('Session cancelled', 'success');
      setTimeout(() => location.reload(), 1000);
    }
  } catch (error) {
    handleApiError?.(error, 'Failed to cancel session');
  }
};

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
