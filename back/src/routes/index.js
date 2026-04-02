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
//          SEÇÃO: CLIENTES (MySQL)
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

// 2. BUSCAR DADOS DE UM CLIENTE ESPECÍFICO
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
        const { nome, email, telefone, endereco, senha } = req.body;
        let fotoUrl = null; 
        
        if (req.file) {
            fotoUrl = await uploadImageToBlob(req.file);
        }

        const [rows] = await pool.execute(
            'INSERT INTO clientes (nome, email, telefone, endereco, foto_url, senha, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nome || null, email || null, telefone || null, endereco || null, fotoUrl, senha || '123456', 'cliente']
        );
        
        res.json({ id: rows.insertId, fotoUrl, status: "Cliente cadastrado!" });
    } catch (error) {
        console.error("Erro no cadastro:", error);
        res.status(500).json({ error: error.message });
    }
});

// 4. ATUALIZAR PERFIL DO CLIENTE (Suporte ao PerfilHUD)
router.put('/clientes/:id', upload.single('foto'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, telefone, endereco, cep, bairro, cidade, uf, foto_url } = req.body;
        let finalFotoUrl = foto_url; 

        if (req.file) {
            finalFotoUrl = await uploadImageToBlob(req.file);
        }

        const query = `
            UPDATE clientes 
            SET nome=?, email=?, telefone=?, endereco=?, foto_url=?, cep=?, bairro=?, cidade=?, uf=? 
            WHERE id=?
        `;
        
        await pool.execute(query, [
            nome || null, email || null, telefone || null, endereco || null, 
            finalFotoUrl || null, cep || null, bairro || null, cidade || null, uf || null, id
        ]);
        res.json({ message: "Perfil sincronizado!", foto_url: finalFotoUrl });
    } catch (error) {
        console.error("Erro no update do cliente:", error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
//          SEÇÃO: PRODUTOS (MySQL + Blob)
// ==========================================

router.get('/produtos', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM produtos');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/produtos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT * FROM produtos WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Item não encontrado" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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
        res.status(500).json({ error: error.message });
    }
});

router.put('/produtos/:id', upload.single('imagem'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, preco, estoque, categoria, imagemUrl } = req.body;
        let finalImagemUrl = imagemUrl; 

        if (req.file) {
            finalImagemUrl = await uploadImageToBlob(req.file);
        }

        const query = `
            UPDATE produtos 
            SET nome=?, descricao=?, preco=?, estoque=?, imagem_url=?, categoria=? 
            WHERE id=?
        `;
        
        await pool.execute(query, [nome || null, descricao || null, preco || 0, estoque || 0, finalImagemUrl || null, categoria || 'Geral', id]);
        res.json({ message: "Produto atualizado!", imagemUrl: finalImagemUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
//          SEÇÃO: PEDIDOS & CHECKOUT
// ==========================================

// LISTAR PEDIDOS DE UM CLIENTE
router.get('/pedidos/cliente/:id', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT * FROM pedidos WHERE cliente_id = ? ORDER BY data_pedido DESC',
            [req.params.id]
        );
        res.json(rows || []); 
    } catch (error) {
        res.status(500).json([]);
    }
});

// CHECKOUT COM TRANSAÇÃO (MySQL + Azure Tables + Atualização de Estoque)
router.post('/checkout', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { cliente_id, total, itens, pagamento } = req.body;

        // 1. Criar o pedido
        const [pedido] = await connection.execute(
            'INSERT INTO pedidos (cliente_id, total, status, metodo_pagamento) VALUES (?, ?, ?, ?)',
            [cliente_id || 1, total, 'Pago', pagamento]
        );
        const pedidoId = pedido.insertId;

        // 2. Itens e Estoque
        for (const item of itens) {
            await connection.execute(
                'INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
                [pedidoId, item.id, item.quantity, item.preco]
            );

            await connection.execute(
                'UPDATE produtos SET estoque = estoque - ? WHERE id = ?',
                [item.quantity, item.id]
            );
        }

        // 3. Azure Table Log
        const data = new Date();
        const partitionKey = `${data.getFullYear()}${String(data.getMonth() + 1).padStart(2, '0')}`;
        await tableOrdersClient.createEntity({
            partitionKey: partitionKey,
            rowKey: String(pedidoId),
            clienteId: String(cliente_id || 1),
            valorTotal: String(total),
            metodo: pagamento
        });

        await connection.commit();
        res.json({ message: "Transação concluída!", pedidoId });

    } catch (error) {
        await connection.rollback();
        console.error("Erro no Checkout:", error);
        res.status(500).json({ error: "Falha na transação de créditos." });
    } finally {
        connection.release();
    }
});

// ==========================================
//          SEÇÃO: ADMIN DASHBOARD
// ==========================================

router.get('/admin/stats', async (req, res) => {
    try {
        const [prodCount] = await pool.execute('SELECT COUNT(*) as total FROM produtos');
        const [cliCount] = await pool.execute('SELECT COUNT(*) as total FROM clientes');
        
        const entities = tableOrdersClient.listEntities();
        let totalPedidos = 0;
        let faturamento = 0;
        let pedidosRecentes = [];

        for await (const entity of entities) {
            totalPedidos++;
            faturamento += parseFloat(entity.valorTotal || 0);
            pedidosRecentes.push({
                rowKey: entity.rowKey,
                clienteId: entity.clienteId,
                valorTotal: entity.valorTotal,
                metodo: entity.metodo,
                timestamp: entity.timestamp
            });
        }

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

module.exports = router;