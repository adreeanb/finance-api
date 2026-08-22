import axios from 'axios';

// Cria a instância do Axios com o endereço do seu backend Node
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Mude a porta se o seu backend estiver usando outra
});

// Interceptor: Tudo o que sair do frontend para a API passa por aqui antes
api.interceptors.request.use((config) => {
  // Busca o token que salvaremos no Local Storage ao fazer login
  const token = localStorage.getItem('@FinanceWeb:token');

  // Se o token existir, injeta ele no cabeçalho de Autorização
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});