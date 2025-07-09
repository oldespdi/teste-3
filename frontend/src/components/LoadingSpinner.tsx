import React from 'react';
import { Sparkles } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-mystic-900 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary-400 animate-pulse" size={24} />
        </div>
        <h2 className="text-xl font-mystic text-mystic-200 mb-2">🔮 Oráculo Digital</h2>
        <p className="text-mystic-400">Conectando com o universo místico...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner; 