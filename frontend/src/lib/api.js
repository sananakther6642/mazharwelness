import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login/register page
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleAuth: (sessionId) => api.post('/auth/google/session', { session_id: sessionId }),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

// Client APIs
export const clientAPI = {
  registerParent: (data) => api.post('/clients/register/parent', data),
  registerWoman: (data) => api.post('/clients/register/woman', data),
  getProfile: () => api.get('/clients/profile'),
  getAll: (search) => api.get('/clients', { params: { search } }),
};

// Guest Booking APIs
export const guestAPI = {
  createBooking: (data) => api.post('/guest/booking', data),
  getBookings: (status) => api.get('/guest/bookings', { params: { status } }),
  updateBooking: (bookingId, status, notes) => 
    api.put(`/guest/bookings/${bookingId}`, null, { params: { status, notes } }),
};

// Service APIs
export const serviceAPI = {
  getAll: (category) => api.get('/services', { params: { category } }),
  create: (data) => api.post('/services', data),
  update: (serviceId, data) => api.put(`/services/${serviceId}`, data),
};

// Package APIs
export const packageAPI = {
  getAll: () => api.get('/packages'),
  create: (data) => api.post('/packages', data),
};

// Appointment APIs
export const appointmentAPI = {
  create: (data) => api.post('/appointments', data),
  getAll: (params) => api.get('/appointments', { params }),
  updateStatus: (appointmentId, status) => 
    api.put(`/appointments/${appointmentId}/status`, null, { params: { status } }),
};

// Staff APIs
export const staffAPI = {
  getAll: (role) => api.get('/staff', { params: { role } }),
  getAvailable: (serviceCategory) => api.get('/staff/available', { params: { service_category: serviceCategory } }),
  create: (data) => api.post('/staff', data),
};

// Exercise APIs
// src/lib/api.js (or wherever exerciseAPI is)
export const exerciseAPI = {
  list: () => api.get("/exercises"),
  create: (payload) => api.post("/exercises", payload),

  update: (exercise_id, payload) => api.put(`/exercises/${exercise_id}`, payload),
  remove: (exercise_id) => api.delete(`/exercises/${exercise_id}`),
};


// Diet Plan APIs
export const dietPlanAPI = {
  getAll: (clientId) => api.get('/diet-plans', { params: { client_id: clientId } }),
  create: (data) => api.post('/diet-plans', data),
};

// Workout Plan APIs
export const workoutPlanAPI = {
  getAll: (clientId) => api.get('/workout-plans', { params: { client_id: clientId } }),
  create: (data) => api.post('/workout-plans', data),
};

// Assessment APIs
export const assessmentAPI = {
  getByClient: (clientId) => api.get(`/assessments/${clientId}`),
  create: (data) => api.post('/assessments', data),
};

// Treatment Plan APIs
export const treatmentPlanAPI = {
  getByClient: (clientId) => api.get(`/treatment-plans/${clientId}`),
  create: (data) => api.post('/treatment-plans', data),
};

// Progress APIs
export const progressAPI = {
  record: (clientId, metricType, value, unit, notes) => 
    api.post('/progress', null, { params: { client_id: clientId, metric_type: metricType, value, unit, notes } }),
  getByClient: (clientId, metricType) => 
    api.get(`/progress/${clientId}`, { params: { metric_type: metricType } }),
};

// Invoice APIs
export const invoiceAPI = {
  getAll: (params) => api.get('/invoices', { params }),
  create: (data) => api.post('/invoices', data),
};

// Website Content APIs
export const contentAPI = {
  getTestimonials: () => api.get('/testimonials'),
  createTestimonial: (data) => api.post('/testimonials', null, { params: data }),
  getFAQs: (category) => api.get('/faqs', { params: { category } }),
  getGallery: (category) => api.get('/gallery', { params: { category } }),
};

// Notification APIs
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
