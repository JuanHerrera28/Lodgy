const express = require('express');
const router = express.Router();
const articuloController = require('../controllers/articuloController');

router.get('/', articuloController.obtenerArticulos);
router.post('/', articuloController.crearArticulo);

module.exports = router;