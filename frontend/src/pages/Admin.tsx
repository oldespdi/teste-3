import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Eye,
  Crown,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { User, AdminStats } from '../types';

const Admin = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    trialUsers: 0,
    totalReadings: 0,
    totalChats: 0,
    revenue: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se é admin
    if (user?.email !== 'admin@oraculo.com') {
      return;
    }

    // Simular carregamento de dados
    const mockStats: AdminStats = {
      totalUsers: 156,
      activeSubscriptions: 89,
      trialUsers: 67,
      totalReadings: 1247,
      totalChats: 892,
      revenue: 4450
    };

    const mockUsers: User[] = [
      {
        id: '1',
        name: 'Maria Silva',
        email: 'maria@email.com',
        sign: 'Câncer',
        age: 28,
        subscription: {
          status: 'active',
          plan: 'monthly',
          expiresAt: new Date(Date.now() + 86400000 * 15).toISOString()
        },
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
      },
      {
        id: '2',
        name: 'João Santos',
        email: 'joao@email.com',
        sign: 'Leão',
        age: 35,
        subscription: {
          status: 'trial',
          plan: 'trial',
          trialEndsAt: new Date(Date.now() + 86400000 * 2).toISOString()
        },
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
      },
      {
        id: '3',
        name: 'Ana Costa',
        email: 'ana@email.com',
        sign: 'Libra',
        age: 24,
        subscription: {
          status: 'expired',
          plan: 'monthly',
          expiresAt: new Date(Date.now() - 86400000 * 5).toISOString()
        },
        createdAt: new Date(Date.now() - 86400000 * 45).toISOString()
      }
    ];

    setStats(mockStats);
    setUsers(mockUsers);
    setLoading(false);
  }, [user]);

  if (user?.email !== 'admin@oraculo.com') {
    return (
      <div className="p-6">
        <div className="card text-center py-12">
          <AlertTriangle className="mx-auto text-red-400 mb-4" size={48} />
          <h2 className="text-xl font-mystic text-mystic-100 mb-2">
            Acesso Negado
          </h2>
          <p className="text-mystic-400">
            Você não tem permissão para acessar esta área.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="card text-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-mystic-400">Carregando dados administrativos...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded-full flex items-center space-x-1">
            <CheckCircle size={12} />
            <span>Ativo</span>
          </span>
        );
      case 'trial':
        return (
          <span className="px-2 py-1 bg-gold-900 text-gold-300 text-xs rounded-full flex items-center space-x-1">
            <Crown size={12} />
            <span>Teste</span>
          </span>
        );
      case 'expired':
        return (
          <span className="px-2 py-1 bg-red-900 text-red-300 text-xs rounded-full flex items-center space-x-1">
            <XCircle size={12} />
            <span>Expirado</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-mystic-700 text-mystic-300 text-xs rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-mystic text-mystic-100">
          🛡️ Painel Administrativo
        </h1>
        <div className="text-right">
          <p className="text-mystic-400 text-sm">Admin</p>
          <p className="text-primary-400 font-medium">{user?.name}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <p className="text-mystic-400 text-sm">Total de Usuários</p>
              <p className="text-2xl font-mystic text-mystic-100">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-white" size={24} />
            </div>
            <div>
              <p className="text-mystic-400 text-sm">Assinantes Ativos</p>
              <p className="text-2xl font-mystic text-mystic-100">{stats.activeSubscriptions}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gold-600 rounded-lg flex items-center justify-center">
              <Crown className="text-white" size={24} />
            </div>
            <div>
              <p className="text-mystic-400 text-sm">Usuários em Teste</p>
              <p className="text-2xl font-mystic text-mystic-100">{stats.trialUsers}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <DollarSign className="text-white" size={24} />
            </div>
            <div>
              <p className="text-mystic-400 text-sm">Receita Mensal</p>
              <p className="text-2xl font-mystic text-mystic-100">R$ {stats.revenue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-mystic text-mystic-100 mb-4">Atividade do Sistema</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-mystic-400">Total de Tiragens</span>
              <span className="text-primary-400 font-medium">{stats.totalReadings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-mystic-400">Total de Chats</span>
              <span className="text-gold-400 font-medium">{stats.totalChats}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-mystic-400">Taxa de Conversão</span>
              <span className="text-green-400 font-medium">
                {Math.round((stats.activeSubscriptions / stats.totalUsers) * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-mystic text-mystic-100 mb-4">Resumo Financeiro</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-mystic-400">Assinaturas Ativas</span>
              <span className="text-green-400 font-medium">{stats.activeSubscriptions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-mystic-400">Valor por Assinatura</span>
              <span className="text-mystic-100">R$ 50,00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-mystic-400">Receita Total</span>
              <span className="text-primary-400 font-medium">R$ {stats.revenue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-mystic text-mystic-100">Usuários Recentes</h3>
          <button className="btn-secondary text-sm">
            Ver Todos
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-mystic-700">
                <th className="text-left py-3 px-4 text-mystic-300 font-medium">Usuário</th>
                <th className="text-left py-3 px-4 text-mystic-300 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-mystic-300 font-medium">Signo</th>
                <th className="text-left py-3 px-4 text-mystic-300 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-mystic-300 font-medium">Cadastro</th>
                <th className="text-left py-3 px-4 text-mystic-300 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-mystic-700/50 hover:bg-mystic-700/20">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-mystic-100">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-mystic-300">{user.email}</td>
                  <td className="py-3 px-4 text-mystic-300">{user.sign}</td>
                  <td className="py-3 px-4">
                    {getStatusBadge(user.subscription.status)}
                  </td>
                  <td className="py-3 px-4 text-mystic-300">
                    {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-primary-400 hover:text-primary-300">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-mystic text-mystic-100 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary">
            Gerar Relatório
          </button>
          <button className="btn-secondary">
            Gerenciar Planos
          </button>
          <button className="btn-secondary">
            Configurações
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin; 