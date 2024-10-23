import { getCookie } from '@/lib/utils';
import axios from 'axios';

const API_GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8001';

const axiosClient = axios.create({
  baseURL: `${API_GATEWAY_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for authorization token
axiosClient.interceptors.request.use(
  (config) => {
    const token = getCookie('access-token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export { axiosClient };
