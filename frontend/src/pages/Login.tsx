import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Bem-vindo ao Oráculo Digital! 🔮');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mystic-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-full mb-4">
            <Sparkles className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-mystic text-mystic-100 mb-2">
            🔮 Oráculo Digital
          </h1>
          <p className="text-mystic-400">
            Conecte-se com o universo místico
          </p>
        </div>

        {/* Login Form */}
        <div className="card">
          <h2 className="text-2xl font-mystic text-center mb-6">Entrar</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-mystic-300 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-mystic-300 text-sm font-medium mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-mystic-400 hover:text-mystic-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-mystic-600"></div>
            <span className="px-4 text-mystic-400 text-sm">ou</span>
            <div className="flex-1 border-t border-mystic-600"></div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-mystic-400 mb-4">
              Não tem uma conta? Comece seu teste grátis!
            </p>
            <Link
              to="/register"
              className="btn-secondary w-full py-3 inline-block text-center"
            >
              Teste Grátis por 3 Dias
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 gap-4 text-center">
          <div className="card">
            <h3 className="text-lg font-mystic text-primary-400 mb-2">
              ✨ Tiragens de Cartas
            </h3>
            <p className="text-mystic-400 text-sm">
              Consulte o tarô com interpretações personalizadas da IA
            </p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-mystic text-primary-400 mb-2">
              🧙 Esmeralda, a Cartomante
            </h3>
            <p className="text-mystic-400 text-sm">
              Chat exclusivo com nossa cartomante virtual mística
            </p>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-mystic text-primary-400 mb-2">
              💰 Apenas R$ 50/mês
            </h3>
            <p className="text-mystic-400 text-sm">
              Após o teste grátis de 3 dias
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 