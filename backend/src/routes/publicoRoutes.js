const express = require('express');
const router = express.Router();
const c = require('../controllers/publicoController');
const solicitudes = require('../controllers/solicitudController');

// Sin inicio de sesión: solo lectura de información pública
router.get('/cabanas', c.obtenerCabanasPublicas);
router.get('/servicios', c.obtenerServiciosPublicos);
router.get('/servicios-adicionales', c.obtenerServiciosAdicionalesPublicos);
router.get('/disponibilidad', c.consultarDisponibilidadPublica);

// Solicitud de reserva desde la web. No crea una reserva: queda pendiente
// de revisión en el panel. Se limita por IP para evitar envíos masivos.
const VENTANA_MS = 15 * 60 * 1000;
const MAXIMO_POR_VENTANA = 8;
const registros = new Map();

const limitarSolicitudes = (req, res, next) => {
    const ahora = Date.now();
    const ip = req.ip || req.socket?.remoteAddress || 'desconocida';
    const registro = registros.get(ip) || { inicio: ahora, total: 0 };

    if (ahora - registro.inicio > VENTANA_MS) {
        registro.inicio = ahora;
        registro.total = 0;
    }
    registro.total += 1;
    registros.set(ip, registro);

    if (registros.size > 500) {
        for (const [clave, valor] of registros) {
            if (ahora - valor.inicio > VENTANA_MS) registros.delete(clave);
        }
    }

    if (registro.total > MAXIMO_POR_VENTANA) {
        return res.status(429).json({
            error: 'Recibimos demasiadas solicitudes desde esta conexión. Intenta de nuevo más tarde.',
        });
    }
    next();
};

router.post('/solicitudes', limitarSolicitudes, solicitudes.crearSolicitudPublica);

module.exports = router;
