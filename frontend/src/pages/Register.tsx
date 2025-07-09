import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    sign: '',
    age: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const signs = [
    'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem',
    'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (parseInt(formData.age) < 18) {
      toast.error('Você deve ter pelo menos 18 anos');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        sign: formData.sign,
        age: parseInt(formData.age)
      });
      
      toast.success('Conta criada com sucesso! Bem-vindo ao Oráculo Digital! 🔮');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Erro ao criar conta. Tente novamente.');
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
            Comece sua jornada mística
          </p>
        </div>

        {/* Register Form */}
        <div className="card">
          <h2 className="text-2xl font-mystic text-center mb-6">Teste Grátis</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-mystic-300 text-sm font-medium mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="Seu nome"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-mystic-300 text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="sign" className="block text-mystic-300 text-sm font-medium mb-2">
                  Signo
                </label>
                <select
                  id="sign"
                  name="sign"
                  value={formData.sign}
                  onChange={handleChange}
                  className="input-field w-full"
                  required
                >
                  <option value="">Selecione</option>
                  {signs.map(sign => (
                    <option key={sign} value={sign}>{sign}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="age" className="block text-mystic-300 text-sm font-medium mb-2">
                  Idade
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="input-field w-full"
                  placeholder="25"
                  min="18"
                  max="120"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-mystic-300 text-sm font-medium mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field w-full pr-12"
                  placeholder="••••••••"
                  minLength={6}
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

            <div>
              <label htmlFor="confirmPassword" className="block text-mystic-300 text-sm font-medium mb-2">
                Confirmar Senha
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando conta...' : 'Começar Teste Grátis'}
            </button>
          </form>

          {/* Trial Info */}
          <div className="mt-6 p-4 bg-primary-900/20 border border-primary-700 rounded-lg">
            <h3 className="text-primary-400 font-medium mb-2">✨ Teste Grátis de 3 Dias</h3>
            <p className="text-mystic-400 text-sm">
              Acesse todas as funcionalidades por 3 dias sem compromisso. 
              Após o período, assine por apenas R$ 50/mês.
            </p>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-mystic-400">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 