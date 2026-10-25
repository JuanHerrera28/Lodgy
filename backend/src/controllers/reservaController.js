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

const registrarCheckIn = async (req, res) => {
    const { id } = req.params;

    try {
        const [reservaRows] = await db.query('SELECT id_cabana FROM reserva WHERE id_reserva = ?', [id]);

        if (reservaRows.length === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        const idCabana = reservaRows[0].id_cabana;

        // Actualizamos id_estado_reserva (ajusta el ID numérico según tu catálogo de estados, ej: 2 o el que corresponda a "En curso")
        // Y registramos la fecha actual en fecha_checkin
        await db.query(
            'UPDATE reserva SET id_estado_reserva = ?, fecha_checkin = NOW() WHERE id_reserva = ?',
            [2, id] // Cambia '2' por el id_estado_reserva que indique "En curso" o activa
        );

        // Actualizar estado de la cabaña a Ocupada (ej: id_estado_cabana = 2)
        await db.query('UPDATE cabana SET id_estado_cabana = 2 WHERE id_cabana = ?', [idCabana]);

        res.json({ mensaje: 'Check-in registrado exitosamente. Cabaña marcada como ocupada.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el check-in' });
    }
};

// Registrar Check-out
const registrarCheckOut = async (req, res) => {
    const { id } = req.params;

    try {
        const [reservaRows] = await db.query('SELECT id_cabana FROM reserva WHERE id_reserva = ?', [id]);

        if (reservaRows.length === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        const idCabana = reservaRows[0].id_cabana;

        // Actualizar estado de la reserva a Finalizada y fecha_checkout
        await db.query(
            'UPDATE reserva SET id_estado_reserva = ?, fecha_checkout = NOW() WHERE id_reserva = ?',
            [3, id] // Cambia '3' por el id_estado_reserva que corresponda a "Finalizada"
        );

        // Cambiar la cabaña a estado 'En Limpieza' (ej: id_estado_cabana = 3)
        await db.query('UPDATE cabana SET id_estado_cabana = 3 WHERE id_cabana = ?', [idCabana]);

        res.json({ mensaje: 'Check-out registrado exitosamente. Cabaña enviada a limpieza.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el check-out' });
    }
};
module.exports = {
    obtenerReservas,
    crearReserva, registrarCheckIn,
    registrarCheckOut
};