const express = require('express');
const router = express.Router();
const c = require('../controllers/mantenimientoController');
const { verificarToken, permitirRoles } = require('../middlewares/authMiddleware');

router.use(verificarToken);
const admin = permitirRoles('Administrador');
const operativo = permitirRoles('Administrador', 'Servicios generales');

router.get('/', operativo, c.obtenerOrdenes);
router.post('/', permitirRoles('Administrador', 'Recepcionista', 'Servicios generales'), c.crearOrden);
router.put('/:id/en-proceso', admin, c.iniciarOrden);
router.put('/:id/resolver', operativo, c.resolverOrden);
router.put('/:id/costo', admin, c.registrarCosto);

module.exports = router;
