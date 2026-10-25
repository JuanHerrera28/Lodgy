const db = require('../config/db');

const obtenerArticulos = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM producto');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar los productos' });
    }
};

module.exports = { obtenerArticulos };