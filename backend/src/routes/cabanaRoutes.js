const express = require('express');
const router = express.Router();
const c = require('../controllers/cabanaController');
const { verificarToken, permitirRoles } = require('../middlewares/authMiddleware');

router.use(verificarToken);
const todos = permitirRoles('Administrador', 'Recepcionista', 'Servicios generales');
const recepcion = permitirRoles('Administrador', 'Recepcionista');
const admin = permitirRoles('Administrador');

router.get('/trabajo', todos, c.obtenerTrabajo);
router.get('/disponibilidad', recepcion, c.consultarDisponibilidad);
router.get('/servicios', todos, c.obtenerServicios);
router.get('/', todos, c.obtenerCabanas);
router.post('/', admin, c.crearCabana);
router.put('/:id/lista', permitirRoles('Administrador', 'Servicios generales'), c.marcarCabanaLista);
router.put('/:id/estado', admin, c.cambiarEstadoCabana);
router.put('/:id/servicios', admin, c.asignarServicios);
router.put('/:id', admin, c.actualizarCabana);

module.exports = router;
