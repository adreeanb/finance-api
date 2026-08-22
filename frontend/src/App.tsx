import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions'; // Nova página de transações
import { Installments } from './pages/Installments'; // Nova página de parcelamentos
import { UserSettings } from './pages/UserSettings'; // Nova página de configurações do usuário
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { FixedExpenses } from './pages/FixedExpenses';

// Layout que exibe a Navbar em cima e o conteúdo da página embaixo
function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Outlet /> {/* Aqui vai renderizar a página da rota atual */}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />

          {/* Rotas protegidas que possuem a Navbar */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/installments" element={<Installments />} />
            <Route path="/fixed-expenses" element={<FixedExpenses />} />
            <Route path="/userSettings" element={<UserSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}