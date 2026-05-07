import axios from 'axios';
import { store } from '../store';
import { refreshTokenThunk, clearCredentials } from '../store/slices/authSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Crucial for sending/receiving HttpOnly cookies
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth.accessToken;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401s & Refresh Flow
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh
        await store.dispatch(refreshTokenThunk()).unwrap();
        
        // Grab new token and retry request
        const newToken = store.getState().auth.accessToken;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed (cookie expired/invalid)
        store.dispatch(clearCredentials());
        
        // Optionally redirect to login, handled nicely by our PrivateRoute
        // window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
