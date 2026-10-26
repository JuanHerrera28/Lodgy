const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { responderError } = require('../utils/errores');

const login = async (req, res) => {
    const { correo, contrasena } = req.body || {};
    if (!correo || !contrasena) {
        return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
    }
    try {
        const [rows] = await db.query(
            `SELECT u.id_usuario, u.nombre, u.apellido, u.contrasena, u.activo, r.nombre AS rol
             FROM Usuario u JOIN Rol r ON r.id_rol = u.id_rol
             WHERE u.correo = ?`, [correo]);
        const u = rows[0];

        // Mismo mensaje si el usuario no existe o la contraseña falla (no se revela cuál)
        const valido = u && u.activo && await bcrypt.compare(contrasena, u.contrasena);
        if (!valido) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        // La cuenta compartida de servicios generales mantiene la sesión por semanas
        const expira = u.rol === 'Servicios generales'
            ? (process.env.JWT_EXPIRA_SERVICIOS || '30d')
            : (process.env.JWT_EXPIRA_GENERAL || '8h');

        const token = jwt.sign({ id: u.id_usuario, rol: u.rol }, process.env.JWT_SECRET, { expiresIn: expira });

        res.json({
            token,
            usuario: { id: u.id_usuario, nombre: `${u.nombre} ${u.apellido}`, rol: u.rol }
        });
    } catch (error) {
        responderError(res, error, 'Error al iniciar sesión');
    }
};

// Devuelve los datos de la sesión actual (útil para el frontend)
const yo = (req, res) => res.json(req.usuario);

module.exports = { login, yo };