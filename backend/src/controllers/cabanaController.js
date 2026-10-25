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

module.exports = { obtenerCabanas, crearCabana };