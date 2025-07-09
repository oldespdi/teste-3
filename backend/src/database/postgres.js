import pkg from 'pg';
const { Pool } = pkg;

// Configuração do banco PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Testar conexão
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

// Funções do banco de dados
export const db = {
  // Query genérica
  query: (text, params) => pool.query(text, params),
  
  // Usuários
  getUsers: async () => {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows;
  },
  
  getUserById: async (id) => {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },
  
  getUserByEmail: async (email) => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },
  
  createUser: async (user) => {
    const { name, email, password, sign, birthdate, preferences } = user;
    const result = await pool.query(
      `INSERT INTO users (id, name, email, password, sign, birthdate, preferences, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [user.id, name, email, password, sign, birthdate, preferences, new Date(), new Date()]
    );
    return result.rows[0];
  },
  
  updateUser: async (id, updates) => {
    const fields = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = Object.values(updates);
    const result = await pool.query(
      `UPDATE users SET ${fields}, updated_at = $${values.length + 2} WHERE id = $1 RETURNING *`,
      [id, ...values, new Date()]
    );
    return result.rows[0];
  },
  
  // Leituras de tarô
  getReadings: async () => {
    const result = await pool.query('SELECT * FROM readings ORDER BY created_at DESC');
    return result.rows;
  },
  
  getReadingsByUserId: async (userId) => {
    const result = await pool.query('SELECT * FROM readings WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows;
  },
  
  createReading: async (reading) => {
    const result = await pool.query(
      `INSERT INTO readings (id, user_id, question, spread_type, interpretation, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [reading.id, reading.user_id, reading.question, reading.spread_type, reading.interpretation, new Date()]
    );
    return result.rows[0];
  },
  
  // Chat
  getChatSessions: async () => {
    const result = await pool.query('SELECT * FROM chat_sessions ORDER BY updated_at DESC');
    return result.rows;
  },
  
  getChatSessionsByUserId: async (userId) => {
    const result = await pool.query('SELECT * FROM chat_sessions WHERE user_id = $1 ORDER BY updated_at DESC', [userId]);
    return result.rows;
  },
  
  createChatSession: async (session) => {
    const result = await pool.query(
      `INSERT INTO chat_sessions (id, user_id, created_at, updated_at) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [session.id, session.user_id, new Date(), new Date()]
    );
    return result.rows[0];
  },
  
  // Simpatias e Amarrações
  getSimpatiasRealizadas: async () => {
    const result = await pool.query('SELECT * FROM simpatias_realizadas ORDER BY created_at DESC');
    return result.rows;
  },
  
  getSimpatiasByUserId: async (userId) => {
    const result = await pool.query('SELECT * FROM simpatias_realizadas WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows;
  },
  
  createSimpatiaRealizada: async (simpatia) => {
    const result = await pool.query(
      `INSERT INTO simpatias_realizadas (id, user_id, simpatia_id, objetivo, data_inicio, status, observacoes, resultado, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [simpatia.id, simpatia.user_id, simpatia.simpatia_id, simpatia.objetivo, simpatia.data_inicio, simpatia.status, simpatia.observacoes, simpatia.resultado, new Date(), new Date()]
    );
    return result.rows[0];
  },
  
  getAmaracoesRealizadas: async () => {
    const result = await pool.query('SELECT * FROM amaracoes_realizadas ORDER BY created_at DESC');
    return result.rows;
  },
  
  getAmaracoesByUserId: async (userId) => {
    const result = await pool.query('SELECT * FROM amaracoes_realizadas WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows;
  },
  
  createAmaracaoRealizada: async (amaracao) => {
    const result = await pool.query(
      `INSERT INTO amaracoes_realizadas (id, user_id, amaracao_id, objetivo, data_inicio, status, observacoes, resultado, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [amaracao.id, amaracao.user_id, amaracao.amaracao_id, amaracao.objetivo, amaracao.data_inicio, amaracao.status, amaracao.observacoes, amaracao.resultado, new Date(), new Date()]
    );
    return result.rows[0];
  }
};

// Criar tabelas se não existirem
export const initTables = async () => {
  try {
    // Tabela de usuários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        sign VARCHAR(50),
        birthdate DATE,
        preferences JSONB DEFAULT '{}',
        subscription_status VARCHAR(50) DEFAULT 'inactive',
        subscription_plan VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Tabela de leituras
    await pool.query(`
      CREATE TABLE IF NOT EXISTS readings (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id),
        question TEXT,
        spread_type VARCHAR(50),
        interpretation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Tabela de sessões de chat
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Tabela de mensagens de chat
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(255) PRIMARY KEY,
        session_id VARCHAR(255) REFERENCES chat_sessions(id),
        content TEXT NOT NULL,
        is_user BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Tabela de simpatias realizadas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS simpatias_realizadas (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id),
        simpatia_id INTEGER,
        objetivo TEXT,
        data_inicio DATE,
        status VARCHAR(50) DEFAULT 'em_andamento',
        observacoes TEXT,
        resultado TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Tabela de amarrações realizadas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS amaracoes_realizadas (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) REFERENCES users(id),
        amaracao_id INTEGER,
        objetivo TEXT,
        data_inicio DATE,
        status VARCHAR(50) DEFAULT 'em_andamento',
        observacoes TEXT,
        resultado TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

export default pool; 