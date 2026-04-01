const pool = require("../config/db");
const { uploadImageToBlob } = require("../services/blobService");

exports.createClient = async (req, res) => {
  try {
    const { nome, email, telefone, endereco } = req.body;
    let fotoUrl = null;

    if (req.file) {
      fotoUrl = await uploadImageToBlob(req.file);
    }

    const [result] = await pool.execute(
      "INSERT INTO clientes (nome, email, telefone, endereco, foto_url) VALUES (?, ?, ?, ?, ?)",
      [nome, email, telefone, endereco, fotoUrl]
    );

    res.status(201).json({ id: result.insertId, message: "Cliente criado com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};