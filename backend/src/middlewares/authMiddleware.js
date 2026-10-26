const jwt = require('jsonwebtoken');

// 1) Verifica el token. El usuario y su rol salen del TOKEN firmado, nunca de lo que envía el cliente.
const verificarToken = (req, res, next) => {
    const cabecera = req.headers['authorization'] || '';
    const [tipo, token] = cabecera.split(' ');

    if (tipo !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Debes iniciar sesión' });
    }
    try {
        const datos = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = { id: datos.id, rol: datos.rol };
        next();
    } catch (e) {
        return res.status(401).json({ error: 'Sesión inválida o vencida' });
    }
};

// 2) Deja pasar solo a los roles indicados, por nombre: permitirRoles('Administrador', 'Recepcionista')
const permitirRoles = (...roles) => (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
        return res.status(403).json({ error: 'No tienes permisos para esta acción' });
    }
    next();
};

module.exports = { verificarToken, permitirRoles };