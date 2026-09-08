import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Ye "interceptor" hai - har request jaane se PEHLE ye function chalega
// Isका kaam: agar token localStorage mein hai, usse automatically
// har request ke header mein jod dena - taaki har jagah manually na likhna pade
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;