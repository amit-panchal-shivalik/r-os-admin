import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://68250aac2d6f.ngrok-free.app/';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Fetch job titles
export const fetchJobTitles = async () => {
  const res = await api.get('/job-titles');
  return res.data.data.map((item: any) => ({
    value: item.job_title_id,
    label: item.job_title,
  }));
};

// Fetch interested localities
export const fetchLocalities = async () => {
  const res = await api.get('/locality');
  return res.data.data.map((item: any) => ({
    value: item.locality_id,
    label: item.locality_name,
  }));
};

// Fetch interested categories
export const fetchCategories = async () => {
  const res = await api.get('/category');
  return res.data.data.map((item: any) => ({
    value: item.category_id,
    label: item.category_name,
  }));
};

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;

