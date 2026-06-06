import axios from 'axios';

const PUBLIC_PATHS = ['/', '/events', '/organizers'];
const PUBLIC_PREFIXES = ['/events/', '/organizers/'];

const isPublicPath = (path) => {
  if (PUBLIC_PATHS.includes(path)) return true;
  return PUBLIC_PREFIXES.some((p) => path.startsWith(p));
};

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = !!localStorage.getItem('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (hadToken && !isPublicPath(window.location.pathname) && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
