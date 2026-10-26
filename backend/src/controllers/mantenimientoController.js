const db = require('../config/db');
const { responderError } = require('../utils/errores');
const { esEntero } = require('../utils/validar');

// Abrir y cerrar pasan por los procedimientos almacenados, porque son los que
// bloquean y liberan la cabaña (RN-08).

const obtenerOrdenes = async (req, res) => {
    const { estado } = req.query;
    try {
        const [rows] = await db.query(
            `SELECT m.id_mantenimiento, c.nombre AS cabana, m.descripcion, m.fecha_reporte, m.estado,
                    m.bloquea_cabana, m.responsable, m.costo, m.fecha_cierre
             FROM Mantenimiento m JOIN Cabana c ON c.id_cabana = m.id_cabana
             ${estado ? 'WHERE m.estado = ?' : ''}
             ORDER BY m.fecha_reporte DESC`, estado ? [estado] : []);
        res.json(rows);
    } catch (error) {
        responderError(res, error, 'Error al consultar las órdenes de mantenimiento');
    }
};

const crearOrden = async (req, res) => {
    const { id_cabana, descripcion, bloquea_cabana } = req.body || {};

    if (!esEntero(id_cabana) || !descripcion || !String(descripcion).trim()) {
        return res.status(400).json({ error: 'id_cabana y descripcion son obligatorios' });
    }
    try {
        const [resultado] = await db.query(
            'CALL sp_abrir_mantenimiento(?, ?, ?, ?)',
            [id_cabana, descripcion, bloquea_cabana ? 1 : 0, req.usuario.id]);
        res.status(201).json({
            mensaje: 'Orden de mantenimiento reportada exitosamente',
            id_mantenimiento: resultado[0][0].id_mantenimiento
        });
    } catch (error) {
        responderError(res, error, 'Error al registrar el mantenimiento');
    }
};

// Pendiente -> En proceso (administrador)
const iniciarOrden = async (req, res) => {
    const { id } = req.params;
    if (!esEntero(id)) return res.status(400).json({ error: 'Orden no válida' });
    try {
        const [r] = await db.query(
            `UPDATE Mantenimiento SET estado = 'En proceso'
             WHERE id_mantenimiento = ? AND estado = 'Pendiente'`, [id]);
        if (r.affectedRows === 0) {
            return res.status(409).json({ error: 'La orden no existe o ya no está Pendiente' });
        }
        res.json({ mensaje: 'Orden en proceso' });
    } catch (error) {
        responderError(res, error, 'Error al actualizar la orden');
    }
};

// Servicios generales (o el administrador) marca la tarea como realizada.
// El procedimiento cierra la orden y libera la cabaña si ya no hay más bloqueos.
const resolverOrden = async (req, res) => {
    const { id } = req.params;
    if (!esEntero(id)) return res.status(400).json({ error: 'Orden no válida' });
    try {
        await db.query('CALL sp_cerrar_mantenimiento(?, ?)', [id, req.usuario.id]);
        res.json({ mensaje: 'Orden resuelta' });
    } catch (error) {
        responderError(res, error, 'Error al cerrar la orden');
    }
};

// El administrador registra el costo y el responsable
const registrarCosto = async (req, res) => {
    const { id } = req.params;
    const { costo, responsable } = req.body || {};
    if (!esEntero(id) || !(Number(costo) >= 0) || costo === '' || costo === null) {
        return res.status(400).json({ error: 'Orden y costo (0 o mayor) son obligatorios' });
    }
    try {
        const [r] = await db.query(
            'UPDATE Mantenimiento SET costo = ?, responsable = ? WHERE id_mantenimiento = ?',
            [costo, responsable || null, id]);
        if (r.affectedRows === 0) return res.status(404).json({ error: 'Orden no encontrada' });
        res.json({ mensaje: 'Costo registrado' });
    } catch (error) {
        responderError(res, error, 'Error al registrar el costo');
    }
};

module.exports = { obtenerOrdenes, crearOrden, iniciarOrden, resolverOrden, registrarCosto };
