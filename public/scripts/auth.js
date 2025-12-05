/**
 * Authentication Helper Functions
 * Handles login, logout, and session management
 */

/**
 * Check if user is logged in
 * @returns {boolean}
 */
function isLoggedIn() {
  return !!localStorage.getItem('token');
}

/**
 * Get current user from localStorage (synchronous)
 * @returns {object|null}
 */
function getCurrentUserSync() {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Get current user from backend API with validation (async)
 * Validates token and returns fresh user data
 * @returns {Promise<object|null>}
 */
async function getCurrentUser() {
  try {
    // Check if token exists
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, user not logged in');
      return null;
    }

    // Validate token with backend
    const response = await window.API.auth.getCurrentUser();
    
    if (response.success && response.data && response.data.user) {
      // Update localStorage with fresh user data
      const user = response.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } else {
      // Invalid token, clear session
      console.log('Token validation failed, clearing session');
      clearSession();
      return null;
    }
  } catch (error) {
    console.error('Error getting current user:', error);
    // On error (network, 401, etc), clear session
    clearSession();
    return null;
  }
}

/**
 * Save user session
 * @param {object} data - { token, refreshToken, user }
 */
function saveSession(data) {
  localStorage.setItem('token', data.token);
  if (data.refreshToken) {
    localStorage.setItem('refreshToken', data.refreshToken);
  }
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }
}

/**
 * Clear user session (logout)
 */
function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

/**
 * Redirect to login if not authenticated
 */
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = '/html/login.html';
    return false;
  }
  return true;
}

/**
 * Redirect to dashboard based on user role
 * @param {string} role - User role (admin, tutor, tutee)
 */
function redirectToDashboard(role) {
  const dashboards = {
    admin: '/html/admin-dashboard.html',
    tutor: '/html/tutor-dashboard.html',
    tutee: '/html/student-dashboard.html'
  };
  
  const dashboard = dashboards[role] || '/html/student-dashboard.html';
  window.location.href = dashboard;
}

/**
 * Check if user has required role (synchronous)
 * @param {string|string[]} allowedRoles - Role(s) allowed
 * @returns {boolean}
 */
function hasRole(allowedRoles) {
  const user = getCurrentUserSync();
  if (!user) return false;
  
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(user.role);
}

/**
 * Redirect if user doesn't have required role (async)
 * @param {string|string[]} allowedRoles - Role(s) allowed
 * @returns {Promise<boolean>}
 */
async function requireRole(allowedRoles) {
  const user = await getCurrentUser();
  
  if (!user) {
    window.location.href = '/html/login.html';
    return false;
  }
  
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.includes(user.role)) {
    alert('You do not have permission to access this page');
    redirectToDashboard(user.role);
    return false;
  }
  
  return true;
}* Redirect if user doesn't have required role
 * @param {string|string[]} allowedRoles - Role(s) allowed
 */
function requireRole(allowedRoles) {
  if (!requireAuth()) return false;
  
  if (!hasRole(allowedRoles)) {
    alert('You do not have permission to access this page');
    redirectToDashboard(getCurrentUser().role);
    return false;
  }
  
  return true;
}

/**
 * Handle login form submission
 * @param {Event} event - Form submit event
 */
async function handleLogin(event) {
  event.preventDefault();
  
  const form = event.target;
  const email = form.email.value.trim();
  const password = form.password.value;
  const role = form.role.value;
  
  try {
    const response = await API.auth.login({ email, password, role });
    
    if (response.success) {
      saveSession(response.data);
      redirectToDashboard(response.data.user.role);
    } else {
      alert(response.message || 'Login failed');
    }
  } catch (error) {
    alert(error.message || 'Login failed. Please try again.');
  }
}

/**
 * Handle logout
 */
async function handleLogout() {
  try {
    await API.auth.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearSession();
    window.location.href = '/html/login.html?logout=true';
  }
}

// Alias for compatibility
const logout = handleLogout;

/**
 * Handle registration form submission
 * @param {Event} event - Form submit event
 */
async function handleRegister(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = {
    studentId: form.studentId.value.trim(),
    email: form.email.value.trim(),
    password: form.password.value,
    confirmPassword: form.confirmPassword.value,
    fullName: form.fullName.value.trim(),
    role: form.role.value,
    phone: form.phone?.value.trim() || '',
    yearLevel: form.yearLevel?.value || '',
    course: form.course?.value.trim() || ''
  };
  
  // Validate passwords match
  if (formData.password !== formData.confirmPassword) {
    alert('Passwords do not match');
    return;
  }
  
  try {
    const response = await API.auth.register(formData);
    
    if (response.success) {
      alert('Registration successful! Please login.');
      window.location.href = '/html/login.html';
    } else {
/**
 * Initialize authentication on page load (async)
 */
async function initAuth() {
  // Check if on login/register page
  const path = window.location.pathname;
  const isAuthPage = path.includes('/login.html') || path.includes('/register.html') || path.includes('/index.html') || path.includes('/forgot-password.html') || path.includes('/reset-password.html');
  
  // If logged in and on auth page, redirect to dashboard
  if (isLoggedIn() && isAuthPage) {
    const user = await getCurrentUser();
    if (user) {
      redirectToDashboard(user.role);
      return;
    }
  }
  
  // Setup logout buttons
  const logoutButtons = document.querySelectorAll('[data-logout], .logout-btn, #logoutBtn');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Logout clicked!');
      handleLogout();
      return false;
    });
  });
  
  // Display user info if logged in (use sync for display only)
  const user = getCurrentUserSync();
  if (user) {
    const userNameElements = document.querySelectorAll('[data-user-name]');
    userNameElements.forEach(el => {
      el.textContent = user.fullName || user.full_name || 'User';
    });
    
    const userRoleElements = document.querySelectorAll('[data-user-role]');
    userRoleElements.forEach(el => {
      el.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    });
  }
}   });
    
    const userRoleElements = document.querySelectorAll('[data-user-role]');
    userRoleElements.forEach(el => {
      el.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    });
  }
// Export functions for use in other scripts
if (typeof window !== 'undefined') {
  window.auth = {
    isLoggedIn,
    getCurrentUser,
    getCurrentUserSync,
    hasRoleAsync,
    saveSession,
    clearSession,
    requireAuth,
    requireRole,
    hasRole,
    redirectToDashboard,
    handleLogin,
    handleLogout,
    logout: handleLogout, // Export as both names for compatibility
    handleRegister,
    initAuth
  };
}   requireAuth,
    requireRole,
    hasRole,
    redirectToDashboard,
    handleLogin,
    handleLogout,
    logout: handleLogout, // Export as both names for compatibility
    handleRegister
  };
}
