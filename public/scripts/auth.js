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

function clearAllCookies() {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Strict';
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
  }
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
 * Update last activity timestamp (for session timeout)
 */
function updateLastActivity() {
  localStorage.setItem('lastActivity', Date.now().toString());
}

/**
 * Check if session has expired (1 day = 24 hours inactivity)
 * @returns {boolean}
 */
function checkSessionTimeout() {
  const lastActivity = localStorage.getItem('lastActivity');
  if (!lastActivity) return false;
  
  const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
  
  return timeSinceLastActivity > ONE_DAY_MS;
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
  
  // Update last activity timestamp
  updateLastActivity();
  
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
  // Set logout flag for multi-tab sync BEFORE clearing
  localStorage.setItem('logoutFlag', Date.now().toString());
  
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('lastActivity');
  
  // Clear cookies
  deleteCookie('token');
  deleteCookie('refreshToken');
  deleteCookie('user');
  
  // Clear all cookies as fallback
  clearAllCookies();
}

/**
 * Redirect to login if not authenticated
 */
function requireAuth() {
  if (!isLoggedIn()) {
    // Redirect to homepage instead of login for better UX
    window.location.href = '/html/index.html';
    return false;
  }
  return true;
}

/**
 * Check authentication and redirect appropriately
 * Call this on protected pages
 */
function checkAuthOrRedirect() {
  const path = window.location.pathname;
  const isPublicPage = path.includes('/index.html') || 
                       path.includes('/login.html') || 
                       path.includes('/register.html') ||
                       path.includes('/admin-login.html') ||
                       path.includes('/forgot-password.html') ||
                       path.includes('/reset-password.html');
  
  // If on protected page and not logged in, redirect to homepage
  if (!isPublicPage && !isLoggedIn()) {
    console.warn('No authentication found. Redirecting to homepage...');
    window.location.href = '/html/index.html';
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
    admin: '/html/admin/admin-dashboard.html',
    tutor: '/html/tutor/tutor-dashboard.html',
    tutee: '/html/tutee/student-dashboard.html'
  };
  
  const dashboard = dashboards[role] || '/html/tutee/student-dashboard.html';
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
    // Call logout API to clear server-side session/cookies
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || getCookie('token')}`
      },
      credentials: 'include' // Important: send cookies with request
    });
    
    if (!response.ok) {
      console.warn('Logout API call failed, clearing session anyway');
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearSession();
    // Redirect to login page
    window.location.replace('/html/auth/login.html?logout=true');
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
  
  // Check session timeout (1 day inactivity)
  if (isLoggedIn() && checkSessionTimeout()) {
    console.warn('Session expired due to inactivity');
    clearSession();
    if (!isAuthPage) {
      window.location.href = '/html/auth/login.html?timeout=true';
      return;
    }
  }
  
  // If logged in and on auth page, redirect to dashboard
  if (isLoggedIn() && isAuthPage) {
    const user = getCurrentUser();
    if (user) {
      redirectToDashboard(user.role);
    }
  }
  
  // Update activity timestamp on page load if logged in
  if (isLoggedIn()) {
    updateLastActivity();
  }
  
  // Track user activity (update timestamp on navigation)
  if (isLoggedIn()) {
    // Update activity every 5 minutes if user is active
    setInterval(() => {
      if (isLoggedIn()) {
        updateLastActivity();
      }
    }, 5 * 60 * 1000); // 5 minutes
  }
  
  // Multi-tab logout sync: listen for storage changes
  window.addEventListener('storage', (e) => {
    // If logout flag changed or token removed in another tab
    if (e.key === 'logoutFlag' || (e.key === 'token' && !e.newValue)) {
      console.log('Logout detected in another tab, syncing...');
      // Clear session without API call (already done in other tab)
      localStorage.clear();
      sessionStorage.clear();
      clearAllCookies();
      // Redirect to login
      window.location.replace('/html/auth/login.html?logout=true');
    }
  });
  
  // Setup logout buttons
  const logoutButtons = document.querySelectorAll('[data-logout], .logout-btn, #logoutBtn, #logoutBtn2');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
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
    checkAuthOrRedirect,
    requireRole,
    hasRole,
    redirectToDashboard,
    handleLogin,
    handleLogout,
    logout: handleLogout, // Export as both names for compatibility
    handleRegister,
    updateLastActivity,
    checkSessionTimeout,
    // Export cookie helpers
    setCookie,
    getCookie,
    deleteCookie,
    clearAllCookies
  };
}
