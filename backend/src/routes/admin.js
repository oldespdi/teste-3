import express from 'express';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/init.js';
import { generateMysticalAdvice } from '../services/ai.js';

const router = express.Router();
const db = getDatabase();

// Middleware to verify admin token
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if user is admin
    if (decoded.email !== 'admin@oraculo.com') {
      return res.status(403).json({ error: 'Acesso negado - Apenas administradores' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Get admin statistics
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const db = getDatabase();

    // Get user statistics
    const allUsers = db.getUsers();
    const totalUsers = allUsers.length;
    const activeSubscriptions = allUsers.filter(user => 
      user.subscription_status === 'active' && 
      (!user.subscription_expires_at || new Date(user.subscription_expires_at) > new Date())
    ).length;
    const trialUsers = allUsers.filter(user => 
      user.subscription_status === 'trial' && 
      (!user.trial_ends_at || new Date(user.trial_ends_at) > new Date())
    ).length;

    // Get activity statistics
    const totalReadings = db.getReadings().length;
    const totalChats = db.getChatSessions().length;

    // Calculate revenue (mock data for now)
    const revenue = activeSubscriptions * 50; // R$ 50 per active subscription

    const stats = {
      totalUsers,
      activeSubscriptions,
      trialUsers,
      totalReadings,
      totalChats,
      revenue
    };

    res.json({ stats });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get all users
router.get('/users', authenticateAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const db = getDatabase();

    let users = db.getUsers();

    // Filter by status
    if (status) {
      users = users.filter(user => user.subscription_status === status);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user => 
        user.name.toLowerCase().includes(searchLower) || 
        user.email.toLowerCase().includes(searchLower)
      );
    }

    // Get total count
    const totalCount = users.length;

    // Sort and paginate
    users = users
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice((page - 1) * limit, page * limit);

    const formattedUsers = users.map(user => ({
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
    }));

    res.json({
      users: formattedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get user details
router.get('/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const user = db.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Get user's readings
    const readings = db.getReadingsByUserId(id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Get user's chat sessions
    const chatSessions = db.getChatSessionsByUserId(id).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    const userDetails = {
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
      createdAt: user.created_at,
      activity: {
        totalReadings: readings.length,
        totalChats: chatSessions.length,
        lastReading: readings[0]?.created_at,
        lastChat: chatSessions[0]?.updated_at
      }
    };

    res.json({ user: userDetails });

  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Update user subscription
router.put('/users/:id/subscription', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, plan, expiresAt } = req.body;
    const db = getDatabase();

    // Validate status
    const validStatuses = ['trial', 'active', 'expired', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    // Update user subscription
    const updatedUser = await db.updateUser(id, {
      subscription_status: status,
      subscription_plan: plan,
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
      message: 'Assinatura atualizada com sucesso',
      user: userResponse
    });

  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Get system activity
router.get('/activity', authenticateAdmin, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const db = getDatabase();

    // Get recent readings
    const recentReadings = await db.all(`
      SELECT r.*, u.name as user_name
      FROM readings r
      JOIN users u ON r.user_id = u.id
      WHERE r.created_at >= datetime('now', '-${days} days')
      ORDER BY r.created_at DESC
      LIMIT 50
    `);

    // Get recent chat sessions
    const recentChats = await db.all(`
      SELECT cs.*, u.name as user_name
      FROM chat_sessions cs
      JOIN users u ON cs.user_id = u.id
      WHERE cs.updated_at >= datetime('now', '-${days} days')
      ORDER BY cs.updated_at DESC
      LIMIT 50
    `);

    // Get new users
    const newUsers = await db.all(`
      SELECT id, name, email, subscription_status, created_at
      FROM users
      WHERE created_at >= datetime('now', '-${days} days')
      ORDER BY created_at DESC
      LIMIT 50
    `);

    const activity = {
      readings: recentReadings.map(r => ({
        id: r.id,
        userId: r.user_id,
        userName: r.user_name,
        spread: r.spread,
        question: r.question,
        createdAt: r.created_at
      })),
      chats: recentChats.map(c => ({
        id: c.id,
        userId: c.user_id,
        userName: c.user_name,
        createdAt: c.created_at,
        updatedAt: c.updated_at
      })),
      newUsers: newUsers.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        subscriptionStatus: u.subscription_status,
        createdAt: u.created_at
      }))
    };

    res.json({ activity });

  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Generate report
router.post('/reports', authenticateAdmin, async (req, res) => {
  try {
    const { type, startDate, endDate } = req.body;
    const db = getDatabase();

    let report = {};

    switch (type) {
      case 'users':
        const usersReport = await db.all(`
          SELECT 
            subscription_status,
            COUNT(*) as count,
            DATE(created_at) as date
          FROM users
          WHERE created_at BETWEEN ? AND ?
          GROUP BY subscription_status, DATE(created_at)
          ORDER BY date DESC
        `, [startDate, endDate]);
        report = { users: usersReport };
        break;

      case 'readings':
        const readingsReport = await db.all(`
          SELECT 
            spread,
            COUNT(*) as count,
            DATE(created_at) as date
          FROM readings
          WHERE created_at BETWEEN ? AND ?
          GROUP BY spread, DATE(created_at)
          ORDER BY date DESC
        `, [startDate, endDate]);
        report = { readings: readingsReport };
        break;

      case 'revenue':
        // Mock revenue report
        const activeUsers = await db.get(`
          SELECT COUNT(*) as count FROM users 
          WHERE subscription_status = 'active'
        `);
        report = {
          revenue: {
            total: activeUsers.count * 50,
            activeSubscriptions: activeUsers.count,
            monthlyRate: 50
          }
        };
        break;

      default:
        return res.status(400).json({ error: 'Tipo de relatório inválido' });
    }

    res.json({
      message: 'Relatório gerado com sucesso',
      report,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Novo endpoint: cadastro e atualização de dados do cliente
router.post('/cliente', async (req, res) => {
  try {
    const { id, name, email, password, sign, birthdate, preferences } = req.body;
    let user = db.getUserByEmail(email);
    if (user) {
      // Atualizar usuário existente
      user = await db.updateUser(user.id, { name, password, sign, birthdate, preferences });
      return res.json({ success: true, user, updated: true });
    } else {
      // Criar novo usuário
      const newUser = await db.createUser({
        id: Date.now().toString(),
        name,
        email,
        password,
        sign,
        birthdate,
        preferences
      });
      return res.json({ success: true, user: newUser, created: true });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mensagens do dia para cada signo (mock)
const mensagensSignos = {
  Aries: 'Hoje é um dia de ação e coragem para Áries!',
  Touro: 'Taurinos devem buscar estabilidade e conforto.',
  Gemeos: 'Geminianos terão oportunidades de comunicação.',
  Cancer: 'Cancerianos sentirão emoções à flor da pele.',
  Leao: 'Leoninos brilharão em qualquer situação.',
  Virgem: 'Virginianos devem focar nos detalhes.',
  Libra: 'Librianos encontrarão equilíbrio.',
  Escorpiao: 'Escorpianos terão intensidade e paixão.',
  Sagitario: 'Sagitarianos viverão aventuras.',
  Capricornio: 'Capricornianos terão conquistas profissionais.',
  Aquario: 'Aquarianos inovarão.',
  Peixes: 'Piscianos terão intuição aguçada.'
};

// Endpoint: mensagem do dia para o signo
router.get('/signo-mensagem/:signo', (req, res) => {
  const signo = req.params.signo;
  const mensagem = mensagensSignos[signo] || 'Signo não encontrado.';
  res.json({ signo, mensagem });
});

// Função mock para fase da lua
function getFaseLua() {
  // Mock: alterna entre 4 fases
  const fases = ['Nova', 'Crescente', 'Cheia', 'Minguante'];
  const dia = new Date().getDate();
  return fases[dia % 4];
}

// Endpoint: fase da lua atual
router.get('/fases-da-lua', (req, res) => {
  const fase = getFaseLua();
  res.json({ fase });
});

// Mock de cartas do tarô cigano
const cartasCiganas = [
  { id: 1, nome: 'O Cavaleiro', significado: 'Novidades, movimento, chegada de algo.' },
  { id: 2, nome: 'O Trevo', significado: 'Sorte, oportunidades passageiras.' },
  { id: 3, nome: 'O Navio', significado: 'Viagens, mudanças, comércio.' },
  { id: 4, nome: 'A Casa', significado: 'Lar, família, segurança.' },
  { id: 5, nome: 'A Árvore', significado: 'Crescimento, saúde, raízes.' }
];

// Endpoint: tiragem de cartas do tarô cigano
router.get('/taro-cigano', (req, res) => {
  // Sorteia 3 cartas
  const sorteio = [];
  const usadas = new Set();
  while (sorteio.length < 3) {
    const idx = Math.floor(Math.random() * cartasCiganas.length);
    if (!usadas.has(idx)) {
      usadas.add(idx);
      sorteio.push(cartasCiganas[idx]);
    }
  }
  res.json({ cartas: sorteio });
});

// Simpatias populares
const simpatias = [
  {
    id: 1,
    nome: 'Simpatia para Amor',
    descricao: 'Para atrair amor verdadeiro',
    ingredientes: ['Vela rosa', 'Rosa vermelha', 'Mel', 'Papel branco'],
    instrucoes: 'Acenda a vela rosa, escreva seu desejo no papel, coloque a rosa e o mel. Deixe queimar até o fim.',
    categoria: 'amor'
  },
  {
    id: 2,
    nome: 'Simpatia para Prosperidade',
    descricao: 'Para atrair dinheiro e abundância',
    ingredientes: ['Vela dourada', 'Canela em pó', 'Moedas', 'Terra'],
    instrucoes: 'Acenda a vela dourada, polvilhe canela, coloque as moedas na terra. Visualize a prosperidade.',
    categoria: 'prosperidade'
  },
  {
    id: 3,
    nome: 'Simpatia para Proteção',
    descricao: 'Para se proteger de energias negativas',
    ingredientes: ['Vela branca', 'Sal grosso', 'Alecrim', 'Copo com água'],
    instrucoes: 'Acenda a vela branca, coloque sal grosso nos cantos da casa, banhe-se com água e alecrim.',
    categoria: 'protecao'
  }
];

// Tipos de amarração
const amaracoes = [
  {
    id: 1,
    nome: 'Amarração de Amor',
    descricao: 'Para unir corações e fortalecer relacionamentos',
    duracao: '21 dias',
    intensidade: 'Média',
    ingredientes: ['Fita vermelha', 'Vela rosa', 'Rosa vermelha', 'Mel'],
    instrucoes: 'Faça 7 nós na fita vermelha, acenda a vela rosa, recite orações por 21 dias.',
    categoria: 'amor'
  },
  {
    id: 2,
    nome: 'Amarração de Proteção',
    descricao: 'Para proteger contra inveja e energias negativas',
    duracao: '7 dias',
    intensidade: 'Forte',
    ingredientes: ['Vela branca', 'Sal grosso', 'Alecrim', 'Fita azul'],
    instrucoes: 'Acenda a vela branca, coloque sal grosso, amarre a fita azul no pulso.',
    categoria: 'protecao'
  },
  {
    id: 3,
    nome: 'Amarração de Prosperidade',
    descricao: 'Para atrair dinheiro e oportunidades',
    duracao: '14 dias',
    intensidade: 'Média',
    ingredientes: ['Vela dourada', 'Canela', 'Moedas', 'Fita dourada'],
    instrucoes: 'Acenda a vela dourada, coloque as moedas, amarre a fita dourada.',
    categoria: 'prosperidade'
  }
];

// Endpoint: listar simpatias
router.get('/simpatias', (req, res) => {
  const categoria = req.query.categoria;
  let resultado = simpatias;
  
  if (categoria) {
    resultado = simpatias.filter(s => s.categoria === categoria);
  }
  
  res.json({ simpatias: resultado });
});

// Endpoint: simpatia específica
router.get('/simpatias/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const simpatia = simpatias.find(s => s.id === id);
  
  if (!simpatia) {
    return res.status(404).json({ error: 'Simpatia não encontrada' });
  }
  
  res.json({ simpatia });
});

// Endpoint: listar amarrações
router.get('/amaracoes', (req, res) => {
  const categoria = req.query.categoria;
  let resultado = amaracoes;
  
  if (categoria) {
    resultado = amaracoes.filter(a => a.categoria === categoria);
  }
  
  res.json({ amaracoes: resultado });
});

// Endpoint: amarração específica
router.get('/amaracoes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const amaracao = amaracoes.find(a => a.id === id);
  
  if (!amaracao) {
    return res.status(404).json({ error: 'Amarração não encontrada' });
  }
  
  res.json({ amaracao });
});

// Endpoint: consulta personalizada de simpatia/amarração
router.post('/consulta-mistica', async (req, res) => {
  try {
    const { objetivo, categoria, intensidade } = req.body;
    
    // Lógica para recomendar simpatia ou amarração baseada nos parâmetros
    let recomendacao;
    
    if (intensidade === 'forte') {
      recomendacao = amaracoes.find(a => a.categoria === categoria);
    } else {
      recomendacao = simpatias.find(s => s.categoria === categoria);
    }
    
    if (!recomendacao) {
      recomendacao = simpatias[0]; // Fallback
    }
    
    const mensagem = `Para ${objetivo}, recomendo: ${recomendacao.nome}. ${recomendacao.descricao}`;
    
    res.json({
      objetivo,
      recomendacao,
      mensagem,
      tipo: intensidade === 'forte' ? 'amarração' : 'simpatia'
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: registrar simpatia realizada
router.post('/simpatias/realizar', async (req, res) => {
  try {
    const { user_id, simpatia_id, objetivo, data_inicio, observacoes } = req.body;
    
    const simpatiaRealizada = {
      id: Date.now().toString(),
      user_id,
      simpatia_id,
      objetivo,
      data_inicio: data_inicio || new Date().toISOString(),
      status: 'em_andamento',
      observacoes: observacoes || '',
      resultado: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const resultado = await db.createSimpatiaRealizada(simpatiaRealizada);
    
    res.json({
      success: true,
      simpatia_realizada: resultado,
      mensagem: 'Simpatia registrada com sucesso! Siga as instruções com fé e determinação.'
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: atualizar status de simpatia
router.put('/simpatias/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resultado, observacoes } = req.body;
    
    const atualizacao = {
      status,
      resultado: resultado || '',
      observacoes: observacoes || '',
      updated_at: new Date().toISOString()
    };
    
    const resultado_atualizado = await db.updateSimpatiaRealizada(id, atualizacao);
    
    if (!resultado_atualizado) {
      return res.status(404).json({ error: 'Simpatia não encontrada' });
    }
    
    res.json({
      success: true,
      simpatia_atualizada: resultado_atualizado
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: registrar amarração realizada
router.post('/amaracoes/realizar', async (req, res) => {
  try {
    const { user_id, amaracao_id, objetivo, data_inicio, observacoes } = req.body;
    
    const amaracaoRealizada = {
      id: Date.now().toString(),
      user_id,
      amaracao_id,
      objetivo,
      data_inicio: data_inicio || new Date().toISOString(),
      status: 'em_andamento',
      observacoes: observacoes || '',
      resultado: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const resultado = await db.createAmaracaoRealizada(amaracaoRealizada);
    
    res.json({
      success: true,
      amaracao_realizada: resultado,
      mensagem: 'Amarração registrada com sucesso! Mantenha a fé e siga as instruções com dedicação.'
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: atualizar status de amarração
router.put('/amaracoes/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resultado, observacoes } = req.body;
    
    const atualizacao = {
      status,
      resultado: resultado || '',
      observacoes: observacoes || '',
      updated_at: new Date().toISOString()
    };
    
    const resultado_atualizado = await db.updateAmaracaoRealizada(id, atualizacao);
    
    if (!resultado_atualizado) {
      return res.status(404).json({ error: 'Amarração não encontrada' });
    }
    
    res.json({
      success: true,
      amaracao_atualizada: resultado_atualizado
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: histórico de simpatias e amarrações do usuário
router.get('/historico-mistico/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    
    const simpatias = db.getSimpatiasByUserId(user_id);
    const amaracoes = db.getAmaracoesByUserId(user_id);
    
    res.json({
      simpatias,
      amaracoes,
      total_simpatias: simpatias.length,
      total_amaracoes: amaracoes.length
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint: conselho místico personalizado com IA
router.post('/conselho-mistico', async (req, res) => {
  try {
    const { objetivo, categoria, intensidade } = req.body;
    
    // Gerar conselho personalizado com IA
    const conselho = await generateMysticalAdvice(objetivo, categoria, intensidade);
    
    // Buscar recomendações específicas
    let recomendacao;
    if (intensidade === 'forte') {
      recomendacao = amaracoes.find(a => a.categoria === categoria);
    } else {
      recomendacao = simpatias.find(s => s.categoria === categoria);
    }
    
    res.json({
      objetivo,
      categoria,
      intensidade,
      conselho,
      recomendacao,
      tipo: intensidade === 'forte' ? 'amarração' : 'simpatia'
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 