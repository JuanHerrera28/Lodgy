// Traduce los errores de MariaDB a respuestas HTTP claras.
function responderError(res, error, mensajePorDefecto = 'Error interno del servidor') {
    console.error(error);

    // Reglas de negocio lanzadas con SIGNAL en triggers y procedimientos (cruces, saldo, estados...)
    if (error.sqlState === '45000') {
        return res.status(409).json({ error: error.sqlMessage });
    }

    switch (error.errno) {
        case 1062: return res.status(409).json({ error: 'Ya existe un registro con esos datos' });
        case 1452: return res.status(400).json({ error: 'Referencia inválida: algún dato relacionado no existe' });
        case 4025: // CHECK en MariaDB
        case 3819: // CHECK en MySQL
            return res.status(400).json({ error: 'Algún dato no cumple las reglas del sistema' });
        case 1048: return res.status(400).json({ error: 'Falta un dato obligatorio' });
        default: break;
    }
    return res.status(500).json({ error: mensajePorDefecto });
}

module.exports = { responderError };