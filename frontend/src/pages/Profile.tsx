import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Calendar, 
  Sparkles, 
  MessageCircle, 
  Settings,
  Edit,
  Save,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { Reading, ChatSession } from '../types';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    sign: user?.sign || '',
    age: user?.age || 0
  });
  const [readings, setReadings] = useState<Reading[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'readings' | 'chats'>('profile');

  useEffect(() => {
    // Simular carregamento de dados
    const mockReadings: Reading[] = [
      {
        id: '1',
        userId: user?.id || '',
        cards: [
          { id: '0', name: 'O Louco', image: '', description: '', meaning: { upright: '', reversed: '' }, suit: 'major', number: 0 },
          { id: '1', name: 'O Mago', image: '', description: '', meaning: { upright: '', reversed: '' }, suit: 'major', number: 1 }
        ],
        spread: 'three',
        question: 'O que o futuro reserva para mim?',
        interpretation: 'As cartas revelam um período de transformação...',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: '2',
        userId: user?.id || '',
        cards: [
          { id: '2', name: 'A Sacerdotisa', image: '', description: '', meaning: { upright: '', reversed: '' }, suit: 'major', number: 2 }
        ],
        spread: 'single',
        question: 'Devo confiar na minha intuição?',
        interpretation: 'A Sacerdotisa confirma que sua intuição está correta...',
        createdAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];

    const mockChatSessions: ChatSession[] = [
      {
        id: '1',
        userId: user?.id || '',
        messages: [],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString()
      }
    ];

    setReadings(mockReadings);
    setChatSessions(mockChatSessions);
  }, [user]);

  const handleSave = () => {
    updateUser(editData);
    setIsEditing(false);
    toast.success('Perfil atualizado com sucesso! ✨');
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || '',
      sign: user?.sign || '',
      age: user?.age || 0
    });
    setIsEditing(false);
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'readings', label: 'Tiragens', icon: Sparkles },
    { id: 'chats', label: 'Conversas', icon: MessageCircle }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-mystic text-mystic-100">
          Seu Perfil Místico
        </h1>
        <div className="flex items-center space-x-2">
          <span className="text-mystic-400 text-sm">Status:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            user?.subscription?.status === 'active' 
              ? 'bg-green-900 text-green-300' 
              : 'bg-gold-900 text-gold-300'
          }`}>
            {user?.subscription?.status === 'active' ? 'Assinante' : 'Teste Grátis'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-mystic-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-mystic-400 hover:text-mystic-300'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-mystic text-mystic-100">
                Informações Pessoais
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Edit size={16} />
                  <span>Editar</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save size={16} />
                    <span>Salvar</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <X size={16} />
                    <span>Cancelar</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-mystic-300 text-sm font-medium mb-2">
                  Nome Completo
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                    className="input-field w-full"
                  />
                ) : (
                  <p className="text-mystic-100">{user?.name}</p>
                )}
              </div>

              <div>
                <label className="block text-mystic-300 text-sm font-medium mb-2">
                  Email
                </label>
                <p className="text-mystic-100">{user?.email}</p>
              </div>

              <div>
                <label className="block text-mystic-300 text-sm font-medium mb-2">
                  Signo
                </label>
                {isEditing ? (
                  <select
                    value={editData.sign}
                    onChange={(e) => setEditData(prev => ({ ...prev, sign: e.target.value }))}
                    className="input-field w-full"
                  >
                    <option value="">Selecione</option>
                    {['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'].map(sign => (
                      <option key={sign} value={sign}>{sign}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-mystic-100">{user?.sign}</p>
                )}
              </div>

              <div>
                <label className="block text-mystic-300 text-sm font-medium mb-2">
                  Idade
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.age}
                    onChange={(e) => setEditData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                    className="input-field w-full"
                    min="18"
                    max="120"
                  />
                ) : (
                  <p className="text-mystic-100">{user?.age} anos</p>
                )}
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="card">
            <h3 className="text-lg font-mystic text-mystic-100 mb-4">
              Informações da Assinatura
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-mystic-400">Status:</span>
                <span className="text-mystic-100 capitalize">{user?.subscription?.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mystic-400">Plano:</span>
                <span className="text-mystic-100">{user?.subscription?.plan === 'monthly' ? 'Mensal - R$ 50' : 'Teste Grátis'}</span>
              </div>
              {user?.subscription?.trialEndsAt && (
                <div className="flex justify-between">
                  <span className="text-mystic-400">Teste expira em:</span>
                  <span className="text-mystic-100">
                    {format(new Date(user.subscription.trialEndsAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
              )}
              {user?.subscription?.expiresAt && (
                <div className="flex justify-between">
                  <span className="text-mystic-400">Próxima cobrança:</span>
                  <span className="text-mystic-100">
                    {format(new Date(user.subscription.expiresAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Readings Tab */}
      {activeTab === 'readings' && (
        <div className="space-y-4">
          <h2 className="text-xl font-mystic text-mystic-100">
            Histórico de Tiragens
          </h2>
          {readings.length === 0 ? (
            <div className="card text-center py-12">
              <Sparkles className="mx-auto text-mystic-400 mb-4" size={48} />
              <p className="text-mystic-400">Nenhuma tiragem realizada ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {readings.map((reading) => (
                <div key={reading.id} className="card">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-mystic-100 font-medium mb-1">
                        {reading.question || 'Consulta Geral'}
                      </h3>
                      <p className="text-mystic-400 text-sm">
                        {format(new Date(reading.createdAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <span className="text-primary-400 text-sm font-medium">
                      {reading.spread === 'single' ? '1 carta' : 
                       reading.spread === 'three' ? '3 cartas' : 'Cruz Celta'}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-mystic-300 text-sm mb-2">Cartas tiradas:</p>
                    <div className="flex flex-wrap gap-2">
                      {reading.cards.map((card) => (
                        <span
                          key={card.id}
                          className="px-2 py-1 bg-mystic-700 text-mystic-200 text-xs rounded"
                        >
                          {card.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <details className="group">
                    <summary className="cursor-pointer text-primary-400 hover:text-primary-300 text-sm font-medium">
                      Ver interpretação
                    </summary>
                    <div className="mt-3 p-3 bg-mystic-700 rounded-lg">
                      <p className="text-mystic-200 text-sm whitespace-pre-line">
                        {reading.interpretation}
                      </p>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chats Tab */}
      {activeTab === 'chats' && (
        <div className="space-y-4">
          <h2 className="text-xl font-mystic text-mystic-100">
            Conversas com Esmeralda
          </h2>
          {chatSessions.length === 0 ? (
            <div className="card text-center py-12">
              <MessageCircle className="mx-auto text-mystic-400 mb-4" size={48} />
              <p className="text-mystic-400">Nenhuma conversa iniciada ainda</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chatSessions.map((session) => (
                <div key={session.id} className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-mystic-100 font-medium">
                        Conversa com Esmeralda
                      </h3>
                      <p className="text-mystic-400 text-sm">
                        {format(new Date(session.updatedAt), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <button className="btn-secondary text-sm">
                      Continuar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile; 