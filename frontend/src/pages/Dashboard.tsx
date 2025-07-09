import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Sparkles, 
  MessageCircle, 
  History, 
  Calendar,
  Crown,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalReadings: 0,
    totalChats: 0,
    lastReading: null as any,
    lastChat: null as any
  });

  useEffect(() => {
    // Simular carregamento de estatísticas
    setStats({
      totalReadings: 12,
      totalChats: 8,
      lastReading: {
        id: '1',
        date: new Date(Date.now() - 86400000), // 1 dia atrás
        cards: ['O Louco', 'A Torre', 'O Sol']
      },
      lastChat: {
        id: '1',
        date: new Date(Date.now() - 3600000), // 1 hora atrás
        preview: 'Esmeralda: As cartas revelam que você está...'
      }
    });
  }, []);

  const isTrialExpired = () => {
    if (!user?.subscription?.trialEndsAt) return false;
    return new Date(user.subscription.trialEndsAt) < new Date();
  };

  const getTrialDaysLeft = () => {
    if (!user?.subscription?.trialEndsAt) return 0;
    const trialEnd = new Date(user.subscription.trialEndsAt);
    const now = new Date();
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const quickActions = [
    {
      title: 'Nova Tiragem',
      description: 'Consulte as cartas do tarô',
      icon: Sparkles,
      color: 'bg-primary-600',
      href: '/reading'
    },
    {
      title: 'Chat com Esmeralda',
      description: 'Converse com a cartomante virtual',
      icon: MessageCircle,
      color: 'bg-gold-600',
      href: '/chat'
    },
    {
      title: 'Histórico',
      description: 'Veja suas consultas anteriores',
      icon: History,
      color: 'bg-mystic-600',
      href: '/profile'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mystic text-mystic-100">
            Bem-vindo, {user?.name}! 🔮
          </h1>
          <p className="text-mystic-400 mt-1">
            Que as estrelas iluminem seu caminho hoje
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-mystic-300 text-sm">Signo</p>
          <p className="text-primary-400 font-medium">{user?.sign}</p>
        </div>
      </div>

      {/* Trial Warning */}
      {user?.subscription?.status === 'trial' && (
        <div className={`card ${isTrialExpired() ? 'border-red-500' : 'border-gold-500'}`}>
          <div className="flex items-center space-x-3">
            {isTrialExpired() ? (
              <AlertTriangle className="text-red-400" size={24} />
            ) : (
              <Crown className="text-gold-400" size={24} />
            )}
            <div className="flex-1">
              <h3 className={`font-medium ${isTrialExpired() ? 'text-red-400' : 'text-gold-400'}`}>
                {isTrialExpired() ? 'Teste Expirado' : 'Teste Grátis'}
              </h3>
              <p className="text-mystic-400 text-sm">
                {isTrialExpired() 
                  ? 'Seu teste grátis expirou. Assine para continuar usando o Oráculo Digital.'
                  : `${getTrialDaysLeft()} dias restantes no seu teste grátis`
                }
              </p>
            </div>
            {isTrialExpired() && (
              <button className="btn-primary">
                Assinar por R$ 50/mês
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-mystic text-mystic-100 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.href}
                className="card hover:bg-mystic-700 transition-colors duration-200 group"
              >
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="text-white" size={24} />
                </div>
                <h3 className="text-lg font-medium text-mystic-100 mb-2">
                  {action.title}
                </h3>
                <p className="text-mystic-400 text-sm">
                  {action.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reading Stats */}
        <div className="card">
          <h3 className="text-lg font-mystic text-mystic-100 mb-4">Suas Tiragens</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-mystic-400">Total de consultas</span>
              <span className="text-primary-400 font-medium">{stats.totalReadings}</span>
            </div>
            {stats.lastReading && (
              <div className="pt-4 border-t border-mystic-700">
                <p className="text-mystic-400 text-sm mb-2">Última tiragem:</p>
                <p className="text-mystic-200 text-sm">
                  {format(stats.lastReading.date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </p>
                <p className="text-mystic-400 text-xs mt-1">
                  Cartas: {stats.lastReading.cards.join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Stats */}
        <div className="card">
          <h3 className="text-lg font-mystic text-mystic-100 mb-4">Conversas com Esmeralda</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-mystic-400">Total de chats</span>
              <span className="text-gold-400 font-medium">{stats.totalChats}</span>
            </div>
            {stats.lastChat && (
              <div className="pt-4 border-t border-mystic-700">
                <p className="text-mystic-400 text-sm mb-2">Última conversa:</p>
                <p className="text-mystic-200 text-sm">
                  {format(stats.lastChat.date, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                </p>
                <p className="text-mystic-400 text-xs mt-1 truncate">
                  {stats.lastChat.preview}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Message */}
      <div className="card bg-gradient-to-r from-primary-900/20 to-gold-900/20 border-primary-700">
        <div className="text-center">
          <h3 className="text-xl font-mystic text-primary-400 mb-2">
            💫 Mensagem do Dia
          </h3>
          <p className="text-mystic-200 mystic-text">
            "As cartas revelam que hoje é um dia de transformação. 
            Mantenha-se aberto às mudanças que o universo tem preparado para você. 
            Confie na sua intuição e deixe a magia fluir."
          </p>
          <p className="text-mystic-400 text-sm mt-4">
            — Esmeralda, a Cartomante
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 