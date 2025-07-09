import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/init.js';
import { generateInterpretation } from '../services/ai.js';

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

// Get all tarot cards
router.get('/cards', async (req, res) => {
  try {
    const db = getDatabase();
    const cards = db.getTarotCards().sort((a, b) => a.number - b.number);
    
    const formattedCards = cards.map(card => ({
      id: card.id,
      name: card.name,
      image: card.image,
      description: card.description,
      meaning: {
        upright: card.upright_meaning,
        reversed: card.reversed_meaning
      },
      suit: card.suit,
      number: card.number
    }));

    res.json({ cards: formattedCards });
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Create a new reading
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { spread, question, cards } = req.body;
    const userId = req.user.userId;

    // Validation
    if (!spread || !cards || !Array.isArray(cards)) {
      return res.status(400).json({ error: 'Dados inválidos para a tiragem' });
    }

    const db = getDatabase();

    // Check user subscription
    const user = db.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Check if user can perform readings
    const canRead = await checkUserCanRead(user);
    if (!canRead.allowed) {
      return res.status(403).json({ 
        error: 'Acesso bloqueado',
        reason: canRead.reason,
        subscription: user
      });
    }

    // Create reading
    const readingId = uuidv4();
    const newReading = {
      id: readingId,
      user_id: userId,
      spread,
      question,
      interpretation: '',
      created_at: new Date().toISOString()
    };
    await db.createReading(newReading);

    // Add cards to reading
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const readingCard = {
        id: uuidv4(),
        reading_id: readingId,
        card_id: card.id,
        position: i,
        is_reversed: card.isReversed || false
      };
      await db.createReadingCard(readingCard);
    }

    // Generate interpretation using AI
    const interpretation = await generateInterpretation(cards, question, spread);

    // Update reading with interpretation
    const updatedReading = await db.updateReading(readingId, { interpretation });

    // Get complete reading
    const reading = updatedReading;
    const readingCards = db.getReadingCards(readingId);

    const formattedCards = readingCards.map(rc => {
      const card = db.getTarotCardById(rc.card_id);
      return {
        id: rc.card_id,
        name: card.name,
        image: card.image,
        description: card.description,
        meaning: {
          upright: card.upright_meaning,
          reversed: card.reversed_meaning
        },
        suit: card.suit,
        number: card.number,
        isReversed: rc.is_reversed
      };
    });

    const response = {
      id: reading.id,
      userId: reading.user_id,
      cards: formattedCards,
      spread: reading.spread,
      question: reading.question,
      interpretation: reading.interpretation,
      createdAt: reading.created_at
    };

    res.status(201).json({
      message: 'Tiragem criada com sucesso',
      reading: response
    });

  } catch (error) {
    console.error('Create reading error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get user's readings
router.get('/my-readings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const db = getDatabase();

    const readings = db.getReadingsByUserId(userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const readingsWithCards = readings.map((reading) => {
      const cards = db.getReadingCards(reading.id).sort((a, b) => a.position - b.position);

      const formattedCards = cards.map(rc => {
        const card = db.getTarotCardById(rc.card_id);
        return {
          id: rc.card_id,
          name: card.name,
          image: card.image,
          description: card.description,
          meaning: {
            upright: card.upright_meaning,
            reversed: card.reversed_meaning
          },
          suit: card.suit,
          number: card.number,
          isReversed: rc.is_reversed
        };
      });

      return {
        id: reading.id,
        userId: reading.user_id,
        cards: formattedCards,
        spread: reading.spread,
        question: reading.question,
        interpretation: reading.interpretation,
        createdAt: reading.created_at
      };
    });

    res.json({ readings: readingsWithCards });

  } catch (error) {
    console.error('Get readings error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get specific reading
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const db = getDatabase();

    const reading = db.getReadingById(id);

    if (!reading || reading.user_id !== userId) {
      return res.status(404).json({ error: 'Tiragem não encontrada' });
    }

    const cards = db.getReadingCards(id).sort((a, b) => a.position - b.position);

    const formattedCards = cards.map(rc => {
      const card = db.getTarotCardById(rc.card_id);
      return {
        id: rc.card_id,
        name: card.name,
        image: card.image,
        description: card.description,
        meaning: {
          upright: card.upright_meaning,
          reversed: card.reversed_meaning
        },
        suit: card.suit,
        number: card.number,
        isReversed: rc.is_reversed
      };
    });

    const response = {
      id: reading.id,
      userId: reading.user_id,
      cards: formattedCards,
      spread: reading.spread,
      question: reading.question,
      interpretation: reading.interpretation,
      createdAt: reading.created_at
    };

    res.json({ reading: response });

  } catch (error) {
    console.error('Get reading error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Helper function to check if user can perform readings
async function checkUserCanRead(user) {
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