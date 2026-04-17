import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// Student endpoints (from your original code)
export const studentAPI = {
  getProfile: (id) => api.get(`/students/${id}`),
  updateProfile: (id, data) => api.put(`/students/${id}`, data),
  getAssignment: (id) => api.get(`/students/${id}/assignment`),
  getPayments: (id) => api.get(`/students/${id}/payments`),
  getMaintenanceRequests: (id) => api.get(`/students/${id}/maintenance-requests`),
};

// Room endpoints
export const roomAPI = {
  getAll: (filters) => api.get('/rooms', { params: filters }),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
};

// Application endpoints
export const applicationAPI = {
  getAll: (filters) => api.get('/applications', { params: filters }),
  getStudentApplications: (studentId) => api.get(`/applications/student/${studentId}`),
  submit: (data) => api.post('/applications', data),
  approve: (id, data) => api.put(`/applications/${id}/approve`, data),
  reject: (id, data) => api.put(`/applications/${id}/reject`, data),
};

// Maintenance endpoints
export const maintenanceAPI = {
  getAll: (filters) => api.get('/maintenance-requests', { params: filters }),
  submit: (data) => api.post('/maintenance-requests', data),
  assign: (id, data) => api.put(`/maintenance-requests/${id}/assign`, data),
  updateStatus: (id, data) => api.put(`/maintenance-requests/${id}/status`, data),
};

// Admin endpoints
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllStudents: (filters) => api.get('/admin/students', { params: filters }),
  getOccupancyReport: () => api.get('/admin/reports/occupancy'),
  getPaymentReport: () => api.get('/admin/reports/payments'),
};

export default api;