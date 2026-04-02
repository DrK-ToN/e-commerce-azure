const express = require('express');
const cors = require('cors');
const { z } = require('zod');
const { initTRPC, TRPCError } = require('@trpc/server');
const { createExpressMiddleware } = require('@trpc/server/adapters/express');
const pool = require('./database'); 
const superjson = require('superjson');
require('dotenv').config();


const app = express();

// --- 1. CONFIGURAÇÃO DE CORS ---
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000', 
    'https://e-commerce-azure-jet-rho.vercel.app'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || !origin) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-user-id, x-user-role');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// --- NOVOS IMPORTS PARA AZURE ---
const { BlobServiceClient } = require('@azure/storage-blob');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });


// --- CONFIGURAÇÃO AZURE ---
const AZURE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING; 
const containerName = "stoeverton";

// --- 2. INICIALIZAÇÃO tRPC COM CONTEXTO E SEGURANÇA ---
const t = initTRPC.context().create({
  transformer: superjson,
});

const isAutenticadoAdmin = t.middleware(({ ctx, next }) => {
  if (ctx.userRole !== 'admin') {
    throw new TRPCError({ 
      code: 'UNAUTHORIZED', 
      message: 'Acesso negado. Apenas administradores podem acessar.' 
    });
  }
  return next({ ctx });
});

const adminProcedure = t.procedure.use(isAutenticadoAdmin);

const appRouter = t.router({
  'admin.stats': adminProcedure.query(async () => {
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
      console.error("Erro tRPC stats:", error);
      return { totalProdutos: 0, totalClientes: 0, totalPedidos: 0, faturamentoTotal: 0, pedidosRecentes: [] };
    }
  }),
  

  'produtos.list': adminProcedure.query(async () => {
    try {
      const [rows] = await pool.query('SELECT * FROM produtos ORDER BY id DESC');
      return rows || [];
    } catch (error) {
      console.error("Erro ao listar produtos no tRPC:", error);
      return [];
    }
  }),

  // Dentro do seu appRouter no server.js
'produtos.delete': adminProcedure
  .input(z.object({ id: z.number() }))
  .mutation(async ({ input }) => {
    await pool.query('DELETE FROM produtos WHERE id = ?', [input.id]);
    return { success: true };
  }),

  'clientes.list': adminProcedure.query(async () => {
    const [rows] = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
    return rows || [];
  }),

  'clientes.update': adminProcedure
    .input(z.object({
      id: z.number(),
      nome: z.string().optional(),
      email: z.string().optional(),
      telefone: z.string().optional().nullable(),
      endereco: z.string().optional().nullable(),
      foto_url: z.string().optional().nullable(),
      cep: z.string().optional().nullable(),
      bairro: z.string().optional().nullable(),
      cidade: z.string().optional().nullable(),
      uf: z.string().optional().nullable(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...dados } = input;
      const colunas = Object.keys(dados).map(key => `\`${key}\`=?`).join(', ');
      const valores = [...Object.values(dados), id];

      const query = `UPDATE clientes SET ${colunas} WHERE id=?`;
      await pool.execute(query, valores);
      return { success: true };
    }),

    'pedidos.updateStatus': adminProcedure
  .input(z.object({ id: z.number(), status: z.string() }))
  .mutation(async ({ input }) => {
    await pool.execute('UPDATE pedidos SET status = ? WHERE id = ?', [input.status, input.id]);
    return { success: true };
  }),
  
  'pedidos.list': adminProcedure.query(async () => {
    const [rows] = await pool.query(`
      SELECT p.*, c.nome as cliente_nome 
      FROM pedidos p 
      LEFT JOIN clientes c ON p.cliente_id = c.id 
      ORDER BY p.data_pedido DESC
    `);
    return rows || [];
  }),
});

