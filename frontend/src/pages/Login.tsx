import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wallet } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
// 1. Importamos o nosso hook customizado
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

// Criamos o "Schema" de validação com Zod
const loginSchema = z.object({
  email: z.string().email('Digite um e-mail válido.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

// Tipagem inferida automaticamente pelo Zod
type LoginFormInputs = z.infer<typeof loginSchema>;

export function Login() {
  
  const navigate = useNavigate();

  useEffect(() => {
    // Se bater na tela de login e já tiver token, joga pro dashboard
    const token = localStorage.getItem('FinanceApp:token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  // 2. Extraímos a função signIn do contexto
  const { signIn } = useAuth();

  // Função que será chamada ao enviar o formulário válido
  async function handleLogin(data: LoginFormInputs) {
    try {
      // 3. Agora delegamos a lógica pesada para o Contexto
      await signIn({
        email: data.email,
        password: data.password,
      });

      // Redireciona o usuário para o Dashboard
      navigate('/dashboard');
      
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert('Credenciais inválidas ou erro no servidor!');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        
        {/* Cabeçalho do Login */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Wallet className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Acesse sua conta</h1>
          <p className="text-gray-500 mt-2">Gerencie suas finanças com facilidade</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
          
          {/* Input E-mail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              {...register('email')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-colors"
              placeholder="seu@email.com"
            />
            {errors.email && <span className="text-red-500 text-sm mt-1">{errors.email.message}</span>}
          </div>

          {/* Input Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              {...register('password')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-colors"
              placeholder="••••••••"
            />
            {errors.password && <span className="text-red-500 text-sm mt-1">{errors.password.message}</span>}
          </div>

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-70 mt-4"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

      </div>
    </div>
  );
}