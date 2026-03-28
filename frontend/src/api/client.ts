import axios from 'axios';

const API_BASE = '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default client;

// ===== AUTH =====
export const authAPI = {
  login: (email: string, password: string) =>
    client.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; name: string; role: string }) =>
    client.post('/auth/register', data),
};

// ===== DASHBOARD =====
export const dashboardAPI = {
  admin: () => client.get('/dashboard/admin'),
  teacher: () => client.get('/dashboard/teacher'),
  student: () => client.get('/dashboard/student'),
  counsellor: () => client.get('/dashboard/counsellor'),
};

// ===== STUDENTS =====
export const studentsAPI = {
  list: (params?: Record<string, string | number>) =>
    client.get('/students/', { params }),
  get: (studentId: string) => client.get(`/students/${studentId}`),
  count: () => client.get('/students/count'),
};

// ===== PREDICTIONS =====
export const predictionsAPI = {
  runAll: () => client.post('/predictions/run-all'),
  runSingle: (studentId: string) => client.post(`/predictions/run/${studentId}`),
};

// ===== INTERVENTIONS =====
export const interventionsAPI = {
  list: (studentId?: string) =>
    client.get('/interventions/', { params: studentId ? { student_id: studentId } : {} }),
  create: (data: { student_id: string; intervention_type: string; notes: string }) =>
    client.post('/interventions/', data),
  update: (id: string, data: { status?: string; notes?: string }) =>
    client.patch(`/interventions/${id}`, data),
};
