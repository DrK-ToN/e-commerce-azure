const Pedido = require('../models/Pedido');
const Produto = require('../models/Produto');
const Proprietario = require('../models/Proprietario'); // Alterado para Proprietario
const azureService = require('../services/azureService');

exports.create = async (req, res, next) => {
    try {
        const { fk_cliente, itens, metodo_pagamento, metodo_entrega } =
            req.body;

        if (
            !fk_cliente ||
            !Array.isArray(itens) ||
            itens.length === 0 ||
            !metodo_pagamento ||
            !metodo_entrega
        ) {
            return res
                .status(400)
                .json({ error: 'Dados obrigatórios faltando no pedido' });
        }

        const proprietario = await Proprietario.findByPk(fk_cliente); // Buscar Proprietario
        if (!proprietario) {
            return res
                .status(404)
                .json({ error: 'Proprietário não encontrado' }); // Mensagem ajustada
        }

        let valorTotal = 0;

        for (const item of itens) {
            const produto = await Produto.findByPk(item.id_produto);
            if (!produto) {
                return res.status(404).json({
                    error: `Produto ${item.id_produto} não encontrado`,
                });
            }

            if (produto.quantidade < item.quantidade) {
                return res.status(400).json({
                    error: `Estoque insuficiente para ${produto.modelo}`,
                });
            }

            valorTotal += Number(produto.valor) * Number(item.quantidade);
        }

        const pedido = await Pedido.create({
            fk_cliente,
            itens,
            valor_total: valorTotal,
            metodo_pagamento,
            metodo_entrega,
            status: 'Concluído',
        });

        // Deduzir estoque
        for (const item of itens) {
            const produto = await Produto.findByPk(item.id_produto);
            await produto.update({
                quantidade: produto.quantidade - item.quantidade,
            });
        }

        await azureService.createLogEntry({
            action: 'checkout',
            endpoint: '/pedidos',
            statusCode: 201,
            user: req.body.usuario || 'nus',
        });

        res.status(201).json({ message: 'Pedido concluído', pedido });
    } catch (err) {
        next(err);
    }
};

exports.getAll = async (req, res, next) => {
    try {
        const pedidos = await Pedido.findAll();
        res.status(200).json(pedidos);
    } catch (err) {
        next(err);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const pedido = await Pedido.findByPk(req.params.id);
        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }
        res.status(200).json(pedido);
    } catch (err) {
        next(err);
    }
};
