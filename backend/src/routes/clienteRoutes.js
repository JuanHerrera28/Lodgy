const express = require('express');
const router = express.Router();
const c = require('../controllers/clienteController');
const { verificarToken, permitirRoles } = require('../middlewares/authMiddleware');

router.use(verificarToken);
const recepcion = permitirRoles('Administrador', 'Recepcionista');

router.get('/', recepcion, c.obtenerClientes);
router.post('/', recepcion, c.crearCliente);

module.exports = router;
