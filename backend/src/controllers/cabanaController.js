const db = require('../config/db');

const obtenerCabanas = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM cabana');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar las cabañas' });
    }
};
const crearCabana = async (req, res) => {
    const { nombre, descripcion, capacidad, precio_noche, foto, id_estado_cabana, es_recomendada, activa } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO cabana (nombre, descripcion, capacidad, precio_noche, foto, id_estado_cabana, es_recomendada, activa) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, descripcion, capacidad, precio_noche, foto, id_estado_cabana, es_recomendada, activa]
        );
        res.status(201).json({ mensaje: 'Cabaña registrada exitosamente', id_cabana: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar la cabaña' });
    }
};
const consultarDisponibilidad = async (req, res) => {
    const { fecha_inicio, fecha_fin } = req.query;

    if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({ error: 'Debes incluir fecha_inicio y fecha_fin en la consulta' });
    }

    try {
        const [cabanasLibres] = await db.query(`
            SELECT * FROM Cabana 
            WHERE id_cabana NOT IN (
                SELECT id_cabana FROM Reserva 
                WHERE id_estado_reserva NOT IN (3, 4) 
                AND (fecha_entrada < ? AND fecha_salida > ?)
            )
        `, [fecha_fin, fecha_inicio]);

        res.json(cabanasLibres);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar las cabañas disponibles' });
    }
};

module.exports = { obtenerCabanas, crearCabana, consultarDisponibilidad };