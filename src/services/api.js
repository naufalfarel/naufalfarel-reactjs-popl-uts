import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getCurrentUser: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
  changePassword: (data) => api.put("/auth/change-password", data),
};

// Obat Services
export const obatService = {
  create: (formData) =>
    api.post("/obat", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getAll: (params) => api.get("/obat", { params }),
  getById: (id) => api.get(`/obat/${id}`),
  update: (id, formData) =>
    api.put(`/obat/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/obat/${id}`),
};

// Notification Services
export const notificationService = {
  getAll: (params) => api.get("/notifications", { params }),
  getToday: () => api.get("/notifications/today"),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  getHistory: (params) => api.get("/notifications/history", { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAsTaken: (id) => api.put(`/notifications/${id}/taken`),
  dismiss: (id) => api.put(`/notifications/${id}/dismiss`),
  markAllAsRead: () => api.put("/notifications/mark-all-read"),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Progres Services
export const progresService = {
  create: (formData) =>
    api.post("/progres", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getAll: (params) => api.get("/progres", { params }),
  getStats: (params) => api.get("/progres/stats", { params }),
  getById: (id) => api.get(`/progres/${id}`),
  update: (id, formData) =>
    api.put(`/progres/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/progres/${id}`),
};

// Kunjungan Services
export const kunjunganService = {
  create: (data) => api.post("/kunjungan", data),
  getAll: (params) => api.get("/kunjungan", { params }),
  getUpcoming: () => api.get("/kunjungan/upcoming"),
  getById: (id) => api.get(`/kunjungan/${id}`),
  update: (id, data) => api.put(`/kunjungan/${id}`, data),
  updateHasil: (id, data) => api.put(`/kunjungan/${id}/hasil`, data),
  delete: (id) => api.delete(`/kunjungan/${id}`),
};

// Edukasi Services
export const edukasiService = {
  getAll: (params) => api.get("/edukasi", { params }),
  getPopular: (params) => api.get("/edukasi/popular", { params }),
  getByKategori: (kategori) => api.get(`/edukasi/kategori/${kategori}`),
  getById: (id) => api.get(`/edukasi/${id}`),
  seed: (force = false) => {
    if (force) {
      return api.post("/edukasi/seed?force=true");
    }
    return api.post("/edukasi/seed");
  },
};

// Family Services
export const familyService = {
  add: (data) => api.post("/family", data),
  getAll: () => api.get("/family"),
  update: (id, data) => api.put(`/family/${id}`, data),
  delete: (id) => api.delete(`/family/${id}`),
  getPatientProgress: (patientId) =>
    api.get(`/family/patient/${patientId}/progress`),
};

export default api;
