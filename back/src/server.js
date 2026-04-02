const express = require('express');
const cors = require('cors');
const { z } = require('zod');
const { initTRPC } = require('@trpc/server');
const { createExpressMiddleware } = require('@trpc/server/adapters/express');
const pool = require('./database'); 
const superjson = require('superjson');
require('dotenv').config();

const app = express();

// --- CORS ---
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// app.use(cors(corsOptions));
// app.options('/{*splat}', cors(corsOptions)); // preflight com as mesmas opções

app.use(express.json());

// --- INICIALIZAÇÃO tRPC ---
const t = initTRPC.create({
  transformer: superjson,
});

const appRouter = t.router({
  'admin.stats': t.procedure.query(async () => {
    try {
      const [prodRes] = await pool.query('SELECT COUNT(*) as total_p FROM produtos');
      const [cliRes] = await pool.query('SELECT COUNT(*) as total_c FROM clientes');
      const [ordRes] = await pool.query('SELECT COALESCE(SUM(`total`), 0) as faturamento, COUNT(*) as qtd FROM pedidos');
      return {
        totalProdutos: prodRes[0].total_p || 0,
        totalClientes: cliRes[0].total_c || 0,
        totalPedidos: ordRes[0].qtd || 0,
        faturamentoTotal: ordRes[0].faturamento || 0,
        pedidosRecentes: [] 
      };
    } catch (error) {
      return { totalProdutos: 0, totalClientes: 0, totalPedidos: 0, faturamentoTotal: 0, pedidosRecentes: [] };
    }
  }),
  
  'pedidos.list': t.procedure.query(async () => {
    const [rows] = await pool.query(`
      SELECT p.*, c.nome as cliente_nome 
      FROM pedidos p 
      LEFT JOIN clientes c ON p.cliente_id = c.id 
      ORDER BY p.data_pedido DESC
    `);
    return rows || [];
  }),
});

// --- ROTAS REST ---
app.get('/api/pedidos/cliente/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM pedidos WHERE cliente_id = ? ORDER BY data_pedido DESC',
      [req.params.id]
    );
    res.json(rows || []);
  } catch (error) {
    console.error("Erro Pedidos:", error.message);
    res.status(500).json([]); 
  }
});

app.get('/api/produtos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM produtos');
    res.json(rows || []);
  } catch (error) {
    res.status(500).json([]);
  }
});

// --- MIDDLEWARE tRPC ---
app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  })
);

const PORT = process.env.PORT || 3001; 

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend rodando na porta ${PORT}`);
});