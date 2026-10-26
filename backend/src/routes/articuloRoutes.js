const express = require('express');
const router = express.Router();
const articuloController = require('../controllers/articuloController');

router.get('/', articuloController.obtenerArticulos);
router.post('/', articuloController.crearArticulo);
// Nueva ruta para registrar movimientos de artículos
router.post('/movimientos', articuloController.registrarMovimiento);
module.exports = router;

// Nota: Para proteger la ruta de registrar movimientos, puedes usar un middleware de autenticación y autorización. Por ejemplo:
// 1. Importas el middleware de verificación de rol
const { verificarRol } = require('../middlewares/authMiddleware');
// 2. Lo insertas como segundo parámetro en la ruta que deseas proteger
router.post('/articulos/movimientos', verificarRol([1, 2]), articuloController.registrarMovimiento);