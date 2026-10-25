const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');

router.get('/', reservaController.obtenerReservas);

router.post('/', reservaController.crearReserva);

// Rutas para check-in y check-out
router.post('/:id/checkin', reservaController.registrarCheckIn);
router.post('/:id/checkout', reservaController.registrarCheckOut);

module.exports = router;