// Function to upload to Azure Blob Storage and optionally delete old blob
async function uploadToAzureBlob(file, blobNamePrefix, oldImageUrl = null) {
    if (!AZURE_CONNECTION_STRING) {
        console.error("AZURE_STORAGE_CONNECTION_STRING is not set.");
        throw new Error("Azure Storage connection string is missing.");
    }
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // GARANTIR QUE O CONTAINER EXISTA (Causa comum de erro 500)
    // Isso cria o container se ele não existir e o torna público para blobs.
    const createContainerResponse = await containerClient.createIfNotExists({
        access: 'blob' 
    });
    if (createContainerResponse.succeeded) {
        console.log(`Container "${containerName}" criado ou já existente.`);
    }

    // Delete old blob if provided and it's an Azure Blob URL
    if (oldImageUrl && oldImageUrl.includes(containerName)) {
        try {
            const urlParts = oldImageUrl.split('/');
            const oldBlobName = urlParts[urlParts.length - 1];
            const oldBlockBlobClient = containerClient.getBlockBlobClient(oldBlobName);
            await oldBlockBlobClient.deleteIfExists();
            console.log(`Old blob ${oldBlobName} deleted.`);
        } catch (e) {
            console.log("Aviso: Old blob not found or could not be deleted:", e.message);
        }
    }

    // Upload new blob
    // Sanitize the filename to prevent issues with special characters in the blob name
    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const blobName = `${blobNamePrefix}-${Date.now()}-${sanitizedFileName}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(file.buffer, {
        blobHTTPHeaders: { blobContentType: file.mimetype }
    });
    console.log(`New blob ${blobName} uploaded.`);
    return blockBlobClient.url;
}


// ==========================================
//    NOVA ROTA: UPLOAD DE FOTO (AZURE)
// ==========================================
app.post('/api/clientes/:id/upload-foto', upload.single('foto'), async (req, res) => {
  console.log("Recebendo pedido de upload para ID:", req.params.id);
    try {
        const clienteId = req.params.id;
        const file = req.file;
        if (!req.file) {
            console.log("Arquivo não chegou no multer");
            return res.status(400).json({ error: 'Arquivo vazio' });
        }
        
        console.log("Conectando ao Azure...");
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        
        // 1. Limpeza: Buscar foto antiga para deletar (se for um blob do Azure)
        const [rows] = await pool.execute('SELECT foto_url FROM clientes WHERE id = ?', [clienteId]);
        if (rows[0]?.foto_url && rows[0].foto_url.includes(containerName)) {
            try {
                const urlParts = rows[0].foto_url.split('/');
                const oldBlobName = urlParts[urlParts.length - 1];
                const oldBlockBlobClient = containerClient.getBlockBlobClient(oldBlobName);
                await oldBlockBlobClient.deleteIfExists();
            } catch (e) { console.log("Aviso: Foto antiga não encontrada no Azure."); }
        }

        // 2. Upload da Nova Foto (avatar)
        const blobName = `avatar-${clienteId}-${Date.now()}.jpg`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.uploadData(file.buffer, {
            blobHTTPHeaders: { blobContentType: file.mimetype }
        });

        const fotoUrl = blockBlobClient.url;

        // 3. Atualizar Banco
        await pool.execute('UPDATE clientes SET foto_url = ? WHERE id = ?', [fotoUrl, clienteId]);

        res.json({ foto_url: fotoUrl });
    } catch (error) {
        console.error("Erro Upload Azure:", error);
        res.status(500).json({ error: "Falha no processamento da imagem." });
    }
});

// ==========================================
//        ROTA DE CHECKOUT
// ==========================================
app.post('/api/checkout', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { cliente_id, total, pagamento, endereco, itens } = req.body;
        await connection.beginTransaction();

        const queryPedido = `INSERT INTO pedidos (cliente_id, total, status, data_pedido, pagamento, endereco) VALUES (?, ?, 'Pendente', NOW(), ?, ?)`;
        const [resultPedido] = await connection.execute(queryPedido, [cliente_id, total, pagamento, endereco || 'Não informado']);
        const pedidoId = resultPedido.insertId;

        if (itens && itens.length > 0) {
            const queryItens = `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES ?`;
            const valoresItens = itens.map(item => [pedidoId, item.id, item.quantity, item.preco]);
            await connection.query(queryItens, [valoresItens]);
        }

        await connection.commit();
        res.status(201).json({ message: "Transação concluída com sucesso!", pedidoId: pedidoId });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: "Falha ao processar pedido." });
    } finally {
        connection.release();
    }
});

// --- REST ROUTES ---
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.get('/api/produtos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM produtos');
    res.json(rows || []);
  } catch (error) { res.status(500).json([]); }
});

app.get('/api/produtos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM produtos WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Erro ao buscar produto por ID:", error);
    res.status(500).json({ error: "Falha ao buscar produto." });
  }
});

// ==========================================
//        ROTAS DE PRODUTOS (POST e PUT)
//        Adicionadas para resolver o problema de cadastro/edição
// ==========================================

// Rota para CADASTRAR NOVO PRODUTO
app.post('/api/produtos', upload.single('imagem'), async (req, res) => {
  try {
    const { nome, descricao, preco, estoque, categoria, marca } = req.body;
    let imagemUrl = null;

    if (req.file) {
      imagemUrl = await uploadToAzureBlob(req.file, 'produto');
    }

    const query = 'INSERT INTO produtos (nome, descricao, preco, estoque, imagem_url, categoria, marca) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const [rows] = await pool.execute(query, [nome || null, descricao || null, parseFloat(preco) || 0, parseInt(estoque) || 0, imagemUrl, categoria || 'Geral', marca || '']);

    res.status(201).json({ id: rows.insertId, imagemUrl, status: "Produto adicionado!" });
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    res.status(500).json({ error: "Falha ao cadastrar produto.", details: error.message });
  }
});

// Rota para ATUALIZAR PRODUTO EXISTENTE
app.put('/api/produtos/:id', upload.single('imagem'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, preco, estoque, categoria, marca, imagemUrl } = req.body; // imagemUrl é a URL existente se não houver novo arquivo
    let finalImagemUrl = imagemUrl;

    if (req.file) {
      // Busca a URL da imagem atual no banco para deletar o blob antigo
      const [currentProductRows] = await pool.execute('SELECT imagem_url FROM produtos WHERE id = ?', [id]);
      const oldImageUrl = currentProductRows[0]?.imagem_url;
      finalImagemUrl = await uploadToAzureBlob(req.file, 'produto', oldImageUrl);
    }

    const query = `
      UPDATE produtos
      SET nome=?, descricao=?, preco=?, estoque=?, imagem_url=?, categoria=?, marca=?
      WHERE id=?
    `;

    await pool.execute(query, [nome || null, descricao || null, parseFloat(preco) || 0, parseInt(estoque) || 0, finalImagemUrl || null, categoria || 'Geral', marca || '', id]);
    res.json({ message: "Produto atualizado!", imagemUrl: finalImagemUrl });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    res.status(500).json({ error: "Falha ao atualizar produto.", details: error.message });
  }
});

app.get('/api/clientes/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Não encontrado" });
        res.json(rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/clientes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, telefone, endereco, foto_url, cep, bairro, cidade, uf } = req.body;
        const query = `UPDATE clientes SET nome=?, email=?, telefone=?, endereco=?, foto_url=?, cep=?, bairro=?, cidade=?, uf=? WHERE id=?`;
        await pool.execute(query, [nome || null, email || null, telefone || null, endereco || null, foto_url || null, cep || null, bairro || null, cidade || null, uf || null, id]);
        res.json({ message: "Sincronizado!" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/pedidos/cliente/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM pedidos WHERE cliente_id = ? ORDER BY data_pedido DESC', [req.params.id]);
    res.json(rows || []);
  } catch (error) { res.status(500).json([]); }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        const [rows] = await pool.execute('SELECT * FROM clientes WHERE email = ? AND senha = ?', [email, senha]);
        if (rows.length === 0) return res.status(401).json({ message: "Inválidos" });
        const usuario = rows[0];
        delete usuario.senha;
        res.json({ user: usuario });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/cadastro', async (req, res) => {
    try {
        const { nome, email, senha } = req.body;
        const [existente] = await pool.execute('SELECT id FROM clientes WHERE email = ?', [email]);
        if (existente.length > 0) return res.status(400).json({ message: "E-mail em uso." });
        await pool.execute('INSERT INTO clientes (nome, email, senha, role) VALUES (?, ?, ?, ?)', [nome, email, senha, 'cliente']);
        res.status(201).json({ message: "Criado!" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- MIDDLEWARE tRPC ---
app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext: ({ req }) => ({
      userId: req.headers['x-user-id'] || null,
      userRole: req.headers['x-user-role'] || 'visitante'
    }),
  })
);

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Servidor na porta ${PORT}`));