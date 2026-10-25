require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./src/config/db');
const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/api/prueba', (req, res) => {
    res.json({ mensaje: 'El servidor de Lodgy está funcionando correctamente.' });
});
// Rutas de la API
app.use(express.json());
app.use('/api/cabanas', require('./src/routes/cabanaRoutes'));
app.use('/api/reservas', require('./src/routes/reservaRoutes'));
app.use('/api/clientes', require('./src/routes/clienteRoutes'));
app.use('/api/articulos', require('./src/routes/articuloRoutes'));

// Inicialización del servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de Lodgy corriendo en http://localhost:${PORT}`);
});