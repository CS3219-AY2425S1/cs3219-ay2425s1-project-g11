import { getCookie } from '@/lib/utils';
import axios from 'axios';

const axiosQuestionClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_QUESTION_SERVICE_URL ||
    'http://localhost:4001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

const axiosAuthClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_USER_SERVICE_URL || 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for authorisation token
axiosQuestionClient.interceptors.request.use(
  (config) => {
    const token = getCookie('access-token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosAuthClient.interceptors.request.use(
  (config) => {
    const token = getCookie('access-token');
    console.log('token', token);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// // TODO: Add response interceptors as needed
// axiosClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     let res = error.response;
//     if (res && res.status == 401) {
//       // TODO: Handle unauthorised error
//     }
//     return Promise.reject(error);
//   },
// );

export { axiosQuestionClient, axiosAuthClient };
