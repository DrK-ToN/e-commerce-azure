const { BlobServiceClient } = require("@azure/storage-blob");
const { TableClient, AzureNamedKeyCredential } = require("@azure/data-tables");
require("dotenv").config();

// Configuração Blob Storage
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_BLOB_CONTAINER_NAME);

// Configuração Table Storage (Exemplo para Pedidos/Orders)
const tableOrdersClient = TableClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING,
  process.env.AZURE_TABLE_ORDERS_NAME
);

module.exports = { containerClient, tableOrdersClient };