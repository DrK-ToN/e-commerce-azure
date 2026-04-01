const Produto = require('../models/Produto');
const azureService = require('../services/azureService');
const { Op } = require('sequelize');

exports.create = async (req, res, next) => {
    try {
        const { marca, modelo, valor, quantidade, descricao, fotos } = req.body;

        if (!marca || !modelo || !valor || quantidade == null) {
            return res.status(400).json({
                error: 'Campos obrigatórios: marca, modelo, valor e quantidade',
            });
        }

        const produto = await Produto.create({
            marca,
            modelo,
            valor,
            quantidade,
            descricao: descricao || '',
            fotos: fotos || [],
        });

        await azureService.createLogEntry({
            action: 'create-produto',
            endpoint: '/produtos',
            statusCode: 201,
            user: req.body.usuario || 'nus',
        });

        res.status(201).json({ message: 'Produto cadastrado', data: produto });
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { marca, modelo, valor, quantidade, descricao, fotos } = req.body;

        const [updatedRows] = await Produto.update(
            { marca, modelo, valor, quantidade, descricao, fotos },
            { where: { id_produto: id } },
        );

        if (!updatedRows) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        await azureService.createLogEntry({
            action: 'update-produto',
            endpoint: `/produtos/${id}`,
            statusCode: 200,
            user: req.body.usuario || 'nus',
        });

        res.status(200).json({ message: 'Produto atualizado' });
    } catch (err) {
        next(err);
    }
};

exports.getAll = async (req, res, next) => {
    try {
        const { marca, modelo, minValor, maxValor } = req.query;
        const where = {};

        if (marca) where.marca = marca;
        if (modelo) where.modelo = modelo;
        if (minValor || maxValor) {
            where.valor = {};
            if (minValor) where.valor[Op.gte] = Number(minValor);
            if (maxValor) where.valor[Op.lte] = Number(maxValor);
        }

        const produtos = await Produto.findAll({ where });

        res.status(200).json(produtos);
    } catch (err) {
        next(err);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const produto = await Produto.findByPk(req.params.id);

        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        res.status(200).json(produto);
    } catch (err) {
        next(err);
    }
};

exports.uploadFoto = async (req, res, next) => {
    try {
        const { id, fotoBase64, nomeImagem } = req.body;

        const produto = await Produto.findByPk(id);
        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        const fileName = `${id}-${Date.now()}-${nomeImagem || 'imagem'}.png`;
        await azureService.uploadBlob(fileName, fotoBase64);
        const url = await azureService.getBlobSASUrl(fileName, 24);

        const fotos = produto.fotos || [];
        fotos.push({ nome: fileName, url });

        await produto.update({ fotos });

        await azureService.createLogEntry({
            action: 'upload-foto-produto',
            endpoint: '/produtos/foto',
            statusCode: 201,
            user: req.body.usuario || 'nus',
            imageName: fileName,
        });

        res.status(201).json({
            message: 'Foto do produto carregada',
            foto: { nome: fileName, url },
        });
    } catch (err) {
        next(err);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const deletedRows = await Produto.destroy({
            where: { id_produto: req.params.id },
        });

        if (!deletedRows) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        await azureService.createLogEntry({
            action: 'delete-produto',
            endpoint: `/produtos/${req.params.id}`,
            statusCode: 200,
            user: req.body.usuario || 'nus',
        });

        res.status(200).json({ message: 'Produto excluído' });
    } catch (err) {
        next(err);
    }
};
