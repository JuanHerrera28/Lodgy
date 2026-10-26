const express = require('express');
const router = express.Router();
const mantenimientoController = require('../controllers/mantenimientoController');

router.post('/', mantenimientoController.crearOrden);

module.exports = router;