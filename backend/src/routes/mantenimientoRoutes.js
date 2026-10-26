const express = require('express');
const router = express.Router();
const mantenimientoController = require('../controllers/mantenimientoController');

router.post('/', mantenimientoController.crearOrden);
// Nueva ruta para cerrar una orden de mantenimiento
router.put('/:id/cerrar', mantenimientoController.cerrarOrden);
module.exports = router;