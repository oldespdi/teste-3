export interface User {
  id: string;
  name: string;
  email: string;
  sign: string;
  age: number;
  avatar?: string;
  subscription: {
    status: 'trial' | 'active' | 'expired' | 'cancelled';
    trialEndsAt?: string;
    expiresAt?: string;
    plan: 'trial' | 'monthly';
  };
  createdAt: string;
}

export interface Card {
  id: string;
  name: string;
  image: string;
  description: string;
  meaning: {
    upright: string;
    reversed: string;
  };
  suit: 'major' | 'wands' | 'cups' | 'swords' | 'pentacles';
  number: number;
}

export interface Reading {
  id: string;
  userId: string;
  cards: Card[];
  spread: 'single' | 'three' | 'celtic-cross';
  question?: string;
  interpretation: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  trialUsers: number;
  totalReadings: number;
  totalChats: number;
  revenue: number;
} 