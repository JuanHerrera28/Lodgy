const express = require('express');
const router = express.Router();
const articuloController = require('../controllers/articuloController');

router.get('/', articuloController.obtenerArticulos);
router.post('/', articuloController.crearArticulo);
// Nueva ruta para registrar movimientos de artículos
router.post('/movimientos', articuloController.registrarMovimiento);
module.exports = router;