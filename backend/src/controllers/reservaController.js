const db = require('../config/db');
const { responderError } = require('../utils/errores');
const { esFecha, esEntero } = require('../utils/validar');

// Las reglas (cruces, capacidad, estados, historiales, saldo) viven en la BASE DE DATOS.
// Aquí solo se validan los datos de entrada y se llama a los procedimientos almacenados.

const obtenerReservas = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT r.id_reserva, r.id_cliente, r.id_cabana, r.fecha_entrada, r.fecha_salida,
                    r.num_personas, r.precio_noche,
                    r.fecha_checkin, r.fecha_checkout, r.observaciones,
                    cl.nombre AS cliente_nombre, cl.apellido AS cliente_apellido,
                    cl.tipo_documento, cl.numero_documento, cl.telefono, cl.correo,
                    ca.nombre AS cabana, er.nombre AS estado
             FROM Reserva r
             JOIN Cliente cl ON cl.id_cliente = r.id_cliente
             JOIN Cabana ca ON ca.id_cabana = r.id_cabana
             JOIN Estado_Reserva er ON er.id_estado_reserva = r.id_estado_reserva
             ORDER BY r.fecha_entrada DESC`);
        res.json(rows);
    } catch (error) {
        responderError(res, error, 'Error al consultar las reservas');
    }
};

const crearReserva = async (req, res) => {
    // El precio, el estado y el usuario NO vienen del cliente: los pone la base de datos y el token
    const { id_cliente, id_cabana, fecha_entrada, fecha_salida, num_personas, observaciones } = req.body || {};

    if (!esEntero(id_cliente) || !esEntero(id_cabana) || !esEntero(num_personas)) {
        return res.status(400).json({ error: 'id_cliente, id_cabana y num_personas son obligatorios' });
    }
    if (!esFecha(fecha_entrada) || !esFecha(fecha_salida)) {
        return res.status(400).json({ error: 'Las fechas deben tener el formato AAAA-MM-DD' });
    }
    if (fecha_salida <= fecha_entrada) {
        return res.status(400).json({ error: 'La fecha de salida debe ser posterior a la de entrada' });
    }

    try {
        const [resultado] = await db.query(
            'CALL sp_crear_reserva(?, ?, ?, ?, ?, ?, ?)',
            [id_cliente, id_cabana, req.usuario.id, fecha_entrada, fecha_salida, num_personas, observaciones || null]
        );
        res.status(201).json({
            mensaje: 'Reserva registrada exitosamente',
            id_reserva: resultado[0][0].id_reserva
        });
    } catch (error) {
        responderError(res, error, 'Error al registrar la reserva');
    }
};

const cancelarReserva = async (req, res) => {
    const { id } = req.params;
    const { motivo } = req.body || {};
    if (!esEntero(id)) return res.status(400).json({ error: 'Reserva no válida' });

    try {
        await db.query('CALL sp_cancelar_reserva(?, ?, ?)', [id, req.usuario.id, motivo || null]);
        res.json({ mensaje: 'Reserva cancelada exitosamente' });
    } catch (error) {
        responderError(res, error, 'Error al cancelar la reserva');
    }
};

const registrarCheckIn = async (req, res) => {
    const { id } = req.params;
    if (!esEntero(id)) return res.status(400).json({ error: 'Reserva no válida' });

    try {
        await db.query('CALL sp_registrar_checkin(?, ?)', [id, req.usuario.id]);
        res.json({ mensaje: 'Check-in registrado exitosamente. Cabaña marcada como ocupada.' });
    } catch (error) {
        responderError(res, error, 'Error al registrar el check-in');
    }
};

const registrarCheckOut = async (req, res) => {
    const { id } = req.params;
    if (!esEntero(id)) return res.status(400).json({ error: 'Reserva no válida' });

    try {
        await db.query('CALL sp_registrar_checkout(?, ?)', [id, req.usuario.id]);
        res.json({ mensaje: 'Check-out registrado exitosamente. Cabaña enviada a limpieza.' });
    } catch (error) {
        responderError(res, error, 'Error al registrar el check-out');
    }
};

// Total, pagado y saldo (vista v_saldo_reserva)
const consultarSaldoReserva = async (req, res) => {
    const { id } = req.params;
    if (!esEntero(id)) return res.status(400).json({ error: 'Reserva no válida' });

    try {
        const [rows] = await db.query('SELECT * FROM v_saldo_reserva WHERE id_reserva = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'No se encontró información financiera para esta reserva' });
        }
        res.json(rows[0]);
    } catch (error) {
        responderError(res, error, 'Error al consultar el saldo de la reserva');
    }
};

// Registra un pago. sp_registrar_pago valida que no supere el saldo (RN-13)
const registrarPagoReserva = async (req, res) => {
    const { id } = req.params;
    const { monto, tipo, metodo_pago } = req.body || {};

    if (!esEntero(id) || !(Number(monto) > 0)) {
        return res.status(400).json({ error: 'La reserva y un monto mayor que cero son obligatorios' });
    }
    if (!['Anticipo', 'Saldo'].includes(tipo)) {
        return res.status(400).json({ error: "El tipo debe ser 'Anticipo' o 'Saldo'" });
    }
    if (!['Efectivo', 'Transferencia', 'Tarjeta'].includes(metodo_pago)) {
        return res.status(400).json({ error: "El método debe ser 'Efectivo', 'Transferencia' o 'Tarjeta'" });
    }

    try {
        const [resultado] = await db.query(
            'CALL sp_registrar_pago(?, ?, ?, ?, ?)',
            [id, monto, tipo, metodo_pago, req.usuario.id]
        );
        res.status(201).json({
            mensaje: 'Pago registrado exitosamente',
            saldo_restante: resultado[0][0].saldo_restante
        });
    } catch (error) {
        responderError(res, error, 'Error al registrar el pago');
    }
};

// Agrega un servicio adicional a la cuenta. El precio se copia del catálogo (precio_cobrado)
const agregarCargoServicio = async (req, res) => {
    const { id } = req.params;
    const { id_servicio_adicional, cantidad } = req.body || {};

    if (!esEntero(id) || !esEntero(id_servicio_adicional) || !esEntero(cantidad)) {
        return res.status(400).json({ error: 'La reserva, el servicio y la cantidad son obligatorios' });
    }

    try {
        const [reserva] = await db.query(
            `SELECT er.nombre AS estado FROM Reserva r
             JOIN Estado_Reserva er ON er.id_estado_reserva = r.id_estado_reserva
             WHERE r.id_reserva = ?`, [id]);
        if (reserva.length === 0) return res.status(404).json({ error: 'Reserva no encontrada' });
        if (reserva[0].estado === 'Cancelada') {
            return res.status(409).json({ error: 'No se pueden cargar servicios a una reserva cancelada' });
        }

        const [resultado] = await db.query(
            `INSERT INTO Cargo_Servicio (id_reserva, id_servicio_adicional, cantidad, precio_cobrado, id_usuario)
             SELECT ?, id_servicio_adicional, ?, precio, ?
             FROM Servicio_Adicional WHERE id_servicio_adicional = ? AND activo = TRUE`,
            [id, cantidad, req.usuario.id, id_servicio_adicional]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'El servicio adicional no existe o está desactivado' });
        }
        res.status(201).json({ mensaje: 'Servicio agregado a la cuenta', id_cargo_servicio: resultado.insertId });
    } catch (error) {
        responderError(res, error, 'Error al agregar el servicio');
    }
};

module.exports = {
    obtenerReservas, crearReserva, cancelarReserva,
    registrarCheckIn, registrarCheckOut,
    consultarSaldoReserva, registrarPagoReserva, agregarCargoServicio
};
