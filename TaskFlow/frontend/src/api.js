import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    return api.post('/login', formData);
  },
  signup: (data) => api.post('/signup', data),
  getMe: () => api.get('/users/me'),
  getUsers: () => api.get('/users'),
};

export const projectAPI = {
  getProjects: () => api.get('/projects'),
  getProject: (projectId) => api.get(`/projects/${projectId}`),
  createProject: (data) => api.post('/projects', data),
  updateProject: (projectId, data) => api.put(`/projects/${projectId}`, data),
  deleteProject: (projectId) => api.delete(`/projects/${projectId}`),
  addMember: (projectId, email) => api.post(`/projects/${projectId}/members`, { email }),
};

export const taskAPI = {
  getTasks: (projectId, params) => api.get(`/projects/${projectId}/tasks`, { params }),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (taskId, data) => api.put(`/tasks/${taskId}`, data),
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
};

export default api;
