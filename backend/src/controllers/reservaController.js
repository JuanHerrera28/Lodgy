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

const crearReserva = async (req, res) => {
    const {
        id_cliente,
        id_cabana,
        id_usuario,
        id_estado_reserva,
        fecha_entrada,
        fecha_salida,
        num_personas,
        precio_noche,
        observaciones
    } = req.body;

    try {
        const query = `
            INSERT INTO reserva 
            (id_cliente, id_cabana, id_usuario, id_estado_reserva, fecha_entrada, fecha_salida, num_personas, precio_noche, observaciones) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const valores = [
            id_cliente,
            id_cabana,
            id_usuario,
            id_estado_reserva,
            fecha_entrada,
            fecha_salida,
            num_personas,
            precio_noche,
            observaciones || null
        ];

        const [resultado] = await db.query(query, valores);

        res.status(201).json({
            mensaje: "Reserva registrada exitosamente",
            id_reserva: resultado.insertId
        });
    } catch (error) {
        console.error("Error al registrar la reserva:", error);
        res.status(500).json({ error: "Error interno al registrar la reserva en Lodgy" });
    }
};

module.exports = {
    obtenerReservas,
    crearReserva
};