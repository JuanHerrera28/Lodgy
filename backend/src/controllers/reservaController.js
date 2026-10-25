const db = require('../config/db');

const obtenerReservas = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM reserva');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar las reservas' });
    }
};

module.exports = { obtenerReservas };