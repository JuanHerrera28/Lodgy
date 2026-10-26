const express = require('express');
const router = express.Router();
const c = require('../controllers/reservaController');
const { verificarToken, permitirRoles } = require('../middlewares/authMiddleware');

router.use(verificarToken);
const recepcion = permitirRoles('Administrador', 'Recepcionista');

router.get('/', recepcion, c.obtenerReservas);
router.post('/', recepcion, c.crearReserva);
router.post('/:id/cancelar', recepcion, c.cancelarReserva);

router.post('/:id/checkin', recepcion, c.registrarCheckIn);
router.post('/:id/checkout', recepcion, c.registrarCheckOut);

router.get('/:id/saldo', recepcion, c.consultarSaldoReserva);
router.post('/:id/pagos', recepcion, c.registrarPagoReserva);
router.post('/:id/cargos', recepcion, c.agregarCargoServicio);

module.exports = router;
