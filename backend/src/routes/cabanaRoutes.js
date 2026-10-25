const express = require('express');
const router = express.Router();
const cabanaController = require('../controllers/cabanaController');

router.get('/', cabanaController.obtenerCabanas);
router.post('/', cabanaController.crearCabana);

module.exports = router;