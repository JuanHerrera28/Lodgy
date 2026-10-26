const express = require('express');
const router = express.Router();
const { login, yo } = require('../controllers/authController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.post('/login', login);
router.get('/yo', verificarToken, yo);

module.exports = router;