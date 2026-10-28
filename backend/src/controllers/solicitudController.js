const db = require('../config/db');
const { responderError } = require('../utils/errores');
const { esFecha, esEntero } = require('../utils/validar');

// Solicitudes de reserva enviadas desde la web pública.
// No crean una Reserva: el panel las aprueba o rechaza. Al aprobar se
// reutiliza sp_crear_reserva, así que los cruces, la capacidad y el precio
// siguen validándose en la base de datos.

const TIPOS_DOCUMENTO = ['CC', 'CE', 'TI', 'Pasaporte'];
const ESTADOS = ['Pendiente', 'Aprobada', 'Rechazada'];
const MAX_PENDIENTES_POR_DOCUMENTO = 3;

const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '');
const fechaHoyISO = () => {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${hoy.getFullYear()}-${mes}-${dia}`;
};
const esCorreo = (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
const esTelefono = (valor) => /^[0-9+()\-\s]{7,20}$/.test(valor);
const referencia = (id) => `S-${String(id).padStart(5, '0')}`;

// Misma regla de cruces que el trigger y la disponibilidad pública.
const consultarCruce = async (idCabana, entrada, salida) => {
    const [filas] = await db.query(
        `SELECT r.id_reserva,
                DATE_FORMAT(r.fecha_entrada, '%Y-%m-%d') AS fecha_entrada,
                DATE_FORMAT(r.fecha_salida, '%Y-%m-%d') AS fecha_salida
         FROM Reserva r
         JOIN Estado_Reserva er ON er.id_estado_reserva = r.id_estado_reserva
         WHERE r.id_cabana = ?
           AND er.nombre <> 'Cancelada'
           AND r.fecha_entrada < ? AND r.fecha_salida > ?
         LIMIT 1`,
        [idCabana, salida, entrada]
    );
    return filas[0] || null;
};

const crearSolicitudPublica = async (req, res) => {
    const datos = req.body || {};

    // Campo trampa: los formularios reales lo dejan vacío.
    if (texto(datos.sitio_web)) {
        return res.status(400).json({ error: 'No pudimos procesar la solicitud.' });
    }

    const idCabana = Number(datos.id_cabana);
    const personas = Number(datos.num_personas);
    const entrada = texto(datos.fecha_entrada);
    const salida = texto(datos.fecha_salida);
    const tipoDocumento = texto(datos.tipo_documento);
    const numeroDocumento = texto(datos.numero_documento);
    const nombre = texto(datos.nombre);
    const apellido = texto(datos.apellido);
    const telefono = texto(datos.telefono);
    const correo = texto(datos.correo);
    const observaciones = texto(datos.observaciones);

    if (!esEntero(idCabana) || !esEntero(personas)) {
        return res.status(400).json({ error: 'La cabaña y el número de huéspedes son obligatorios' });
    }
    if (!esFecha(entrada) || !esFecha(salida)) {
        return res.status(400).json({ error: 'Las fechas deben tener el formato AAAA-MM-DD' });
    }
    if (salida <= entrada) {
        return res.status(400).json({ error: 'La fecha de salida debe ser posterior a la de entrada' });
    }
    if (entrada < fechaHoyISO()) {
        return res.status(400).json({ error: 'La fecha de entrada no puede ser anterior a hoy' });
    }
    if (!TIPOS_DOCUMENTO.includes(tipoDocumento)) {
        return res.status(400).json({ error: "El tipo de documento debe ser 'CC', 'CE', 'TI' o 'Pasaporte'" });
    }

    const requeridos = [
        [numeroDocumento, 'el número de documento'],
        [nombre, 'el nombre'],
        [apellido, 'el apellido'],
        [telefono, 'el teléfono'],
    ];
    const faltantes = requeridos.filter(([valor]) => !valor).map(([, etiqueta]) => etiqueta);
    if (faltantes.length) {
        return res.status(400).json({ error: `Falta ${faltantes.join(', ')}` });
    }

    if (numeroDocumento.length > 20 || nombre.length > 60 || apellido.length > 60 ||
        telefono.length > 20 || correo.length > 100 || observaciones.length > 300) {
        return res.status(400).json({ error: 'Alguno de los datos supera la longitud permitida' });
    }
    if (!esTelefono(telefono)) {
        return res.status(400).json({ error: 'Revisa el teléfono de contacto' });
    }
    if (correo && !esCorreo(correo)) {
        return res.status(400).json({ error: 'Revisa el formato del correo' });
    }

    try {
        const [cabanas] = await db.query(
            `SELECT id_cabana, nombre, capacidad, precio_noche, activa
             FROM Cabana WHERE id_cabana = ?`,
            [idCabana]
        );
        if (cabanas.length === 0) {
            return res.status(404).json({ error: 'La cabaña seleccionada no existe' });
        }

        const cabana = cabanas[0];
        if (!cabana.activa) {
            return res.status(409).json({ error: 'La cabaña ya no está publicada' });
        }
        if (personas > cabana.capacidad) {
            return res.status(409).json({
                error: `La cabaña admite máximo ${cabana.capacidad} huéspedes`,
            });
        }

        const cruce = await consultarCruce(idCabana, entrada, salida);
        if (cruce) {
            return res.status(409).json({
                error: 'La cabaña ya no está disponible para esas fechas. Prueba otro rango.',
            });
        }

        const [pendientesMismoRango] = await db.query(
            `SELECT id_solicitud FROM Solicitud_Reserva
             WHERE estado = 'Pendiente'
               AND id_cabana = ?
               AND tipo_documento = ? AND numero_documento = ?
               AND fecha_entrada < ? AND fecha_salida > ?
             LIMIT 1`,
            [idCabana, tipoDocumento, numeroDocumento, salida, entrada]
        );
        if (pendientesMismoRango.length) {
            return res.status(409).json({
                error: `Ya tienes una solicitud pendiente para esas fechas (${referencia(pendientesMismoRango[0].id_solicitud)}).`,
                id_solicitud: pendientesMismoRango[0].id_solicitud,
            });
        }

        const [[{ total }]] = await db.query(
            `SELECT COUNT(*) AS total FROM Solicitud_Reserva
             WHERE estado = 'Pendiente'
               AND tipo_documento = ? AND numero_documento = ?`,
            [tipoDocumento, numeroDocumento]
        );
        if (total >= MAX_PENDIENTES_POR_DOCUMENTO) {
            return res.status(409).json({
                error: 'Hay varias solicitudes pendientes con este documento. Espera la revisión del equipo.',
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO Solicitud_Reserva
                (id_cabana, tipo_documento, numero_documento, nombre, apellido,
                 telefono, correo, fecha_entrada, fecha_salida, num_personas,
                 precio_noche, observaciones)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                idCabana, tipoDocumento, numeroDocumento, nombre, apellido,
                telefono, correo || null, entrada, salida, personas,
                cabana.precio_noche, observaciones || null,
            ]
        );

        const noches = Math.round(
            (new Date(`${salida}T12:00:00`) - new Date(`${entrada}T12:00:00`)) / 86400000
        );

        return res.status(201).json({
            mensaje: 'Solicitud enviada. El equipo revisará la disponibilidad y te contactará.',
            id_solicitud: resultado.insertId,
            referencia: referencia(resultado.insertId),
            estado: 'Pendiente',
            cabana: cabana.nombre,
            noches,
            total_estimado: Number(cabana.precio_noche) * noches,
        });
    } catch (error) {
        responderError(res, error, 'No pudimos registrar la solicitud');
    }
};

const listarSolicitudes = async (req, res) => {
    const { estado } = req.query;

    try {
        const filtro = ESTADOS.includes(estado) ? estado : null;
        const [filas] = await db.query(
            `SELECT s.id_solicitud, s.id_cabana, s.tipo_documento, s.numero_documento,
                    s.nombre, s.apellido, s.telefono, s.correo,
                    DATE_FORMAT(s.fecha_entrada, '%Y-%m-%d') AS fecha_entrada,
                    DATE_FORMAT(s.fecha_salida, '%Y-%m-%d') AS fecha_salida,
                    s.num_personas, s.precio_noche, s.observaciones, s.estado,
                    s.motivo_rechazo, s.id_reserva, s.fecha_creacion, s.fecha_revision,
                    c.nombre AS cabana,
                    DATEDIFF(s.fecha_salida, s.fecha_entrada) AS noches,
                    DATEDIFF(s.fecha_salida, s.fecha_entrada) * s.precio_noche AS total_estimado
             FROM Solicitud_Reserva s
             JOIN Cabana c ON c.id_cabana = s.id_cabana
             ${filtro ? 'WHERE s.estado = ?' : ''}
             ORDER BY FIELD(s.estado, 'Pendiente', 'Aprobada', 'Rechazada'),
                      s.fecha_creacion DESC
             LIMIT 100`,
            filtro ? [filtro] : []
        );
        res.json(filas);
    } catch (error) {
        responderError(res, error, 'Error al consultar las solicitudes');
    }
};

const aprobarSolicitud = async (req, res) => {
    const { id } = req.params;
    if (!esEntero(id)) return res.status(400).json({ error: 'Solicitud no válida' });

    try {
        const [filas] = await db.query(
            `SELECT s.*, c.nombre AS cabana, c.capacidad, c.activa
             FROM Solicitud_Reserva s
             JOIN Cabana c ON c.id_cabana = s.id_cabana
             WHERE s.id_solicitud = ?`,
            [id]
        );
        if (filas.length === 0) {
            return res.status(404).json({ error: 'La solicitud no existe' });
        }

        const solicitud = filas[0];
        if (solicitud.estado !== 'Pendiente') {
            return res.status(409).json({ error: `La solicitud ya está ${solicitud.estado.toLowerCase()}` });
        }
        if (!solicitud.activa) {
            return res.status(409).json({ error: 'La cabaña ya no está publicada' });
        }
        if (solicitud.num_personas > solicitud.capacidad) {
            return res.status(409).json({
                error: `La cabaña admite máximo ${solicitud.capacidad} huéspedes`,
            });
        }

        const cruce = await consultarCruce(
            solicitud.id_cabana,
            solicitud.fecha_entrada,
            solicitud.fecha_salida
        );
        if (cruce) {
            return res.status(409).json({
                error: 'La cabaña ya tiene una reserva para esas fechas. Rechaza la solicitud o propone otro rango al cliente.',
            });
        }

        // El cliente se crea al aprobar, no cuando llega la solicitud: así no
        // se llena el directorio con datos de personas que nunca reservan.
        let idCliente = 0;
        const [clientes] = await db.query(
            'SELECT id_cliente FROM Cliente WHERE tipo_documento = ? AND numero_documento = ?',
            [solicitud.tipo_documento, solicitud.numero_documento]
        );

        if (clientes.length) {
            idCliente = clientes[0].id_cliente;
        } else {
            try {
                const [nuevo] = await db.query(
                    `INSERT INTO Cliente
                        (tipo_documento, numero_documento, nombre, apellido, telefono, correo)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        solicitud.tipo_documento, solicitud.numero_documento,
                        solicitud.nombre, solicitud.apellido, solicitud.telefono,
                        solicitud.correo || null,
                    ]
                );
                idCliente = nuevo.insertId;
            } catch (error) {
                if (error.errno !== 1062) throw error;
                const [reintento] = await db.query(
                    'SELECT id_cliente FROM Cliente WHERE tipo_documento = ? AND numero_documento = ?',
                    [solicitud.tipo_documento, solicitud.numero_documento]
                );
                if (!reintento.length) throw error;
                idCliente = reintento[0].id_cliente;
            }
        }

        // sp_crear_reserva vuelve a validar cruces/capacidad y copia la tarifa vigente.
        const [resultado] = await db.query(
            'CALL sp_crear_reserva(?, ?, ?, ?, ?, ?, ?)',
            [
                idCliente, solicitud.id_cabana, req.usuario.id,
                solicitud.fecha_entrada, solicitud.fecha_salida,
                solicitud.num_personas, solicitud.observaciones || null,
            ]
        );
        const idReserva = resultado[0][0].id_reserva;

        const [actualizada] = await db.query(
            `UPDATE Solicitud_Reserva
             SET estado = 'Aprobada', id_reserva = ?, id_usuario_revision = ?,
                 fecha_revision = NOW()
             WHERE id_solicitud = ? AND estado = 'Pendiente'`,
            [idReserva, req.usuario.id, id]
        );

        if (actualizada.affectedRows === 0) {
            // Otro usuario la revisó mientras tanto: deshace la reserva recién creada.
            try {
                await db.query('CALL sp_cancelar_reserva(?, ?, ?)', [
                    idReserva, req.usuario.id, 'Solicitud revisada por otro usuario',
                ]);
            } catch (error) {
                console.error('No se pudo revertir la reserva de una solicitud duplicada:', error);
            }
            return res.status(409).json({ error: 'La solicitud ya fue revisada por otro usuario' });
        }

        return res.status(201).json({
            mensaje: 'Solicitud aprobada. La reserva quedó registrada y confirmada.',
            id_solicitud: Number(id),
            id_reserva: idReserva,
            id_cliente: idCliente,
        });
    } catch (error) {
        responderError(res, error, 'No pudimos aprobar la solicitud');
    }
};

