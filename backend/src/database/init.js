import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// In-memory database
let db = {
  users: [],
  readings: [],
  readingCards: [],
  chatSessions: [],
  chatMessages: [],
  tarotCards: [],
  payments: [],
  // Novo: histórico de simpatias e amarrações
  simpatiasRealizadas: [],
  amaracoesRealizadas: []
  // Novo: histórico de consultas e chats por usuário
  // (opcional, pode ser referenciado por id, mas já deixo explícito)
  // users: [{ id, name, email, password, birthdate, sign, preferences, reading_history, chat_history, created_at, updated_at }]
};

const DB_FILE = join(__dirname, '../../data.json');

export async function initDatabase() {
  try {
    // Try to load existing data
    try {
      const data = await fs.readFile(DB_FILE, 'utf8');
      db = JSON.parse(data);
      console.log('✅ Database loaded from file');
    } catch (error) {
      console.log('📝 Creating new database file');
      await createTables();
      await insertInitialData();
      await saveDatabase();
    }
    
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

async function createTables() {
  // Initialize empty tables
  db.users = [];
  db.readings = [];
  db.readingCards = [];
  db.chatSessions = [];
  db.chatMessages = [];
  db.tarotCards = [];
  db.payments = [];
  // Novo: histórico de simpatias e amarrações
  db.simpatiasRealizadas = [];
  db.amaracoesRealizadas = [];
  
  console.log('✅ Tables created successfully');
}

async function insertInitialData() {
  // Insert admin user
  const adminExists = db.users.find(user => user.email === 'admin@oraculo.com');
  if (!adminExists) {
    db.users.push({
      id: 'admin-1',
      name: 'Administrador',
      email: 'admin@oraculo.com',
      password: '$2a$10$dummy.hash.for.admin', // In production, use proper bcrypt hash
      sign: 'Sagitário',
      age: 30,
      birthdate: '1993-12-10', // Novo campo
      preferences: {}, // Novo campo
      reading_history: [], // Novo campo
      chat_history: [], // Novo campo
      subscription_status: 'active',
      subscription_plan: 'monthly',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    console.log('✅ Admin user created');
  }

  // Insert sample tarot cards
  if (db.tarotCards.length === 0) {
    const sampleCards = [
      {
        id: '0',
        name: 'O Louco',
        description: 'Inocência, espontaneidade, novos começos',
        upright_meaning: 'Novos começos, aventura, espontaneidade, liberdade',
        reversed_meaning: 'Imprudência, risco, falta de direção',
        suit: 'major',
        number: 0,
        created_at: new Date().toISOString()
      },
      {
        id: '1',
        name: 'O Mago',
        description: 'Manifestação, poder, habilidade',
        upright_meaning: 'Manifestação, poder, habilidade, concentração',
        reversed_meaning: 'Manipulação, falta de habilidade, desperdício',
        suit: 'major',
        number: 1,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'A Sacerdotisa',
        description: 'Intuição, mistério, sabedoria interior',
        upright_meaning: 'Intuição, mistério, sabedoria interior, conhecimento secreto',
        reversed_meaning: 'Segredos, desconexão, falta de intuição',
        suit: 'major',
        number: 2,
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'A Imperatriz',
        description: 'Fertilidade, abundância, maternidade',
        upright_meaning: 'Fertilidade, abundância, maternidade, criatividade',
        reversed_meaning: 'Estagnação, falta de crescimento, dependência',
        suit: 'major',
        number: 3,
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        name: 'O Imperador',
        description: 'Autoridade, estrutura, controle',
        upright_meaning: 'Autoridade, estrutura, controle, estabilidade',
        reversed_meaning: 'Tirania, rigidez, falta de disciplina',
        suit: 'major',
        number: 4,
        created_at: new Date().toISOString()
      }
    ];

    db.tarotCards.push(...sampleCards);
    console.log('✅ Sample tarot cards inserted');
  }
}

async function saveDatabase() {
  try {
    // Ensure directory exists
    const dir = dirname(DB_FILE);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

export function getDatabase() {
  return {
    // Users
    getUsers: () => db.users,
    getUserById: (id) => db.users.find(user => user.id === id),
    getUserByEmail: (email) => db.users.find(user => user.email === email),
    createUser: async (user) => {
      // Garantir campos obrigatórios
      const newUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
        sign: user.sign || '',
        birthdate: user.birthdate || '',
        preferences: user.preferences || {},
        reading_history: user.reading_history || [],
        chat_history: user.chat_history || [],
        subscription_status: user.subscription_status || 'inactive',
        subscription_plan: user.subscription_plan || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.users.push(newUser);
      await saveDatabase();
      return newUser;
    },
    updateUser: async (id, updates) => {
      const index = db.users.findIndex(user => user.id === id);
      if (index !== -1) {
        db.users[index] = { ...db.users[index], ...updates, updated_at: new Date().toISOString() };
        await saveDatabase();
        return db.users[index];
      }
      return null;
    },
    
    // Readings
    getReadings: () => db.readings,
    getReadingsByUserId: (userId) => db.readings.filter(reading => reading.user_id === userId),
    getReadingById: (id) => db.readings.find(reading => reading.id === id),
    createReading: async (reading) => {
      db.readings.push(reading);
      await saveDatabase();
      return reading;
    },
    updateReading: async (id, updates) => {
      const index = db.readings.findIndex(reading => reading.id === id);
      if (index !== -1) {
        db.readings[index] = { ...db.readings[index], ...updates };
        await saveDatabase();
        return db.readings[index];
      }
      return null;
    },
    
    // Reading Cards
    getReadingCards: (readingId) => db.readingCards.filter(card => card.reading_id === readingId),
    createReadingCard: async (card) => {
      db.readingCards.push(card);
      await saveDatabase();
      return card;
    },
    
    // Chat Sessions
    getChatSessions: () => db.chatSessions,
    getChatSessionsByUserId: (userId) => db.chatSessions.filter(session => session.user_id === userId),
    getChatSessionById: (id) => db.chatSessions.find(session => session.id === id),
    createChatSession: async (session) => {
      db.chatSessions.push(session);
      await saveDatabase();
      return session;
    },
    updateChatSession: async (id, updates) => {
      const index = db.chatSessions.findIndex(session => session.id === id);
      if (index !== -1) {
        db.chatSessions[index] = { ...db.chatSessions[index], ...updates, updated_at: new Date().toISOString() };
        await saveDatabase();
        return db.chatSessions[index];
      }
      return null;
    },
    
    // Chat Messages
    getChatMessages: (sessionId) => db.chatMessages.filter(message => message.session_id === sessionId),
    createChatMessage: async (message) => {
      db.chatMessages.push(message);
      await saveDatabase();
      return message;
    },
    
    // Tarot Cards
    getTarotCards: () => db.tarotCards,
    getTarotCardById: (id) => db.tarotCards.find(card => card.id === id),
    
    // Payments
    getPayments: () => db.payments,
    getPaymentsByUserId: (userId) => db.payments.filter(payment => payment.user_id === userId),
    createPayment: async (payment) => {
      db.payments.push(payment);
      await saveDatabase();
      return payment;
    },
    updatePayment: async (id, updates) => {
      const index = db.payments.findIndex(payment => payment.id === id);
      if (index !== -1) {
        db.payments[index] = { ...db.payments[index], ...updates };
        await saveDatabase();
        return db.payments[index];
      }
      return null;
    },
    
    // Simpatias Realizadas
    getSimpatiasRealizadas: () => db.simpatiasRealizadas,
    getSimpatiasByUserId: (userId) => db.simpatiasRealizadas.filter(s => s.user_id === userId),
    createSimpatiaRealizada: async (simpatia) => {
      db.simpatiasRealizadas.push(simpatia);
      await saveDatabase();
      return simpatia;
    },
    updateSimpatiaRealizada: async (id, updates) => {
      const index = db.simpatiasRealizadas.findIndex(s => s.id === id);
      if (index !== -1) {
        db.simpatiasRealizadas[index] = { ...db.simpatiasRealizadas[index], ...updates };
        await saveDatabase();
        return db.simpatiasRealizadas[index];
      }
      return null;
    },
    
    // Amarrações Realizadas
    getAmaracoesRealizadas: () => db.amaracoesRealizadas,
    getAmaracoesByUserId: (userId) => db.amaracoesRealizadas.filter(a => a.user_id === userId),
    createAmaracaoRealizada: async (amaracao) => {
      db.amaracoesRealizadas.push(amaracao);
      await saveDatabase();
      return amaracao;
    },
    updateAmaracaoRealizada: async (id, updates) => {
      const index = db.amaracoesRealizadas.findIndex(a => a.id === id);
      if (index !== -1) {
        db.amaracoesRealizadas[index] = { ...db.amaracoesRealizadas[index], ...updates };
        await saveDatabase();
        return db.amaracoesRealizadas[index];
      }
      return null;
    }
  };
} 