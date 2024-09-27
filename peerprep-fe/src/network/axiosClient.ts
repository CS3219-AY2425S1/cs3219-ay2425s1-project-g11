import axios from 'axios';
// import { store } from "@/redux/store";

// const getToken = () => {
//   const state = store.getState();
//   return state.auth.token;
// };

const axiosQuestionClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_QUESTION_SERVICE_URL ||
    'http://localhost:4000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// // Interceptor for authorisation token
// axiosClient.interceptors.request.use(
//   (config) => {
//     const token = getToken();
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error),
// );

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

export default axiosQuestionClient;
