// Authentication functions
const auth = {
  // Register new user
  async register(formData) {
    try {
      const response = await api.post('/auth/register', formData);
      
      if (response.success) {
        // Auto-login after registration
        if (response.access_token) {
          api.setToken(response.access_token);
          if (response.refresh_token) {
            localStorage.setItem('refresh_token', response.refresh_token);
          }
          if (response.user) {
            api.setUser(response.user);
          }
        }
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Login
  async login(studentId, password) {
    try {
      const response = await api.post('/auth/login', {
        student_id: studentId,
        password: password,
      });

      if (response.success) {
        api.setToken(response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        api.setUser(response.user);
      }

      return response;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      api.clearTokens();
      window.location.href = '/client/public/login.html';
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      if (response.success && response.user) {
        api.setUser(response.user);
        return response.user;
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Redirect to appropriate dashboard
  redirectToDashboard(role) {
    const dashboards = {
      admin: '/client/public/admin/dashboard.html',
      tutor: '/client/public/tutor/dashboard.html',
      tutee: '/client/public/student/dashboard.html',
    };

    window.location.href = dashboards[role] || '/client/public/index.html';
  },

  // Check authentication and redirect if needed
  requireAuth(requiredRole = null) {
    if (!api.isAuthenticated()) {
      window.location.href = '/client/public/login.html';
      return false;
    }

    const userRole = api.getUserRole();
    
    if (requiredRole && userRole !== requiredRole) {
      alert('Access denied. Insufficient permissions.');
      auth.redirectToDashboard(userRole);
      return false;
    }

    return true;
  },
};

// Export for use in other files
window.auth = auth;
