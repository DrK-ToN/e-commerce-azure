const express = require('express');
const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 },
});
const router = express.Router();
const azureService = require('../services/azureService');

const handleAzureUpload = async (req, res, next) => {
    try {
        const body = req.body || {};

        console.debug(
            'Azure upload body:',
            body,
            'file:',
            req.file && {
                originalname: req.file.originalname,
                size: req.file.size,
            },
        );

        const hasFile = req.file && req.file.buffer;
        const fileName = hasFile
            ? body.fileName || req.file.originalname
            : body.fileName;
        const content = hasFile ? req.file.buffer : body.content;
        const sizeBytes = hasFile
            ? req.file.size
            : typeof content === 'string'
              ? Buffer.from(content, 'base64').length
              : 0;

        if (!fileName || !content) {
            return res
                .status(400)
                .json({ error: 'fileName e content/file são obrigatórios' });
        }

        const result = await azureService.uploadBlob(fileName, content);
        try {
            await azureService.createLogEntry({
                action: 'upload',
                imageName: fileName,
                endpoint: '/azure/blob/upload',
                statusCode: 201,
                sizeBytes,
                user: body.user || 'unknown',
            });
        } catch (logErr) {
            console.error('Erro ao gravar log de upload:', logErr);
        }

        res.status(201).json({ message: 'Blob enviado', result });
    } catch (err) {
        next(err);
    }
};

router.post('/blob/upload', async (req, res, next) => {
    if (req.is('multipart/form-data')) {
        upload.single('file')(req, res, (err) => {
            if (err) return next(err);
            handleAzureUpload(req, res, next);
        });
    } else {
        handleAzureUpload(req, res, next);
    }
});

router.get('/blob/list', async (req, res, next) => {
    try {
        const blobs = await azureService.listBlobs();
        res.json({ blobs });
    } catch (err) {
        next(err);
    }
});

router.delete('/blob/:name', async (req, res, next) => {
    try {
        const blobName = decodeURIComponent(req.params.name);
        const result = await azureService.deleteBlob(blobName);
        if (!result.succeeded) {
            return res.status(404).json({ error: 'Blob não encontrado' });
        }

        try {
            await azureService.createLogEntry({
                action: 'delete',
                imageName: blobName,
                endpoint: '/azure/blob/:name',
                statusCode: 200,
                sizeBytes: 0,
                user: 'unknown',
            });
        } catch (logErr) {
            console.error('Erro ao gravar log de delete:', logErr);
        }

        res.json({ message: 'Blob excluído com sucesso' });
    } catch (err) {
        next(err);
    }
});

router.get('/blob/download/:name', async (req, res, next) => {
    try {
        const blobName = decodeURIComponent(req.params.name);
        const sasUrl = await azureService.getBlobSASUrl(blobName);

        try {
            await azureService.createLogEntry({
                action: 'download',
                imageName: blobName,
                endpoint: '/azure/blob/download/:name',
                statusCode: 200,
                sizeBytes: 0,
                user: 'unknown',
            });
        } catch (logErr) {
            console.error('Erro ao gravar log de download:', logErr);
        }

        res.json({ url: sasUrl });
    } catch (err) {
        next(err);
    }
});

router.post('/table/entity', async (req, res, next) => {
    try {
        const body = req.body || {};
        const { partitionKey, rowKey, entity } = body;
        if (!partitionKey || !rowKey || !entity) {
            return res
                .status(400)
                .json({ error: 'partitionKey, rowKey e entity obrigatórios' });
        }
        const result = await azureService.createTableEntity(
            partitionKey,
            rowKey,
            entity,
        );
        res.status(201).json({ message: 'Entidade de tabela criada', result });
    } catch (err) {
        next(err);
    }
});

router.get('/table/entity/:partitionKey/:rowKey', async (req, res, next) => {
    try {
        const { partitionKey, rowKey } = req.params;
        const entity = await azureService.getTableEntity(partitionKey, rowKey);
        res.json({ entity });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
