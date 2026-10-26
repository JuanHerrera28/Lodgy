const express = require('express');
const router = express.Router();
const c = require('../controllers/cabanaController');
const { verificarToken, permitirRoles } = require('../middlewares/authMiddleware');

router.use(verificarToken);
const todos = permitirRoles('Administrador', 'Recepcionista', 'Servicios generales');
const recepcion = permitirRoles('Administrador', 'Recepcionista');

router.get('/trabajo', todos, c.obtenerTrabajo);
router.get('/disponibilidad', recepcion, c.consultarDisponibilidad);
router.get('/', todos, c.obtenerCabanas);
router.post('/', permitirRoles('Administrador'), c.crearCabana);
router.put('/:id/lista', permitirRoles('Administrador', 'Servicios generales'), c.marcarCabanaLista);

module.exports = router;