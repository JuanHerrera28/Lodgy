const db = require('../config/db');
const { responderError } = require('../utils/errores');
const { esFecha, esEntero } = require('../utils/validar');

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

// Servicios que puede incluir una cabaña, con su descripción.
const obtenerServiciosPublicos = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id_servicio, nombre, descripcion FROM Servicio ORDER BY nombre');
        res.json(rows);
    } catch (error) {
        responderError(res, error, 'Error al consultar los servicios');
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

// Disponibilidad pública: misma regla de cruces que el trigger, sin datos de clientes.
const consultarDisponibilidadPublica = async (req, res) => {
    const { fecha_inicio, fecha_fin, personas } = req.query;

    if (!esFecha(fecha_inicio) || !esFecha(fecha_fin) || fecha_fin <= fecha_inicio) {
        return res.status(400).json({ error: 'Indica fecha_inicio y fecha_fin (AAAA-MM-DD), con la salida posterior a la entrada' });
    }
    const minimo = esEntero(personas) ? Number(personas) : 1;

    try {
        const [rows] = await db.query(
            `SELECT c.id_cabana, c.nombre, c.descripcion, c.capacidad, c.precio_noche, c.foto, c.es_recomendada,
                    GROUP_CONCAT(s.nombre ORDER BY s.nombre SEPARATOR ', ') AS servicios
             FROM Cabana c
             LEFT JOIN Cabana_Servicio cs ON cs.id_cabana = c.id_cabana
             LEFT JOIN Servicio s ON s.id_servicio = cs.id_servicio
             WHERE c.activa = TRUE
               AND c.capacidad >= ?
               AND NOT EXISTS (
                   SELECT 1 FROM Reserva r
                   JOIN Estado_Reserva er ON er.id_estado_reserva = r.id_estado_reserva
                   WHERE r.id_cabana = c.id_cabana
                     AND er.nombre <> 'Cancelada'
                     AND r.fecha_entrada < ? AND r.fecha_salida > ?)
             GROUP BY c.id_cabana
             ORDER BY c.es_recomendada DESC, c.nombre`,
            [minimo, fecha_fin, fecha_inicio]);
        res.json(rows);
    } catch (error) {
        responderError(res, error, 'Error al consultar la disponibilidad');
    }
};

module.exports = {
    obtenerCabanasPublicas,
    obtenerServiciosPublicos,
    obtenerServiciosAdicionalesPublicos,
    consultarDisponibilidadPublica
};
