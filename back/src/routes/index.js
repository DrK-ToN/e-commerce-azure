const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../database');
const { uploadImageToBlob } = require('../services/blobService');
const { tableOrdersClient } = require("../config/azureProvider");

const upload = multer(); // Middleware para processar Multipart Form-Data (Arquivos + Texto)

// --- ROTA DE TESTE ---
router.get('/teste', (req, res) => {
    res.send("A rota está funcionando!");
});

// ==========================================
//        SEÇÃO: CLIENTES (MySQL)
// ==========================================

// 1. LISTAR TODOS OS CLIENTES
router.get('/clientes', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM clientes ORDER BY data_criacao DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. BUSCAR DADOS DE UM CLIENTE ESPECÍFICO (Para Edição)
router.get('/clientes/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Cliente não encontrado" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. CADASTRAR NOVO CLIENTE
router.post('/clientes', upload.single('foto'), async (req, res) => {
    try {
        const { nome, email, telefone, endereco } = req.body;
        let fotoUrl = null; 
        
        if (req.file) {
            fotoUrl = await uploadImageToBlob(req.file);
        }

        const [rows] = await pool.execute(
            'INSERT INTO clientes (nome, email, telefone, endereco, foto_url) VALUES (?, ?, ?, ?, ?)',
            [nome || null, email || null, telefone || null, endereco || null, fotoUrl]
        );
        
        res.json({ id: rows.insertId, fotoUrl, status: "Cliente cadastrado!" });
    } catch (error) {
        console.error("Erro no cadastro:", error);
        res.status(500).json({ error: error.message });
    }
});

// 4. ATUALIZAR PERFIL DO CLIENTE (PUT)
router.put('/clientes/:id', upload.single('foto'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, telefone, endereco } = req.body;
        let fotoUrl = req.body.foto_url; // Mantém a URL atual se não enviar arquivo novo

        if (req.file) {
            fotoUrl = await uploadImageToBlob(req.file);
        }

        const query = `
            UPDATE clientes 
            SET nome=?, email=?, telefone=?, endereco=?, foto_url=? 
            WHERE id=?
        `;
        
        await pool.execute(query, [nome || null, email || null, telefone || null, endereco || null, fotoUrl || null, id]);
        res.json({ message: "Perfil sincronizado!", foto_url: fotoUrl });
    } catch (error) {
        console.error("Erro no update do cliente:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
//        SEÇÃO: PRODUTOS (MySQL + Blob)
// ==========================================

// 1. LISTAR TODOS OS PRODUTOS
router.get('/produtos', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM produtos');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. BUSCAR PRODUTO POR ID (Para Edição)
router.get('/produtos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT * FROM produtos WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Item não encontrado" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. CADASTRAR PRODUTO (ADMIN)
router.post('/produtos', upload.single('imagem'), async (req, res) => {
    try {
        const { nome, descricao, preco, estoque, categoria } = req.body;
        let imagemUrl = null;

        if (req.file) {
            imagemUrl = await uploadImageToBlob(req.file);
        }

        const query = 'INSERT INTO produtos (nome, descricao, preco, estoque, imagem_url, categoria) VALUES (?, ?, ?, ?, ?, ?)';
        const [rows] = await pool.execute(query, [nome || null, descricao || null, preco || 0, estoque || 0, imagemUrl, categoria || 'Geral']);

        res.json({ id: rows.insertId, imagemUrl, status: "Produto adicionado!" });
    } catch (error) {
        console.error("❌ Erro no cadastro de produto:", error);
        res.status(500).json({ error: error.message });
    }
});

// 4. ATUALIZAR PRODUTO (PUT)
router.put('/produtos/:id', upload.single('imagem'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, preco, estoque, categoria } = req.body;
        let imagemUrl = req.body.imagemUrl; 

        if (req.file) {
            imagemUrl = await uploadImageToBlob(req.file);
        }

        const query = `
            UPDATE produtos 
            SET nome=?, descricao=?, preco=?, estoque=?, imagem_url=?, categoria=? 
            WHERE id=?
        `;
        
        await pool.execute(query, [nome || null, descricao || null, preco || 0, estoque || 0, imagemUrl || null, categoria || 'Geral', id]);
        res.json({ message: "Produto atualizado!", imagemUrl });
    } catch (error) {
        console.error("Erro no PUT produtos:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
//        SEÇÃO: PEDIDOS (Checkout + Table Storage)
// ==========================================

rrouter.get('/pedidos/cliente/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM pedidos WHERE cliente_id = ? ORDER BY data_pedido DESC',
            [req.params.id]
        );
        // Garante que sempre envie um array, mesmo vazio
        res.json(rows || []); 
    } catch (error) {
        console.error(error);
        res.status(500).json([]); // Envia array vazio em caso de erro para não quebrar o front
    }
});

router.post('/checkout', async (req, res) => {
    try {
        const { cliente_id, total, itens, pagamento } = req.body;

        // 1. Salva o Pedido Principal no MySQL
        const [pedido] = await pool.execute(
            'INSERT INTO pedidos (cliente_id, total, status, metodo_pagamento) VALUES (?, ?, ?, ?)',
            [cliente_id || 1, total, 'Pago', pagamento]
        );
        const pedidoId = pedido.insertId;

        // 2. Salva os Itens do Pedido no MySQL
        for (const item of itens) {
            await pool.execute(
                'INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
                [pedidoId, item.id, item.quantity, item.preco]
            );
        }

        // 3. LOG NO AZURE TABLES (Para Performance Analítica)
        const data = new Date();
        const partitionKey = `${data.getFullYear()}${String(data.getMonth() + 1).padStart(2, '0')}`;
        
        await tableOrdersClient.createEntity({
            partitionKey: partitionKey,
            rowKey: String(pedidoId),
            clienteId: String(cliente_id || 1),
            valorTotal: total,
            qtdItens: itens.length,
            metodo: pagamento
        });

        res.json({ message: "Pedido finalizado com sucesso!", pedidoId });
    } catch (error) {
        console.error("Erro no checkout:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
//        SEÇÃO: DASHBOARD (MySQL + Azure Tables)
// ==========================================

router.get('/admin/stats', async (req, res) => {
    try {
        // 1. Contagens rápidas no MySQL
        const [prodCount] = await pool.execute('SELECT COUNT(*) as total FROM produtos');
        const [cliCount] = await pool.execute('SELECT COUNT(*) as total FROM clientes');
        
        // 2. Estatísticas do Azure Tables (Escalabilidade)
        const entities = tableOrdersClient.listEntities();
        let totalPedidos = 0;
        let faturamento = 0;
        let pedidosRecentes = [];

        for await (const entity of entities) {
            totalPedidos++;
            faturamento += parseFloat(entity.valorTotal || 0);
            pedidosRecentes.push(entity);
        }

        // Ordenar recentes e pegar os últimos 5
        pedidosRecentes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({
            totalProdutos: prodCount[0].total,
            totalClientes: cliCount[0].total,
            totalPedidos,
            faturamentoTotal: faturamento.toFixed(2),
            pedidosRecentes: pedidosRecentes.slice(0, 5)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
//        SEÇÃO: Checkout 
// ==========================================


router.post('/checkout', async (req, res) => {
    const connection = await pool.getConnection(); // Pegamos uma conexão para a transação
    try {
        await connection.beginTransaction(); // Início da transação

        const { cliente_id, total, itens, pagamento } = req.body;

        // 1. Criar o registro na tabela 'pedidos'
        const [pedido] = await connection.execute(
            'INSERT INTO pedidos (cliente_id, total, status, metodo_pagamento) VALUES (?, ?, ?, ?)',
            [cliente_id || 1, total, 'Pago', pagamento]
        );
        const pedidoId = pedido.insertId;

        // 2. Loop para processar cada item
        for (const item of itens) {
            // A - Salvar na tabela 'itens_pedido'
            await connection.execute(
                'INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
                [pedidoId, item.id, item.quantity, item.preco]
            );

            // B - ATUALIZAR ESTOQUE: Diminuir a quantidade do produto
            await connection.execute(
                'UPDATE produtos SET estoque = estoque - ? WHERE id = ?',
                [item.quantity, item.id]
            );
        }

        // 3. LOG NO AZURE TABLES (Analítico para o Dashboard)
        const data = new Date();
        const partitionKey = `${data.getFullYear()}${String(data.getMonth() + 1).padStart(2, '0')}`;
        await tableOrdersClient.createEntity({
            partitionKey: partitionKey,
            rowKey: String(pedidoId),
            clienteId: String(cliente_id || 1),
            valorTotal: total,
            metodo: pagamento
        });

        await connection.commit(); // Tudo deu certo! Salva no banco permanentemente.
        res.json({ message: "Transação concluída!", pedidoId });

    } catch (error) {
        await connection.rollback(); // Deu erro! Desfaz tudo o que foi feito na transação.
        console.error("Erro no Checkout:", error);
        res.status(500).json({ error: "Falha na transação de créditos." });
    } finally {
        connection.release(); // Libera a conexão de volta para o pool
    }
});

module.exports = router;