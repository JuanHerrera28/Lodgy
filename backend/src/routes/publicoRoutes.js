const express = require('express');
const router = express.Router();
const c = require('../controllers/publicoController');

// Sin inicio de sesión: solo lectura de información pública
router.get('/cabanas', c.obtenerCabanasPublicas);
router.get('/servicios-adicionales', c.obtenerServiciosAdicionalesPublicos);

module.exports = router;
