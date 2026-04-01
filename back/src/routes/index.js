const express = require('express');
const router = express.Router();
const multer = require('multer');
const pool = require('../config/db');
const { uploadImageToBlob } = require('../services/blobService');

const upload = multer(); // Para ler arquivos do Form-Data

router.get('/teste', (req, res) => {
    res.send("A rota está funcionando!");
});


// --- BUSCAR DADOS DE UM CLIENTE ESPECÍFICO ---
router.get('/clientes/:id', async (req, res) => {
    const [rows] = await pool.execute('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
});

// --- ATUALIZAR PERFIL DO CLIENTE ---
router.put('/clientes/:id', upload.single('foto'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, email, telefone, endereco } = req.body;
        
        // Alinhando com o JSON que você mandou: o front envia 'foto_url'
        let fotoUrl = req.body.foto_url; 

        if (req.file) {
            // Se enviou arquivo novo, sobe para o Azure
            fotoUrl = await uploadImageToBlob(req.file);
        }

        const query = `
            UPDATE clientes 
            SET nome=?, email=?, telefone=?, endereco=?, foto_url=? 
            WHERE id=?
        `;
        
        const values = [
            nome || null, 
            email || null, 
            telefone || null, 
            endereco || null, 
            fotoUrl || null, 
            id
        ];

        await pool.execute(query, values);
        res.json({ message: "Perfil sincronizado!", foto_url: fotoUrl });
    } catch (error) {
        console.error("Erro no update do cliente:", error);
        res.status(500).json({ error: error.message });
    }
});

// --- ROTAS DE CLIENTE ---
router.post('/clientes', upload.single('foto'), async (req, res) => {
    try {
        // Garantindo que se não vier nada, vire null
        const nome = req.body.nome || null;
        const email = req.body.email || null;
        const telefone = req.body.telefone || null;
        const endereco = req.body.endereco || null;
        
        let fotoUrl = null; // Default como null para o banco
        
        if (req.file) {
            fotoUrl = await uploadImageToBlob(req.file);
        }

        const [rows] = await pool.execute(
            'INSERT INTO clientes (nome, email, telefone, endereco, foto_url) VALUES (?, ?, ?, ?, ?)',
            [nome, email, telefone, endereco, fotoUrl]
        );
        
        res.json({ id: rows.insertId, fotoUrl, status: "Sucesso!" });
    } catch (error) {
        console.error("Erro no cadastro:", error);
        res.status(500).json({ error: error.message });
    }
});

// 1. LISTAR TODOS (Para a tabela do Admin e a Home)
router.get('/produtos', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM produtos');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. BUSCAR POR ID (Para a página de Edição carregar os dados)
router.get('/produtos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await pool.execute('SELECT * FROM produtos WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Não encontrado" });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ROTAS DE PRODUTOS (ADMIN) ---
router.post('/produtos', upload.single('imagem'), async (req, res) => {
    try {
        // Forçando a conversão de undefined para null ou valores padrão
        const nome = req.body.nome !== undefined ? req.body.nome : null;
        const descricao = req.body.descricao !== undefined ? req.body.descricao : null;
        const preco = req.body.preco !== undefined ? req.body.preco : 0;
        const estoque = req.body.estoque !== undefined ? req.body.estoque : 0;
        const categoria = req.body.categoria !== undefined ? req.body.categoria : 'Geral';
        
        let imagemUrl = null;

        if (req.file) {
            console.log("Subindo imagem para Azure...");
            imagemUrl = await uploadImageToBlob(req.file);
        }

        // Importante: verifique se a ordem e quantidade de '?' batem com as colunas
        const query = 'INSERT INTO produtos (nome, descricao, preco, estoque, imagem_url, categoria) VALUES (?, ?, ?, ?, ?, ?)';
        const values = [nome, descricao, preco, estoque, imagemUrl, categoria];

        const [rows] = await pool.execute(query, values);

        res.json({ id: rows.insertId, imagemUrl, status: "Sucesso!" });
    } catch (error) {
        console.error("❌ Erro no cadastro de produto:", error);
        res.status(500).json({ error: error.message });
    }
});


// --- ATUALIZAR PRODUTO ---
router.put('/produtos/:id', upload.single('imagem'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, preco, estoque, categoria } = req.body;
        
        // Se vier uma nova imagem pelo multer, usa ela. 
        // Se não, usa a 'imagemUrl' que enviamos pelo formData
        let imagemUrl = req.body.imagemUrl; 

        if (req.file) {
            imagemUrl = await uploadImageToBlob(req.file);
        }

        const query = `
            UPDATE produtos 
            SET nome=?, descricao=?, preco=?, estoque=?, imagem_url=?, categoria=? 
            WHERE id=?
        `;
        const values = [
            nome || null, 
            descricao || null, 
            preco || 0, 
            estoque || 0, 
            imagemUrl || null, 
            categoria || 'Geral', 
            id
        ];

        await pool.execute(query, values);
        res.json({ message: "Produto atualizado!", imagemUrl });
    } catch (error) {
        console.error("Erro no PUT produtos:", error);
        res.status(500).json({ error: error.message });
    }
});



const { tableOrdersClient } = require("../config/azureProvider");

router.post('/checkout', async (req, res) => {
    try {
        const { cliente_id, total, itens, endereco, pagamento } = req.body;

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

        // 3. LOG NO AZURE TABLES (Para o Dashboard do Admin)
        // PartitionKey: AnoMes | RowKey: ID do Pedido
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
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// --- ROTA DE ESTATÍSTICAS DO DASHBOARD ---
router.get('/admin/stats', async (req, res) => {
    try {
        // 1. Dados do MySQL
        const [prodCount] = await pool.execute('SELECT COUNT(*) as total FROM produtos');
        const [cliCount] = await pool.execute('SELECT COUNT(*) as total FROM clientes');
        
        // 2. Dados do Azure Tables (Pedidos)
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
        pedidosRecentes.sort((a, b) => b.timestamp - a.timestamp);

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