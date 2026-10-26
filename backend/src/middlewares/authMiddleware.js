const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        // Suponiendo que el id_rol llega en los headers o en el cuerpo/token de la petición
        const idRol = req.headers['id_rol'] || req.body.id_rol;

        if (!idRol) {
            return res.status(401).json({ error: 'Acceso no autorizado: Se requiere rol de usuario' });
        }

        // Verificamos si el rol del usuario está dentro de los permitidos para la ruta
        if (!rolesPermitidos.includes(Number(idRol))) {
            return res.status(403).json({ error: 'Acceso denegado: No cuentas con los permisos suficientes para esta acción' });
        }

        next();
    };
};

module.exports = { verificarRol };