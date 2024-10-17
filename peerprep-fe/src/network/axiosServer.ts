'use server';
import axios from 'axios';
import { cookies } from 'next/headers';

const axiosQuestionServer = axios.create({
  baseURL: process.env.QUESTION_SERVICE_URL || 'http://172.17.0.1:4001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

const axiosAuthServer = axios.create({
  baseURL: process.env.AUTH_SERVICE_URL || 'http://172.17.0.1:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for authorisation token
axiosQuestionServer.interceptors.request.use(
  (config) => {
    const token = cookies().get('access-token')?.value;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosAuthServer.interceptors.request.use(
  (config) => {
    const token = cookies().get('access-token')?.value;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export { axiosQuestionServer, axiosAuthServer };
