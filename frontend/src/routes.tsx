import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';

// Componente provisório para o Dashboard só para testarmos a navegação
function Dashboard() {
  return <div className="p-8 text-2xl font-bold">Bem-vindo ao Dashboard!</div>;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Se acessar uma rota que não existe, manda de volta pro Login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}