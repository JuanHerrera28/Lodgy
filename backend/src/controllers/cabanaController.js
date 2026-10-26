const db = require('../config/db');
const { responderError } = require('../utils/errores');
const { esFecha, esEntero } = require('../utils/validar');

const obtenerCabanas = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT c.id_cabana, c.nombre, c.descripcion, c.capacidad, c.precio_noche, c.foto,
                    c.es_recomendada, c.activa, e.nombre AS estado
             FROM Cabana c
             JOIN Estado_Cabana e ON e.id_estado_cabana = c.id_estado_cabana
             ORDER BY c.nombre`);
        res.json(rows);
    } catch (error) {
        responderError(res, error, 'Error al consultar las cabañas');
    }
};

// Solo el administrador. La cabaña nace siempre 'Disponible': el estado no lo elige el cliente.
const crearCabana = async (req, res) => {
    const { nombre, descripcion, capacidad, precio_noche, foto, es_recomendada } = req.body || {};

    if (!nombre || !esEntero(capacidad) || !(Number(precio_noche) >= 0) || precio_noche === '' || precio_noche === null) {
        return res.status(400).json({ error: 'nombre, capacidad y precio_noche son obligatorios' });
    }
    try {
        const [resultado] = await db.query(
            `INSERT INTO Cabana (nombre, descripcion, capacidad, precio_noche, foto, id_estado_cabana, es_recomendada)
             VALUES (?, ?, ?, ?, ?, (SELECT id_estado_cabana FROM Estado_Cabana WHERE nombre = 'Disponible'), ?)`,
            [nombre, descripcion || null, capacidad, precio_noche, foto || null, es_recomendada ? 1 : 0]);
        res.status(201).json({ mensaje: 'Cabaña registrada exitosamente', id_cabana: resultado.insertId });
    } catch (error) {
        responderError(res, error, 'Error al registrar la cabaña');
    }
};

// Cabañas sin reservas en el rango. Misma regla que el trigger: solo las Canceladas no bloquean.
const consultarDisponibilidad = async (req, res) => {
    const { fecha_inicio, fecha_fin, personas } = req.query;

    if (!esFecha(fecha_inicio) || !esFecha(fecha_fin) || fecha_fin <= fecha_inicio) {
        return res.status(400).json({ error: 'Indica fecha_inicio y fecha_fin (AAAA-MM-DD), con la salida posterior a la entrada' });
    }
    const minimo = esEntero(personas) ? Number(personas) : 1;

    try {
        const [rows] = await db.query(
            `SELECT c.id_cabana, c.nombre, c.descripcion, c.capacidad, c.precio_noche, c.foto
             FROM Cabana c
             WHERE c.activa = TRUE
               AND c.capacidad >= ?
               AND NOT EXISTS (
                   SELECT 1 FROM Reserva r
                   JOIN Estado_Reserva er ON er.id_estado_reserva = r.id_estado_reserva
                   WHERE r.id_cabana = c.id_cabana
                     AND er.nombre <> 'Cancelada'
                     AND r.fecha_entrada < ? AND r.fecha_salida > ?)
             ORDER BY c.nombre`,
            [minimo, fecha_fin, fecha_inicio]);
        res.json(rows);
    } catch (error) {
        responderError(res, error, 'Error al consultar las cabañas disponibles');
    }
};

// Botón "Listo" de la pantalla táctil: En Limpieza -> Disponible
const marcarCabanaLista = async (req, res) => {
    const { id } = req.params;
    if (!esEntero(id)) return res.status(400).json({ error: 'Cabaña no válida' });

    try {
        await db.query('CALL sp_cabana_lista(?, ?)', [id, req.usuario.id]);
        res.json({ mensaje: 'Cabaña marcada como disponible' });
    } catch (error) {
        responderError(res, error, 'Error al marcar la cabaña como lista');
    }
};

// Lista de trabajo de la pantalla táctil: cabañas por limpiar y órdenes de mantenimiento abiertas
const obtenerTrabajo = async (req, res) => {
    try {
        const [porLimpiar] = await db.query(
            `SELECT c.id_cabana, c.nombre
             FROM Cabana c JOIN Estado_Cabana e ON e.id_estado_cabana = c.id_estado_cabana
             WHERE e.nombre = 'En Limpieza' ORDER BY c.nombre`);
        const [ordenes] = await db.query(
            `SELECT m.id_mantenimiento, c.nombre AS cabana, m.descripcion, m.estado, m.fecha_reporte
             FROM Mantenimiento m JOIN Cabana c ON c.id_cabana = m.id_cabana
             WHERE m.estado <> 'Resuelta' ORDER BY m.fecha_reporte`);
        res.json({ cabanas_por_limpiar: porLimpiar, ordenes_pendientes: ordenes });
    } catch (error) {
        responderError(res, error, 'Error al consultar el trabajo pendiente');
    }
};

module.exports = { obtenerCabanas, crearCabana, consultarDisponibilidad, marcarCabanaLista, obtenerTrabajo };