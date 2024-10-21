import { getCookie } from '@/lib/utils';
import axios from 'axios';

const API_GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8001';

const axiosClient = axios.create({
  baseURL: `${API_GATEWAY_URL}/api`,
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

const axoisMatchingClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_MATCHING_SERVICE_URL ||
    'http://localhost:5001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

axoisMatchingClient.interceptors.request.use(
  (config) => {
    const token = getCookie('access-token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export { axiosClient, axoisMatchingClient };
