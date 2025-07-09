import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, RotateCcw, Eye, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Reading as ReadingType } from '../types';

const Reading = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shuffling, setShuffling] = useState(false);
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [interpretation, setInterpretation] = useState('');
  const [showInterpretation, setShowInterpretation] = useState(false);
  const [question, setQuestion] = useState('');

  // Dados mockados do baralho
  const tarotDeck: Card[] = [
    {
      id: '0',
      name: 'O Louco',
      image: '/cards/fool.jpg',
      description: 'Inocência, espontaneidade, novos começos',
      meaning: {
        upright: 'Novos começos, aventura, espontaneidade, liberdade',
        reversed: 'Imprudência, risco, falta de direção'
      },
      suit: 'major',
      number: 0
    },
    {
      id: '1',
      name: 'O Mago',
      image: '/cards/magician.jpg',
      description: 'Manifestação, poder, habilidade',
      meaning: {
        upright: 'Manifestação, poder, habilidade, concentração',
        reversed: 'Manipulação, falta de habilidade, desperdício'
      },
      suit: 'major',
      number: 1
    },
    {
      id: '2',
      name: 'A Sacerdotisa',
      image: '/cards/priestess.jpg',
      description: 'Intuição, mistério, sabedoria interior',
      meaning: {
        upright: 'Intuição, mistério, sabedoria interior, conhecimento secreto',
        reversed: 'Segredos, desconexão, falta de intuição'
      },
      suit: 'major',
      number: 2
    },
    {
      id: '3',
      name: 'A Imperatriz',
      image: '/cards/empress.jpg',
      description: 'Fertilidade, abundância, maternidade',
      meaning: {
        upright: 'Fertilidade, abundância, maternidade, criatividade',
        reversed: 'Estagnação, falta de crescimento, dependência'
      },
      suit: 'major',
      number: 3
    },
    {
      id: '4',
      name: 'O Imperador',
      image: '/cards/emperor.jpg',
      description: 'Autoridade, estrutura, controle',
      meaning: {
        upright: 'Autoridade, estrutura, controle, estabilidade',
        reversed: 'Tirania, rigidez, falta de disciplina'
      },
      suit: 'major',
      number: 4
    }
  ];

  const shuffleDeck = () => {
    setShuffling(true);
    setTimeout(() => {
      const shuffled = [...tarotDeck].sort(() => Math.random() - 0.5);
      setSelectedCards(shuffled.slice(0, 3));
      setShuffling(false);
      setShowInterpretation(false);
      setInterpretation('');
    }, 2000);
  };

  const getInterpretation = async () => {
    if (selectedCards.length === 0) return;

    setLoading(true);
    try {
      // Simular chamada à API da IA
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockInterpretation = `
        Olá, ${user?.name}! As cartas que você tirou revelam uma mensagem muito especial para você neste momento.

        **${selectedCards[0].name}** - Esta carta fala sobre ${selectedCards[0].meaning.upright.toLowerCase()}. É um sinal de que você está em um período de ${selectedCards[0].description.toLowerCase()}.

        **${selectedCards[1].name}** - Aqui vemos ${selectedCards[1].meaning.upright.toLowerCase()}. Isso indica que você deve ${selectedCards[1].description.toLowerCase()}.

        **${selectedCards[2].name}** - Por fim, ${selectedCards[2].name} nos mostra ${selectedCards[2].meaning.upright.toLowerCase()}. Esta é uma mensagem clara sobre ${selectedCards[2].description.toLowerCase()}.

        **Mensagem Geral:**
        O universo está alinhado a seu favor. Confie na sua intuição e mantenha-se aberto às oportunidades que estão por vir. Este é um momento de transformação e crescimento pessoal.

        Lembre-se: as cartas são apenas um guia. O poder de criar sua realidade está em suas mãos.
      `;

      setInterpretation(mockInterpretation);
      setShowInterpretation(true);
      
      // Salvar no histórico
      const reading: ReadingType = {
        id: Date.now().toString(),
        userId: user?.id || '',
        cards: selectedCards,
        spread: 'three',
        question,
        interpretation: mockInterpretation,
        createdAt: new Date().toISOString()
      };

      toast.success('Interpretação concluída! 🔮');
    } catch (error) {
      toast.error('Erro ao interpretar as cartas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    shuffleDeck();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-mystic text-mystic-100 mb-2">
          ✨ Tiragem de Cartas
        </h1>
        <p className="text-mystic-400">
          Deixe as cartas revelarem os mistérios do universo
        </p>
      </div>

      {/* Question Input */}
      <div className="card max-w-2xl mx-auto">
        <label htmlFor="question" className="block text-mystic-300 text-sm font-medium mb-2">
          Qual é sua pergunta para as cartas?
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="input-field w-full h-20 resize-none"
          placeholder="Ex: O que o futuro reserva para mim no amor?"
        />
      </div>

      {/* Shuffle Button */}
      <div className="text-center">
        <button
          onClick={shuffleDeck}
          disabled={shuffling}
          className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {shuffling ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Embaralhando...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <RotateCcw size={20} />
              <span>Embaralhar Cartas</span>
            </div>
          )}
        </button>
      </div>

      {/* Cards Display */}
      {selectedCards.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-mystic text-mystic-100 text-center">
            Suas Cartas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {selectedCards.map((card, index) => (
              <div
                key={card.id}
                className="card text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className="w-full h-48 bg-gradient-to-br from-primary-600 to-gold-600 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <Sparkles className="text-white/80" size={48} />
                  <div className="absolute top-2 right-2 bg-white/20 rounded-full w-8 h-8 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{index + 1}</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-mystic text-mystic-100 mb-2">
                  {card.name}
                </h3>
                <p className="text-mystic-400 text-sm">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          {/* Interpretation Button */}
          <div className="text-center">
            <button
              onClick={getInterpretation}
              disabled={loading}
              className="btn-secondary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-mystic-300 border-t-transparent rounded-full animate-spin"></div>
                  <span>Consultando Esmeralda...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Eye size={20} />
                  <span>Ver Interpretação</span>
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Interpretation */}
      {showInterpretation && interpretation && (
        <div className="card max-w-4xl mx-auto">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gold-600 rounded-full flex items-center justify-center">
              <Heart className="text-white" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-mystic text-mystic-100">
                Interpretação de Esmeralda
              </h3>
              <p className="text-mystic-400 text-sm">
                Mensagem personalizada para você
              </p>
            </div>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <div className="text-mystic-200 mystic-text whitespace-pre-line">
              {interpretation}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reading; 