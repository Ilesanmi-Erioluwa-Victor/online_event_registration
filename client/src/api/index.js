import axiosInstance from './axiosInstance.js';

// Auth API
export const authAPI = {
  login: (data) => axiosInstance.post('/auth/login', data),
  register: (data) => axiosInstance.post('/auth/register', data),
  getMe: () => axiosInstance.get('/auth/me'),
  forgotPassword: (email) => axiosInstance.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => axiosInstance.post(`/auth/reset-password/${token}`, { password }),
};

// Events API
export const eventsAPI = {
  getAll: (params) => axiosInstance.get('/events', { params }),
  getById: (id) => axiosInstance.get(`/events/${id}`),
  getMyEvents: (params) => axiosInstance.get('/events/my-events', { params }),
  getAdminEvents: (params) => axiosInstance.get('/events/admin/all', { params }),
  create: (data) => axiosInstance.post('/events', data),
  update: (id, data) => axiosInstance.put(`/events/${id}`, data),
  publish: (id) => axiosInstance.post(`/events/${id}/publish`),
  cancel: (id, reason) => axiosInstance.post(`/events/${id}/cancel`, { reason }),
  complete: (id) => axiosInstance.post(`/events/${id}/complete`),
  uploadBanner: (id, formData) => axiosInstance.post(`/events/${id}/banner`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => axiosInstance.delete(`/events/${id}`),
};

// Registrations API
export const registrationsAPI = {
  create: (data) => axiosInstance.post('/registrations', data),
  getAll: (params) => axiosInstance.get('/registrations', { params }),
  getMy: (params) => axiosInstance.get('/registrations/my', { params }),
  getById: (id) => axiosInstance.get(`/registrations/${id}`),
  getEventRegistrations: (eventId, params) => axiosInstance.get(`/registrations/event/${eventId}`, { params }),
  cancel: (id, reason) => axiosInstance.post(`/registrations/${id}/cancel`, { reason }),
  markAttendance: (id, attendanceStatus) => axiosInstance.post(`/registrations/${id}/attendance`, { attendanceStatus }),
  bulkAttendance: (eventId, updates) => axiosInstance.post(`/registrations/event/${eventId}/bulk-attendance`, { updates }),
  sendBulkEmail: (eventId, data) => axiosInstance.post(`/registrations/event/${eventId}/send-bulk-email`, data),
  exportRegistrations: (eventId, format) => axiosInstance.get(`/registrations/event/${eventId}/export`, { 
    params: { format },
    responseType: 'blob',
  }),
  exportAttendance: (eventId) => axiosInstance.get(`/registrations/event/${eventId}/attendance-report`, {
    responseType: 'blob',
  }),
  downloadTicket: (id) => axiosInstance.get(`/registrations/${id}/ticket`, { responseType: 'blob' }),
};

// Categories API
export const categoriesAPI = {
  getAll: () => axiosInstance.get('/categories'),
  create: (data) => axiosInstance.post('/categories', data),
  update: (id, data) => axiosInstance.put(`/categories/${id}`, data),
  delete: (id) => axiosInstance.delete(`/categories/${id}`),
};

// Users API
export const usersAPI = {
  getAll: (params) => axiosInstance.get('/users', { params }),
  getById: (id) => axiosInstance.get(`/users/${id}`),
  create: (data) => axiosInstance.post('/users', data),
  update: (id, data) => axiosInstance.put(`/users/${id}`, data),
  delete: (id) => axiosInstance.delete(`/users/${id}`),
  toggleActive: (id) => axiosInstance.patch(`/users/${id}/toggle`),
};

// Reports API
export const reportsAPI = {
  getSystemSummary: () => axiosInstance.get('/reports/summary'),
  getEventSummary: (eventId) => axiosInstance.get(`/reports/event/${eventId}/summary`),
  getRegistrationsByMonth: (months) => axiosInstance.get('/reports/registrations-by-month', { params: { months } }),
  getEventsByCategory: () => axiosInstance.get('/reports/events-by-category'),
  getTopEvents: (limit) => axiosInstance.get('/reports/top-events', { params: { limit } }),
  getOrganizerStats: () => axiosInstance.get('/reports/organizer-stats'),
  exportOverview: () => axiosInstance.get('/reports/export/overview', { responseType: 'blob' }),
  exportEvent: (eventId) => axiosInstance.get(`/reports/export/event/${eventId}`, { responseType: 'blob' }),
};

// Audit API
export const auditAPI = {
  getAll: (params) => axiosInstance.get('/audit', { params }),
};

// Settings API
export const settingsAPI = {
  get: () => axiosInstance.get('/settings'),
  update: (data) => axiosInstance.put('/settings', data),
};

// Public API (no auth required)
export const publicAPI = {
  getStats: () => axiosInstance.get('/public/stats'),
  getEvents: (params) => axiosInstance.get('/public/events', { params }),
  getEventById: (id) => axiosInstance.get(`/public/events/${id}`),
  getOrganizers: (params) => axiosInstance.get('/public/organizers', { params }),
  getOrganizerById: (id) => axiosInstance.get(`/public/organizers/${id}`),
};
