const express = require('express');
const router = express.Router();
const c = require('../controllers/articuloController');
const { verificarToken, permitirRoles } = require('../middlewares/authMiddleware');

router.use(verificarToken);
const todos = permitirRoles('Administrador', 'Recepcionista', 'Servicios generales');

router.get('/', todos, c.obtenerArticulos);
router.post('/', permitirRoles('Administrador'), c.crearArticulo);
router.post('/movimientos', todos, c.registrarMovimiento); // el controlador limita el tipo según el rol

module.exports = router;
