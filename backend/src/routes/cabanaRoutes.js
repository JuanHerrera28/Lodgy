const express = require('express');
const router = express.Router();
const cabanaController = require('../controllers/cabanaController');

router.get('/', cabanaController.obtenerCabanas);
router.post('/', cabanaController.crearCabana);

// Nueva ruta para consultar la disponibilidad de cabañas
router.get('/disponibilidad', cabanaController.consultarDisponibilidad);

module.exports = router;