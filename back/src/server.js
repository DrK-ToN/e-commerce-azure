const express = require('express');
const cors = require('cors');
const { z } = require('zod');
const { initTRPC } = require('@trpc/server');
const { createExpressMiddleware } = require('@trpc/server/adapters/express');
const pool = require('./database'); 
const superjson = require('superjson');
require('dotenv').config();

const app = express();

// --- CONFIGURAÇÃO DE CORS (UNIFICADA) ---
app.use(cors({
  origin: [
    'https://e-commerce-azure-68bc9x78o-everton-freitas-projects-2b6b7501.vercel.app',
    'https://e-commerce-azure-jet-rho.vercel.app', // Removi a barra no final (importante!)
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

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
      console.error("Erro SQL Stats:", error.message);
      return { totalProdutos: 0, totalClientes: 0, totalPedidos: 0, faturamentoTotal: 0, pedidosRecentes: [] };
    }
  }),

  'produtos.list': t.procedure.query(async () => {
    const [rows] = await pool.query('SELECT * FROM produtos ORDER BY id DESC');
    return rows;
  }),

  'pedidos.list': t.procedure.query(async () => {
    const [rows] = await pool.query(`
      SELECT p.*, c.nome as cliente_nome 
      FROM pedidos p 
      LEFT JOIN clientes c ON p.cliente_id = c.id 
      ORDER BY p.data_pedido DESC
    `);
    return rows;
  }),

  // Adicione aqui as outras rotas mutation (update, delete) que você já tem...
});

// --- ROTAS REST ---

// Rota simplificada para o catálogo
app.get('/api/produtos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM produtos');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Importando as rotas do arquivo separado (routes/index.js)
const routes = require('./routes/index'); 
app.use('/api', routes);

// --- MIDDLEWARE tRPC ---
app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  })
);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Backend rodando na porta ${PORT}`);
});