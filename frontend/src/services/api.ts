import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
});

api.interceptors.request.use((config) => {
 
  const token = localStorage.getItem('@FinanceApp:token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

//Analisa a resposta do backend
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o backend disser que o token expirou (401), derruba a sessão
    if (error.response?.status === 401) {
      localStorage.removeItem('@FinanceApp:token');
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);