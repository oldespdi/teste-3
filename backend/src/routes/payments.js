import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../database/init.js';

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

// Create payment intent (mock Stripe)
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { amount = 5000 } = req.body; // R$ 50.00 in cents
    const userId = req.user.userId;
    const db = getDatabase();

    // Check if user exists
    const user = db.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Create mock payment intent
    const paymentIntentId = `pi_${uuidv4().replace(/-/g, '')}`;
    const paymentId = uuidv4();

    // Save payment record
    const payment = {
      id: paymentId,
      user_id: userId,
      amount,
      currency: 'BRL',
      status: 'pending',
      payment_method: 'card',
      stripe_payment_intent_id: paymentIntentId,
      created_at: new Date().toISOString()
    };
    await db.createPayment(payment);

    res.json({
      clientSecret: `pi_${uuidv4().replace(/-/g, '')}_secret_${uuidv4().replace(/-/g, '')}`,
      paymentIntentId: paymentIntentId,
      amount: amount,
      currency: 'BRL'
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Confirm payment
router.post('/confirm', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const userId = req.user.userId;
    const db = getDatabase();

    // Find payment
    const allPayments = db.getPaymentsByUserId(userId);
    const payment = allPayments.find(p => p.stripe_payment_intent_id === paymentIntentId);

    if (!payment) {
      return res.status(404).json({ error: 'Pagamento não encontrado' });
    }

    // Update payment status
    await db.updatePayment(payment.id, { status: 'succeeded' });

    // Update user subscription
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
    const updatedUser = await db.updateUser(userId, {
      subscription_status: 'active',
      subscription_plan: 'monthly',
      subscription_expires_at: expiresAt
    });

    // Get updated user
    const user = updatedUser;

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
      message: 'Pagamento confirmado com sucesso',
      user: userResponse,
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: 'succeeded',
        createdAt: payment.created_at
      }
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get payment history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const db = getDatabase();

    const payments = db.getPaymentsByUserId(userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.payment_method,
      createdAt: payment.created_at
    }));

    res.json({ payments: formattedPayments });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get subscription plans
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'monthly',
        name: 'Plano Mensal',
        price: 5000, // R$ 50.00 in cents
        currency: 'BRL',
        interval: 'month',
        features: [
          'Tiragens ilimitadas',
          'Chat com Esmeralda',
          'Histórico completo',
          'Interpretações personalizadas',
          'Suporte prioritário'
        ]
      },
      {
        id: 'trial',
        name: 'Teste Grátis',
        price: 0,
        currency: 'BRL',
        interval: '3 days',
        features: [
          'Acesso completo por 3 dias',
          'Todas as funcionalidades',
          'Sem compromisso'
        ]
      }
    ];

    res.json({ plans });

  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Cancel subscription
router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const db = getDatabase();

    // Update user subscription
    await db.run(`
      UPDATE users 
      SET subscription_status = 'cancelled'
      WHERE id = ?
    `, [userId]);

    // Get updated user
    const user = await db.get(`
      SELECT id, name, email, sign, age, subscription_status, subscription_plan, 
             trial_ends_at, subscription_expires_at, created_at
      FROM users WHERE id = ?
    `, [userId]);

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
      message: 'Assinatura cancelada com sucesso',
      user: userResponse
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Webhook for payment events (mock)
router.post('/webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    // Mock webhook handling
    console.log('Webhook received:', type, data);

    switch (type) {
      case 'payment_intent.succeeded':
        // Handle successful payment
        console.log('Payment succeeded:', data.object.id);
        break;
      
      case 'payment_intent.payment_failed':
        // Handle failed payment
        console.log('Payment failed:', data.object.id);
        break;
      
      default:
        console.log('Unhandled event type:', type);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});

export default router; 