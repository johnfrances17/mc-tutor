// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// API Helper Functions
const api = {
  // Get access token from localStorage
  getToken() {
    return localStorage.getItem('access_token');
  },

  // Set access token
  setToken(token) {
    localStorage.setItem('access_token', token);
  },

  // Remove tokens
  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  // Get stored user
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Set user data
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Make authenticated request
  async request(endpoint, options = {}) {
    const token = this.getToken();
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    // Add authorization header if token exists
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      // Handle 401 Unauthorized - token expired
      if (response.status === 401) {
        this.clearTokens();
        window.location.href = '/client/public/login.html';
        throw new Error('Session expired. Please login again.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  },

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  // Upload file
  async upload(endpoint, formData) {
    const token = this.getToken();
    
    const config = {
      method: 'POST',
      headers: {},
      body: formData,
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (response.status === 401) {
        this.clearTokens();
        window.location.href = '/client/public/login.html';
        throw new Error('Session expired. Please login again.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return data;
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  },

  // Download file
  async download(endpoint, filename) {
    const token = this.getToken();
    
    const config = {
      method: 'GET',
      headers: {},
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download Error:', error);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken();
  },

  // Get user role
  getUserRole() {
    const user = this.getUser();
    return user ? user.role : null;
  },
};

// Export for use in other files
window.api = api;
