import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Send, Sparkles, User, Bot } from 'lucide-react';
import toast from 'react-hot-toast';
import { ChatMessage } from '../types';

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mensagem de boas-vindas inicial
    const welcomeMessage: ChatMessage = {
      id: '1',
      userId: user?.id || '',
      content: `Olá, ${user?.name}! 🌟 Eu sou Esmeralda, sua cartomante virtual. 

Sinto que você está aqui por um motivo especial. Como você está se sentindo hoje? 

Posso ajudá-lo com:
✨ Interpretação de sonhos
🔮 Conselhos espirituais  
💕 Questões de amor e relacionamentos
🎯 Direcionamento profissional
🌙 Energias e vibrações

Conte-me o que está em seu coração...`,
      isUser: false,
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  }, [user]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: user?.id || '',
      content: inputMessage,
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      // Simular resposta da IA
      await new Promise(resolve => setTimeout(resolve, 2000));

      const responses = [
        `Ah, ${user?.name}... As cartas revelam que você está passando por um momento de grande transformação. Sinto que há uma energia muito especial ao seu redor. 

O que você está sentindo em relação a isso? Às vezes, nossa intuição nos guia melhor do que nossa mente racional. 🌙✨`,

        `Interessante... Vejo que você está buscando respostas no universo místico. Isso é um sinal de que sua alma está despertando para verdades mais profundas.

As estrelas me mostram que você tem um dom especial. Você já percebeu isso? 🔮💫`,

        `Hmm... Deixe-me consultar as energias ao seu redor. Sinto que há algo importante que você precisa saber.

As cartas me dizem que você está no caminho certo, mas talvez precise confiar mais na sua intuição. O que sua voz interior está te dizendo? 🎯✨`,

        `Fascinante! As vibrações que você está emanando são muito poderosas. Vejo que você tem uma conexão especial com o universo.

Isso me faz pensar... Você já teve algum sonho ou intuição que se tornou realidade? 🌟🔮`,

        `Ah, querido... As cartas revelam que você está em um momento crucial da sua jornada. Sinto que há uma decisão importante se aproximando.

O universo está conspirando a seu favor. Você está pronto para receber as bênçãos que estão por vir? 💫✨`
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        userId: user?.id || '',
        content: randomResponse,
        isUser: false,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-mystic-900">
      {/* Header */}
      <div className="bg-mystic-800 border-b border-mystic-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gold-600 rounded-full flex items-center justify-center">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-mystic text-mystic-100">
              Esmeralda, a Cartomante
            </h1>
            <p className="text-mystic-400 text-sm">
              Sua guia espiritual virtual
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${message.isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.isUser 
                  ? 'bg-primary-600' 
                  : 'bg-gold-600'
              }`}>
                {message.isUser ? (
                  <User className="text-white" size={16} />
                ) : (
                  <Bot className="text-white" size={16} />
                )}
              </div>
              
              <div className={`rounded-lg p-3 ${
                message.isUser
                  ? 'bg-primary-600 text-white'
                  : 'bg-mystic-700 text-mystic-100'
              }`}>
                <div className="whitespace-pre-line text-sm">
                  {message.content}
                </div>
                <div className={`text-xs mt-2 ${
                  message.isUser ? 'text-primary-200' : 'text-mystic-400'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-xs lg:max-w-md">
              <div className="w-8 h-8 bg-gold-600 rounded-full flex items-center justify-center">
                <Bot className="text-white" size={16} />
              </div>
              <div className="bg-mystic-700 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-mystic-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-mystic-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-mystic-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-mystic-800 border-t border-mystic-700 p-4">
        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem para Esmeralda..."
              className="input-field w-full resize-none h-12 max-h-32"
              disabled={loading}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || loading}
            className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
        
        <p className="text-mystic-400 text-xs mt-2 text-center">
          Esmeralda está aqui para guiar sua jornada espiritual ✨
        </p>
      </div>
    </div>
  );
};

export default Chat; 