/**
 * Authentication Helper Functions - Clean Version
 */

function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function getCurrentUserSync() {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    return null;
  }
}

async function getCurrentUser() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const response = await window.API.auth.getCurrentUser();
    
    if (response.success && response.data?.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data.user;
    } else {
      clearSession();
      return null;
    }
  } catch (error) {
    clearSession();
    return null;
  }
}

function saveSession(data) {
  localStorage.setItem('token', data.token);
  if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
  if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

function redirectToDashboard(role) {
  const dashboards = {
    admin: '/html/admin/admin-dashboard.html',
    tutor: '/html/tutor/tutor-dashboard.html',
    tutee: '/html/tutee/student-dashboard.html'
  };
  window.location.href = dashboards[role] || '/html/tutee/student-dashboard.html';
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = '/html/auth/login.html';
    return false;
  }
  return true;
}

function hasRole(allowedRoles) {
  const user = getCurrentUserSync();
  if (!user) return false;
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(user.role);
}

async function requireRole(allowedRoles) {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = '/html/auth/login.html';
    return false;
  }
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!roles.includes(user.role)) {
    alert('You do not have permission to access this page');
    redirectToDashboard(user.role);
    return false;
  }
  return true;
}

async function handleLogin(event) {
  event.preventDefault();
  const form = event.target;
  const email = form.email.value.trim();
  const password = form.password.value;
  const role = form.role?.value || 'tutee';
  
  try {
    const response = await window.API.auth.login({ email, password, role });
    if (response.success) {
      saveSession(response.data);
      redirectToDashboard(response.data.user.role);
    } else {
      alert(response.message || 'Login failed');
    }
  } catch (error) {
    alert(error.message || 'Login failed');
  }
}

async function handleLogout() {
  try {
    await window.API.auth.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearSession();
    window.location.replace('/html/auth/login.html');
  }
}

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
  
  if (formData.password !== formData.confirmPassword) {
    alert('Passwords do not match');
    return;
  }
  
  try {
    const response = await window.API.auth.register(formData);
    if (response.success) {
      alert('Registration successful! Please login.');
      window.location.href = '/html/auth/login.html';
    } else {
      alert(response.message || 'Registration failed');
    }
  } catch (error) {
    alert(error.message || 'Registration failed');
  }
}

async function initAuth() {
  document.querySelectorAll('[data-logout], .logout-btn, #logoutBtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  });
  
  const user = getCurrentUserSync();
  if (user) {
    document.querySelectorAll('[data-user-name]').forEach(el => {
      el.textContent = user.fullName || user.full_name || 'User';
    });
    document.querySelectorAll('[data-user-role]').forEach(el => {
      el.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    });
  }
}

if (typeof window !== 'undefined') {
  window.auth = {
    isLoggedIn,
    getCurrentUser,
    getCurrentUserSync,
    hasRole,
    saveSession,
    clearSession,
    requireAuth,
    requireRole,
    redirectToDashboard,
    handleLogin,
    handleLogout,
    handleRegister,
    initAuth
  };
}
