import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import routes
import authRoutes from './routes/auth.js';
import readingRoutes from './routes/readings.js';
import chatRoutes from './routes/chat.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payments.js';

// Import database
import { initDatabase } from './database/init.js';
import { db as postgresDB, initTables } from './database/postgres.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Oráculo Digital API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/readings', readingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// Mock data for development
app.get('/api/mock/users', (req, res) => {
  res.json([
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
  ]);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    // Verificar se temos DATABASE_URL (produção - PostgreSQL)
    if (process.env.DATABASE_URL) {
      console.log('🗄️ Using PostgreSQL database');
      await initTables();
      console.log('✅ PostgreSQL database initialized successfully');
    } else {
      console.log('📁 Using local JSON database');
      await initDatabase();
      console.log('✅ Local database initialized successfully');
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Oráculo Digital API running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔮 Frontend: http://localhost:5173`);
      console.log(`🗄️ Database: ${process.env.DATABASE_URL ? 'PostgreSQL' : 'Local JSON'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 