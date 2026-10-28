const express = require('express');
const router = express.Router();
const c = require('../controllers/solicitudController');
const { verificarToken, permitirRoles } = require('../middlewares/authMiddleware');

router.use(verificarToken);
const recepcion = permitirRoles('Administrador', 'Recepcionista');

router.get('/', recepcion, c.listarSolicitudes);
router.post('/:id/aprobar', recepcion, c.aprobarSolicitud);
router.post('/:id/rechazar', recepcion, c.rechazarSolicitud);

module.exports = router;
