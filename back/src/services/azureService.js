const { TableClient, AzureNamedKeyCredential } = require('@azure/data-tables');
const {
    BlobServiceClient,
    StorageSharedKeyCredential,
    BlobSASPermissions,
    generateBlobSASQueryParameters,
} = require('@azure/storage-blob');

const {
    AZURE_STORAGE_ACCOUNT,
    AZURE_STORAGE_ACCESS_KEY,
    AZURE_TABLE_NAME,
    AZURE_BLOB_CONTAINER,
    AZURE_LOG_TABLE_NAME,
} = process.env;

if (!AZURE_STORAGE_ACCOUNT || !AZURE_STORAGE_ACCESS_KEY) {
    console.warn(
        'Azure env vars not set: AZURE_STORAGE_ACCOUNT, AZURE_STORAGE_ACCESS_KEY',
    );
}

const credential = new StorageSharedKeyCredential(
    AZURE_STORAGE_ACCOUNT,
    AZURE_STORAGE_ACCESS_KEY,
);
const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.AZURE_STORAGE_CONNECTION_STRING ||
        `DefaultEndpointsProtocol=https;AccountName=${AZURE_STORAGE_ACCOUNT};AccountKey=${AZURE_STORAGE_ACCESS_KEY};EndpointSuffix=core.windows.net`,
);

const tableCredential = new AzureNamedKeyCredential(
    AZURE_STORAGE_ACCOUNT,
    AZURE_STORAGE_ACCESS_KEY,
);
const tableClient = AZURE_TABLE_NAME
    ? new TableClient(
          process.env.AZURE_TABLE_CONNECTION_STRING ||
              `https://${AZURE_STORAGE_ACCOUNT}.table.core.windows.net`,
          AZURE_TABLE_NAME,
          tableCredential,
      )
    : null;

const logTableClient =
    AZURE_LOG_TABLE_NAME || 'LogEvents'
        ? new TableClient(
              process.env.AZURE_TABLE_CONNECTION_STRING ||
                  `https://${AZURE_STORAGE_ACCOUNT}.table.core.windows.net`,
              AZURE_LOG_TABLE_NAME || 'LogEvents',
              tableCredential,
          )
        : null;

async function uploadBlob(fileName, content) {
    if (!AZURE_BLOB_CONTAINER)
        throw new Error('AZURE_BLOB_CONTAINER is not configured');
    const containerClient =
        blobServiceClient.getContainerClient(AZURE_BLOB_CONTAINER);
    await containerClient.createIfNotExists();
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    let buffer;
    if (Buffer.isBuffer(content)) {
        buffer = content;
    } else if (typeof content === 'string') {
        // if content is base64 data URI, remove prefix
        const commaIndex = content.indexOf(',');
        const raw = commaIndex >= 0 ? content.slice(commaIndex + 1) : content;
        buffer = Buffer.from(raw, 'base64');
    } else {
        throw new TypeError('Content must be string/base64 or Buffer');
    }

    const result = await blockBlobClient.upload(buffer, buffer.length);
    return result;
}

async function listBlobs() {
    if (!AZURE_BLOB_CONTAINER)
        throw new Error('AZURE_BLOB_CONTAINER is not configured');
    const containerClient =
        blobServiceClient.getContainerClient(AZURE_BLOB_CONTAINER);
    const blobs = [];

    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);

    for await (const blob of containerClient.listBlobsFlat()) {
        const blobClient = containerClient.getBlobClient(blob.name);
        const sasToken = generateBlobSASQueryParameters(
            {
                containerName: AZURE_BLOB_CONTAINER,
                blobName: blob.name,
                expiresOn: expiry,
                permissions: BlobSASPermissions.parse('r'),
            },
            credential,
        ).toString();

        blobs.push({
            name: blob.name,
            url: `${blobClient.url}?${sasToken}`,
            size: blob.contentLength || 0,
            lastModified: blob.properties.lastModified?.toISOString() || '',
        });
    }
    return blobs;
}

async function getBlobSASUrl(blobName, expiresHours = 1) {
    if (!AZURE_BLOB_CONTAINER)
        throw new Error('AZURE_BLOB_CONTAINER is not configured');

    const containerClient =
        blobServiceClient.getContainerClient(AZURE_BLOB_CONTAINER);
    const blobClient = containerClient.getBlobClient(blobName);

    const expiry = new Date();
    expiry.setHours(expiry.getHours() + expiresHours);

    const sasToken = generateBlobSASQueryParameters(
        {
            containerName: AZURE_BLOB_CONTAINER,
            blobName,
            expiresOn: expiry,
            permissions: BlobSASPermissions.parse('r'),
        },
        credential,
    ).toString();

    return `${blobClient.url}?${sasToken}`;
}

async function createTableEntity(partitionKey, rowKey, entity) {
    if (!tableClient)
        throw new Error('Table client not configured (check AZURE_TABLE_NAME)');
    return tableClient.createEntity({ partitionKey, rowKey, ...entity });
}

async function getTableEntity(partitionKey, rowKey) {
    if (!tableClient)
        throw new Error('Table client not configured (check AZURE_TABLE_NAME)');
    return tableClient.getEntity(partitionKey, rowKey);
}

async function createLogEntry({
    action,
    imageName,
    endpoint,
    statusCode,
    sizeBytes,
    user,
}) {
    if (!logTableClient)
        throw new Error(
            'Log table client not configured (check AZURE_LOG_TABLE_NAME)',
        );
    const now = new Date();
    const partitionKey = action || 'unknown';
    const rowKey = `${now.toISOString()}-${Math.random()
        .toString(36)
        .slice(2, 10)}`;

    const entity = {
        Timestamp: now.toISOString(),
        Action: action || 'unknown',
        ImageName: imageName || '',
        Endpoint: endpoint || '',
        StatusCode: statusCode || 0,
        SizeBytes: sizeBytes || 0,
        User: user || '',
    };

    return logTableClient.createEntity({ partitionKey, rowKey, ...entity });
}

async function deleteBlob(blobName) {
    if (!AZURE_BLOB_CONTAINER)
        throw new Error('AZURE_BLOB_CONTAINER is not configured');
    const containerClient =
        blobServiceClient.getContainerClient(AZURE_BLOB_CONTAINER);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const result = await blockBlobClient.deleteIfExists();
    return result;
}

module.exports = {
    uploadBlob,
    listBlobs,
    getBlobSASUrl,
    deleteBlob,
    createTableEntity,
    getTableEntity,
    createLogEntry,
};
