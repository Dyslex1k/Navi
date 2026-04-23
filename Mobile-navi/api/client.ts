import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://192.168.0.110:8000/map',
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'API Error';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;