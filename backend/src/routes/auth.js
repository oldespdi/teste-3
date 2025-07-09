import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/init.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, sign, age } = req.body;

    // Validation
    if (!name || !email || !password || !sign || !age) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    if (age < 18) {
      return res.status(400).json({ error: 'Você deve ter pelo menos 18 anos' });
    }

    const db = getDatabase();

    // Check if user already exists
    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = uuidv4();
    const trialEndsAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days

    const newUser = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      sign,
      age,
      subscription_status: 'trial',
      subscription_plan: 'trial',
      trial_ends_at: trialEndsAt,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await db.createUser(newUser);
    const user = newUser;

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Format response
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      sign: user.sign,
      age: user.age,
      subscription: {
        status: user.subscription_status,
        plan: user.subscription_plan,
        trialEndsAt: user.trial_ends_at
      },
      createdAt: user.created_at
    };

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const db = getDatabase();

    // Find user
    const user = db.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Format response
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      sign: user.sign,
      age: user.age,
      subscription: {
        status: user.subscription_status,
        plan: user.subscription_plan,
        trialEndsAt: user.trial_ends_at,
        expiresAt: user.subscription_expires_at
      },
      createdAt: user.created_at
    };

    res.json({
      message: 'Login realizado com sucesso',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const db = getDatabase();

    const user = db.getUserById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      sign: user.sign,
      age: user.age,
      subscription: {
        status: user.subscription_status,
        plan: user.subscription_plan,
        trialEndsAt: user.trial_ends_at,
        expiresAt: user.subscription_expires_at
      },
      createdAt: user.created_at
    };

    res.json({ user: userResponse });

  } catch (error) {
    console.error('Get user error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update user
router.put('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const { name, sign, age } = req.body;
    const db = getDatabase();

    // Update user
    await db.updateUser(decoded.userId, { name, sign, age });

    // Get updated user
    const user = db.getUserById(decoded.userId);

    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      sign: user.sign,
      age: user.age,
      subscription: {
        status: user.subscription_status,
        plan: user.subscription_plan,
        trialEndsAt: user.trial_ends_at,
        expiresAt: user.subscription_expires_at
      },
      createdAt: user.created_at
    };

    res.json({
      message: 'Usuário atualizado com sucesso',
      user: userResponse
    });

  } catch (error) {
    console.error('Update user error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router; 