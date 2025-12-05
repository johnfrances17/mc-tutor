/**
 * Authentication Helper Functions
 * Handles login, logout, and session management
 */

/**
 * Cookie helper functions
 */
function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Strict";
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name) {
  document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Strict";
}

/**
 * Check if user is logged in (checks both localStorage and cookies)
 * @returns {boolean}
 */
function isLoggedIn() {
  return !!(localStorage.getItem('token') || getCookie('token'));
}

/**
 * Get current user from localStorage or cookie
 * @returns {object|null}
 */
function getCurrentUser() {
  try {
    let userStr = localStorage.getItem('user');
    if (!userStr) {
      userStr = getCookie('user');
    }
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Save user session (to both localStorage and cookies)
 * @param {object} data - { token, refreshToken, user }
 */
function saveSession(data) {
  // Save to localStorage
  localStorage.setItem('token', data.token);
  if (data.refreshToken) {
    localStorage.setItem('refreshToken', data.refreshToken);
  }
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  // Save to cookies (7 days expiry)
  setCookie('token', data.token, 7);
  if (data.refreshToken) {
    setCookie('refreshToken', data.refreshToken, 7);
  }
  if (data.user) {
    setCookie('user', JSON.stringify(data.user), 7);
  }
}

/**
 * Clear user session (logout - clear both localStorage and cookies)
 */
function clearSession() {
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  // Clear cookies
  deleteCookie('token');
  deleteCookie('refreshToken');
  deleteCookie('user');
}

/**
 * Redirect to login if not authenticated
 */
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = '/public/html/auth/login.html';
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
    admin: '/public/html/admin-dashboard.html',
    tutor: '/public/html/tutor-dashboard.html',
    tutee: '/public/html/student-dashboard.html'
  };
  
  const dashboard = dashboards[role] || '/public/html/student-dashboard.html';
  window.location.href = dashboard;
}

/**
 * Check if user has required role
 * @param {string|string[]} allowedRoles - Role(s) allowed
 * @returns {boolean}
 */
function hasRole(allowedRoles) {
  const user = getCurrentUser();
  if (!user) return false;
  
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(user.role);
}

/**
 * Redirect if user doesn't have required role
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
    window.location.href = '/public/html/auth/login.html?logout=true';
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
      window.location.href = '/public/html/login.html';
    } else {
      alert(response.message || 'Registration failed');
    }
  } catch (error) {
    alert(error.message || 'Registration failed. Please try again.');
  }
}

/**
 * Initialize authentication on page load
 */
function initAuth() {
  // Check if on login/register page
  const path = window.location.pathname;
  const isAuthPage = path.includes('/login.html') || path.includes('/register.html') || path.includes('/index.html');
  
  // If logged in and on auth page, redirect to dashboard
  if (isLoggedIn() && isAuthPage) {
    const user = getCurrentUser();
    if (user) {
      redirectToDashboard(user.role);
    }
  }
  
  // Setup logout buttons
  const logoutButtons = document.querySelectorAll('[data-logout], .logout-btn');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to logout?')) {
        handleLogout();
      }
    });
  });
  
  // Display user info if logged in
  const user = getCurrentUser();
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
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuth);
} else {
  initAuth();
}

// Export functions for use in other scripts
if (typeof window !== 'undefined') {
  window.auth = {
    isLoggedIn,
    getCurrentUser,
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
    // Export cookie helpers
    setCookie,
    getCookie,
    deleteCookie
  };
}
