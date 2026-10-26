const db = require('../config/db');
const { responderError } = require('../utils/errores');

// Catálogo para la web pública: SOLO datos de las cabañas. Nunca clientes, pagos ni reservas.
const obtenerCabanasPublicas = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT c.id_cabana, c.nombre, c.descripcion, c.capacidad, c.precio_noche, c.foto, c.es_recomendada,
                    GROUP_CONCAT(s.nombre ORDER BY s.nombre SEPARATOR ', ') AS servicios
             FROM Cabana c
             LEFT JOIN Cabana_Servicio cs ON cs.id_cabana = c.id_cabana
             LEFT JOIN Servicio s ON s.id_servicio = cs.id_servicio
             WHERE c.activa = TRUE
             GROUP BY c.id_cabana
             ORDER BY c.es_recomendada DESC, c.nombre`);
        res.json(rows);
    } catch (error) {
        responderError(res, error, 'Error al consultar el catálogo');
    }
};

// Servicios adicionales con su precio, para mostrar en la web
const obtenerServiciosAdicionalesPublicos = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT nombre, descripcion, precio FROM Servicio_Adicional WHERE activo = TRUE ORDER BY nombre`);
        res.json(rows);
    } catch (error) {
        responderError(res, error, 'Error al consultar los servicios');
    }
};

module.exports = { obtenerCabanasPublicas, obtenerServiciosAdicionalesPublicos };
