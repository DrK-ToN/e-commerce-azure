// Dentro de src/server.js
const express = require('express');
const cors = require('cors');
// O ponto (.) significa "esta pasta atual" (src)
const routes = require('./routes/index'); 

const app = express();

app.use(cors({ origin: '*', // Permite qualquer site (ideal para o projeto da Fatec)
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Libera explicitamente o PUT
  allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());

// Liga as rotas ao prefixo /api
app.use('/api', routes);

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 Backend rodando na porta ${PORT}`);
    console.log(`✅ Conectado ao MySQL: ${process.env.AZURE_TABLE_PRODUCTS_NAME}`);
});