const rechazarSolicitud = async (req, res) => {
    const { id } = req.params;
    if (!esEntero(id)) return res.status(400).json({ error: 'Solicitud no válida' });

    const motivo = texto((req.body || {}).motivo).slice(0, 200);

    try {
        const [actualizada] = await db.query(
            `UPDATE Solicitud_Reserva
             SET estado = 'Rechazada', motivo_rechazo = ?, id_usuario_revision = ?,
                 fecha_revision = NOW()
             WHERE id_solicitud = ? AND estado = 'Pendiente'`,
            [motivo || null, req.usuario.id, id]
        );

        if (actualizada.affectedRows === 0) {
            const [existe] = await db.query(
                'SELECT estado FROM Solicitud_Reserva WHERE id_solicitud = ?',
                [id]
            );
            if (existe.length === 0) {
                return res.status(404).json({ error: 'La solicitud no existe' });
            }
            return res.status(409).json({
                error: `La solicitud ya está ${existe[0].estado.toLowerCase()}`,
            });
        }

        res.json({ mensaje: 'Solicitud rechazada. No se creó ninguna reserva.' });
    } catch (error) {
        responderError(res, error, 'No pudimos rechazar la solicitud');
    }
};

module.exports = {
    crearSolicitudPublica,
    listarSolicitudes,
    aprobarSolicitud,
    rechazarSolicitud,
};
