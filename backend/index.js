require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('./src/config/db'); // abre el pool y prueba la conexión al arrancar

const app = express();

// CORS: solo los orígenes indicados en .env (la web pública y el software de gestión)
const origenes = (process.env.CORS_ORIGENES || '').split(',').map(o => o.trim()).filter(Boolean);
app.use(cors({ origin: origenes.length ? origenes : false }));
app.use(express.json());

app.get('/api/prueba', (req, res) => {
    res.json({ mensaje: 'El servidor de Lodgy está funcionando correctamente.' });
});

// Rutas públicas (sin inicio de sesión) y de acceso
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/publico', require('./src/routes/publicoRoutes'));

// Rutas privadas (exigen token y rol)
app.use('/api/cabanas', require('./src/routes/cabanaRoutes'));
app.use('/api/reservas', require('./src/routes/reservaRoutes'));
app.use('/api/solicitudes', require('./src/routes/solicitudRoutes'));
app.use('/api/clientes', require('./src/routes/clienteRoutes'));
app.use('/api/articulos', require('./src/routes/articuloRoutes'));
app.use('/api/mantenimiento', require('./src/routes/mantenimientoRoutes'));

// Ruta inexistente
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Errores generales (por ejemplo, un JSON mal escrito en la petición)
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de Lodgy corriendo en http://localhost:${PORT}`);
});