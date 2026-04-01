const express = require('express');
const cors = require('cors');
const { z } = require('zod');
const mysql = require('mysql2/promise');
const { initTRPC } = require('@trpc/server');
const { createExpressMiddleware } = require('@trpc/server/adapters/express');
const pool = require('./database'); // AQUI JÁ ESTÁ O POOL, NÃO PRECISA RE-DECLARAR
const superjson = require('superjson');
require('dotenv').config();

// 2. Inicialização do tRPC
const t = initTRPC.create({
  transformer: superjson,
});

const appRouter = t.router({
  // Rota para o Dashboard de Admin (O que estava dando erro 500)
  'admin.stats': t.procedure.query(async () => {
    try {
      // 1. Contagem de produtos (Alias 'total_p' para não confundir)
      const [prodRes] = await pool.query('SELECT COUNT(*) as total_p FROM produtos');
      
      // 2. Contagem de clientes (Alias 'total_c')
      const [cliRes] = await pool.query('SELECT COUNT(*) as total_c FROM clientes');
      
      // 3. Soma da coluna 'total' e contagem de pedidos
      // O COALESCE evita que o faturamento quebre se a tabela estiver vazia
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

  // Dentro do seu appRouter no server.js
'produtos.list': t.procedure.query(async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM produtos ORDER BY id DESC');
    return rows;
  } catch (error) {
    console.error("Erro ao listar produtos:", error);
    return [];
  }
}),

// Rota para Editar Produto
'produtos.update': t.procedure
  .input(z.object({
    id: z.number(),
    nome: z.string(),
    marca: z.string(),
    descricao: z.string(),
    preco: z.number(),
    estoque: z.number(),
    categoria: z.string()
  }))
  .mutation(async ({ input }) => {
    try {
      const { id, nome, marca, descricao, preco, estoque, categoria } = input;
      await pool.query(
        'UPDATE produtos SET nome=?, marca=?, descricao=?, preco=?, estoque=?, categoria=? WHERE id=?',
        [nome, marca, descricao, preco, estoque, categoria, id]
      );
      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      throw new Error("Falha ao atualizar produto no Azure");
    }
  }),

// Rota de deleção (usando o ID para o Azure MySQL)
'produtos.delete': t.procedure.input(Number).mutation(async ({ input }) => {
  try {
    await pool.query('DELETE FROM produtos WHERE id = ?', [input]);
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    throw new Error("Falha ao remover produto do Azure");
  }
}),

  'auth.me': t.procedure.query(async () => {
    return { id: 1, name: "Everton Admin", role: "admin" };
  }),
  
  'clientes.list': t.procedure.query(async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM clientes ORDER BY data_criacao DESC');
    return rows;
  } catch (error) {
    console.error("Erro ao listar clientes:", error);
    return [];
  }
}),

// Rota para Editar Cliente
'clientes.update': t.procedure
  .input(z.object({
    id: z.number(),
    nome: z.string(),
    email: z.string(),
    telefone: z.string(),
    endereco: z.string()
  }))
  .mutation(async ({ input }) => {
    try {
      const { id, nome, email, telefone, endereco } = input;
      await pool.query(
        'UPDATE clientes SET nome=?, email=?, telefone=?, endereco=? WHERE id=?',
        [nome, email, telefone, endereco, id]
      );
      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      throw new Error("Falha ao atualizar cliente");
    }
  }),

  'pedidos.list': t.procedure.query(async () => {
  try {
    // Fazemos um JOIN para pegar o nome do cliente junto com o pedido
    const [rows] = await pool.query(`
      SELECT 
        p.id, 
        p.data_pedido, 
        p.total, 
        p.status, 
        p.metodo_pagamento,
        c.nome as cliente_nome
      FROM pedidos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      ORDER BY p.data_pedido DESC
    `);
    return rows;
  } catch (error) {
    console.error("Erro ao listar pedidos:", error);
    return [];
  }
}),

// Rota para Atualizar Status do Pedido (Geralmente é o que se edita em pedidos)
'pedidos.updateStatus': t.procedure
  .input(z.object({
    id: z.number(),
    status: z.enum(['Pendente', 'Pago', 'Enviado', 'Entregue'])
  }))
  .mutation(async ({ input }) => {
    try {
      const { id, status } = input;
      await pool.query('UPDATE pedidos SET status=? WHERE id=?', [status, id]);
      return { success: true };
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
      throw new Error("Falha ao atualizar status do pedido");
    }
  }),
});

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// --- ROTA REST PARA O CATÁLOGO (O que o Produtos.js chama) ---
app.get('/api/produtos', async (req, res) => {
  try {
    // IMPORTANTE: Se sua tabela no Azure for 'produtos', use 'produtos'
    const [rows] = await pool.query('SELECT * FROM produtos');
    res.json(rows);
  } catch (error) {
    console.error("Erro no MySQL (Produtos):", error.message);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
});

// Suas rotas REST antigas
const routes = require('./routes/index'); 
app.use('/api', routes);

// Rota do tRPC
app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  })
);


const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});