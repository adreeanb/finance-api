import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 1. Importamos o QueryClient e o QueryClientProvider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 2. Criamos uma instância do QueryClient
const queryClient = new QueryClient();

// O aviso do createRoot também será resolvido garantindo que ele só é chamado uma vez aqui
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 3. Abraçamos o App com o Provider, passando o client criado */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);