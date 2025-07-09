import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/init.js';
import { generateChatResponse } from '../services/ai.js';

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Get or create chat session
router.get('/session', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const db = getDatabase();

    // Check user subscription
    const user = db.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Check if user can chat
    const canChat = await checkUserCanChat(user);
    if (!canChat.allowed) {
      return res.status(403).json({ 
        error: 'Acesso bloqueado',
        reason: canChat.reason,
        subscription: user
      });
    }

    // Get or create session
    let sessions = db.getChatSessionsByUserId(userId);
    let session = sessions.length > 0 ? sessions.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0] : null;

    if (!session) {
      const sessionId = uuidv4();
      const newSession = {
        id: sessionId,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      session = await db.createChatSession(newSession);
    }

    // Get messages for this session
    const messages = db.getChatMessages(session.id).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      isUser: msg.is_user,
      timestamp: msg.created_at
    }));

    res.json({
      session: {
        id: session.id,
        userId: session.user_id,
        createdAt: session.created_at,
        updatedAt: session.updated_at
      },
      messages: formattedMessages
    });

  } catch (error) {
    console.error('Get chat session error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Send message
router.post('/message', authenticateToken, async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const userId = req.user.userId;

    if (!sessionId || !message) {
      return res.status(400).json({ error: 'Sessão e mensagem são obrigatórios' });
    }

    const db = getDatabase();

    // Check user subscription
    const user = db.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Check if user can chat
    const canChat = await checkUserCanChat(user);
    if (!canChat.allowed) {
      return res.status(403).json({ 
        error: 'Acesso bloqueado',
        reason: canChat.reason,
        subscription: user
      });
    }

    // Verify session belongs to user
    const session = db.getChatSessionById(sessionId);

    if (!session || session.user_id !== userId) {
      return res.status(404).json({ error: 'Sessão não encontrada' });
    }

    // Save user message
    const userMessageId = uuidv4();
    const userMessage = {
      id: userMessageId,
      session_id: sessionId,
      content: message,
      is_user: true,
      created_at: new Date().toISOString()
    };
    await db.createChatMessage(userMessage);

    // Get conversation history for AI context
    const allMessages = db.getChatMessages(sessionId);
    const recentMessages = allMessages
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);

    const conversationHistory = recentMessages
      .reverse()
      .map(msg => `${msg.is_user ? 'Usuário' : 'Esmeralda'}: ${msg.content}`)
      .join('\n');

    // Generate AI response
    const aiResponse = await generateChatResponse(message, conversationHistory, user.name);

    // Save AI response
    const aiMessageId = uuidv4();
    const aiMessage = {
      id: aiMessageId,
      session_id: sessionId,
      content: aiResponse,
      is_user: false,
      created_at: new Date().toISOString()
    };
    await db.createChatMessage(aiMessage);

    // Update session timestamp
    await db.updateChatSession(sessionId, { updated_at: new Date().toISOString() });

    res.json({
      message: 'Mensagem enviada com sucesso',
      userMessage: {
        id: userMessageId,
        content: message,
        isUser: true,
        timestamp: new Date().toISOString()
      },
      aiResponse: {
        id: aiMessageId,
        content: aiResponse,
        isUser: false,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get chat history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const db = getDatabase();

    const sessions = await db.all(`
      SELECT * FROM chat_sessions 
      WHERE user_id = ? 
      ORDER BY updated_at DESC
    `, [userId]);

    const sessionsWithMessages = await Promise.all(
      sessions.map(async (session) => {
        const messages = await db.all(`
          SELECT * FROM chat_messages 
          WHERE session_id = ? 
          ORDER BY created_at ASC
        `, [session.id]);

        const formattedMessages = messages.map(msg => ({
          id: msg.id,
          content: msg.content,
          isUser: msg.is_user,
          timestamp: msg.created_at
        }));

        return {
          id: session.id,
          userId: session.user_id,
          messages: formattedMessages,
          createdAt: session.created_at,
          updatedAt: session.updated_at
        };
      })
    );

    res.json({ sessions: sessionsWithMessages });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Create new chat session
router.post('/session', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const db = getDatabase();

    // Check user subscription
    const user = await db.get(`
      SELECT subscription_status, trial_ends_at, subscription_expires_at
      FROM users WHERE id = ?
    `, [userId]);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Check if user can chat
    const canChat = await checkUserCanChat(user);
    if (!canChat.allowed) {
      return res.status(403).json({ 
        error: 'Acesso bloqueado',
        reason: canChat.reason,
        subscription: user
      });
    }

    // Create new session
    const sessionId = uuidv4();
    await db.run(`
      INSERT INTO chat_sessions (id, user_id)
      VALUES (?, ?)
    `, [sessionId, userId]);

    const session = await db.get(`
      SELECT * FROM chat_sessions WHERE id = ?
    `, [sessionId]);

    res.status(201).json({
      message: 'Nova sessão criada',
      session: {
        id: session.id,
        userId: session.user_id,
        messages: [],
        createdAt: session.created_at,
        updatedAt: session.updated_at
      }
    });

  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Helper function to check if user can chat
async function checkUserCanChat(user) {
  const now = new Date();

  if (user.subscription_status === 'active') {
    if (user.subscription_expires_at && new Date(user.subscription_expires_at) < now) {
      return { allowed: false, reason: 'Assinatura expirada' };
    }
    return { allowed: true };
  }

  if (user.subscription_status === 'trial') {
    if (user.trial_ends_at && new Date(user.trial_ends_at) < now) {
      return { allowed: false, reason: 'Teste grátis expirado' };
    }
    return { allowed: true };
  }

  return { allowed: false, reason: 'Acesso bloqueado' };
}

export default router; 