/**
 * API Configuration and Request Handler
 * Handles all HTTP requests to the backend API
 */

// Detect environment and set API base URL
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1';

const API_BASE_URL = isLocalhost 
  ? 'http://localhost:3000/api'  // Local development
  : '/api';                        // Production (Vercel)

// Expose to window for system status page
window.API_BASE_URL = API_BASE_URL;

/**
 * Make authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/users/profile')
 * @param {object} options - Fetch options
 * @returns {Promise<object>} Response data
 */
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

/**
 * API Methods
 */
const API = {
  // Authentication
  auth: {
    register: (userData) => apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    
    login: (credentials) => apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
    
    logout: () => apiRequest('/auth/logout', { method: 'POST' }),
    
    getCurrentUser: () => apiRequest('/auth/me'),
    
    refreshToken: (refreshToken) => apiRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    }),
    
    forgotPassword: (data) => apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    
    resetPassword: (data) => apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // Users
  users: {
    getProfile: () => apiRequest('/users/profile'),
    
    updateProfile: (data) => apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    
    changePassword: (passwords) => apiRequest('/users/password', {
      method: 'PUT',
      body: JSON.stringify(passwords)
    }),
    
    uploadProfilePicture: (file) => {
      const formData = new FormData();
      formData.append('profile_picture', file);
      
      return apiRequest('/users/profile/picture', {
        method: 'POST',
        headers: {},
        body: formData
      });
    }
  },

  // Sessions
  sessions: {
    getMySessions: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/sessions${query ? '?' + query : ''}`);
    },
    
    createSession: (sessionData) => apiRequest('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData)
    }),
    
    confirmSession: (id) => apiRequest(`/sessions/${id}/confirm`, {
      method: 'PUT'
    }),
    
    completeSession: (id) => apiRequest(`/sessions/${id}/complete`, {
      method: 'PUT'
    }),
    
    cancelSession: (id, reason) => apiRequest(`/sessions/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    })
  },

  // Tutors
  tutors: {
    search: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/tutors/search${query ? '?' + query : ''}`);
    },
    
    getTutorById: (id) => apiRequest(`/tutors/${id}`),
    
    getTutorSubjects: (id) => apiRequest(`/tutors/${id}/subjects`),
    
    addSubject: (subjectId) => apiRequest('/tutors/subjects', {
      method: 'POST',
      body: JSON.stringify({ subject_id: subjectId })
    }),
    
    removeSubject: (subjectId) => apiRequest(`/tutors/subjects/${subjectId}`, {
      method: 'DELETE'
    })
  },

  // Subjects
  subjects: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/subjects${query ? '?' + query : ''}`);
    },
    
    getById: (id) => apiRequest(`/subjects/${id}`),
    
    getByCourse: (course) => apiRequest(`/subjects/course/${course}`),
    
    getCourses: () => apiRequest('/subjects/courses')
  },

  // Materials
  materials: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/materials${query ? '?' + query : ''}`);
    },
    
    upload: (file, metadata) => {
      const formData = new FormData();
      formData.append('file', file);
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });
      
      return apiRequest('/materials/upload', {
        method: 'POST',
        headers: {},
        body: formData
      });
    },
    
    download: (id, params) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/materials/${id}/download${query ? '?' + query : ''}`);
    },
    
    delete: (id, subjectId) => apiRequest(`/materials/${id}?subject_id=${subjectId}`, {
      method: 'DELETE'
    })
  },

  // Feedback
  feedback: {
    submit: (feedbackData) => apiRequest('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData)
    }),
    
    getMy: () => apiRequest('/feedback/my'),
    
    getReceived: () => apiRequest('/feedback/received'),
    
    getForTutor: (tutorId) => apiRequest(`/feedback/tutor/${tutorId}`)
  },

  // Chat
  chat: {
    getConversations: () => apiRequest('/chat/conversations'),
    
    getMessages: (otherStudentId) => apiRequest(`/chat/messages/${otherStudentId}`),
    
    sendMessage: (receiverStudentId, message) => apiRequest('/chat/send', {
      method: 'POST',
      body: JSON.stringify({
        receiver_student_id: receiverStudentId,
        message
      })
    }),
    
    markAsRead: (otherStudentId) => apiRequest(`/chat/mark-read/${otherStudentId}`, {
      method: 'PUT'
    }),
    
    getUnreadCount: (otherStudentId) => apiRequest(`/chat/unread/${otherStudentId}`)
  },

  // Notifications
  notifications: {
    getAll: (unreadOnly = false) => {
      const query = unreadOnly ? '?unread_only=true' : '';
      return apiRequest(`/notifications${query}`);
    },
    
    getUnreadCount: () => apiRequest('/notifications/unread/count'),
    
    markAsRead: (id) => apiRequest(`/notifications/${id}/read`, {
      method: 'PUT'
    }),
    
    markAllAsRead: () => apiRequest('/notifications/read-all', {
      method: 'PUT'
    }),
    
    delete: (id) => apiRequest(`/notifications/${id}`, {
      method: 'DELETE'
    }),
    
    deleteAll: () => apiRequest('/notifications', {
      method: 'DELETE'
    })
  },

  // Admin
  admin: {
    getAllUsers: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return apiRequest(`/admin/users${query ? '?' + query : ''}`);
    },
    
    getUserById: (id) => apiRequest(`/admin/users/${id}`),
    
    createUser: (userData) => apiRequest('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    }),
    
    updateUser: (id, userData) => apiRequest(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    }),
    
    deleteUser: (id, permanent = false) => {
      const query = permanent ? '?permanent=true' : '';
      return apiRequest(`/admin/users/${id}${query}`, {
        method: 'DELETE'
      });
    },
    
    resetPassword: (id, newPassword) => apiRequest(`/admin/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ new_password: newPassword })
    }),
    
    createSubject: (subjectData) => apiRequest('/admin/subjects', {
      method: 'POST',
      body: JSON.stringify(subjectData)
    }),
    
    updateSubject: (id, subjectData) => apiRequest(`/admin/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subjectData)
    }),
    
    deleteSubject: (id) => apiRequest(`/admin/subjects/${id}`, {
      method: 'DELETE'
    }),
    
    getStats: () => apiRequest('/admin/stats'),
    
    getActivity: (limit = 20) => apiRequest(`/admin/activity?limit=${limit}`)
  }
};

// Export API_BASE_URL and API for use in other scripts
if (typeof window !== 'undefined') {
  window.API_BASE_URL = API_BASE_URL;
  window.API = API;
}
