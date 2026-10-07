import axios from 'axios';

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.MODE === 'production') {
    console.error("CRITICAL: VITE_API_URL environment variable is not defined for production build!");
  }
  return 'http://localhost:8000/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 60000, // 60 seconds timeout to accommodate Render free tier cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Bearer JWT Token & dispatch slow request event
api.interceptors.request.use(
  (config) => {
    window.dispatchEvent(new Event('qs-api-request-start'));
    const token = localStorage.getItem('quickservice_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    window.dispatchEvent(new Event('qs-api-request-end'));
    return Promise.reject(error);
  }
);

// Response Interceptor: Dispatch request-end event & handle 401
api.interceptors.response.use(
  (response) => {
    window.dispatchEvent(new Event('qs-api-request-end'));
    return response;
  },
  (error) => {
    window.dispatchEvent(new Event('qs-api-request-end'));
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        localStorage.removeItem('quickservice_token');
        localStorage.removeItem('quickservice_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
