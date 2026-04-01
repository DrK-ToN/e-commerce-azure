const { containerClient } = require("../config/azureProvider");

const uploadImageToBlob = async (file) => {
  try {
    const blobName = `${Date.now()}-${file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype },
    });
    return blockBlobClient.url;
  } catch (err) {
    console.error("ERRO NA AZURE BLOB:", err.message); // <--- Adicione isso
    throw err;
  }
};

module.exports = { uploadImageToBlob };