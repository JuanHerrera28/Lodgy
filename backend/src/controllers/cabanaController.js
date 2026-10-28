const db = require('../config/db');
const { responderError } = require('../utils/errores');
const { esFecha, esEntero } = require('../utils/validar');

// Los servicios se devuelven como texto para listarlos y como ids para editarlos.
const SELECT_CABANAS = `
    SELECT c.id_cabana, c.nombre, c.descripcion, c.capacidad, c.precio_noche, c.foto,
           c.es_recomendada, c.activa, e.nombre AS estado,
           (SELECT GROUP_CONCAT(s.nombre ORDER BY s.nombre SEPARATOR ', ')
            FROM Cabana_Servicio cs
            JOIN Servicio s ON s.id_servicio = cs.id_servicio
            WHERE cs.id_cabana = c.id_cabana) AS servicios,
           (SELECT GROUP_CONCAT(cs.id_servicio ORDER BY s.nombre SEPARATOR ',')
            FROM Cabana_Servicio cs
            JOIN Servicio s ON s.id_servicio = cs.id_servicio
            WHERE cs.id_cabana = c.id_cabana) AS ids_servicios
    FROM Cabana c
    JOIN Estado_Cabana e ON e.id_estado_cabana = c.id_estado_cabana`;

const obtenerCabanas = async (req, res) => {
    try {
        const [rows] = await db.query(`${SELECT_CABANAS} ORDER BY c.nombre`);
        res.json(rows);
    } catch (error) {
        responderError(res, error, 'Error al consultar las cabañas');
    }
};

// Catálogo de servicios que se pueden asignar a una cabaña.
const obtenerServicios = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id_servicio, nombre, descripcion FROM Servicio ORDER BY nombre');
        res.json(rows);
    } catch (error) {
        responderError(res, error, 'Error al consultar los servicios');
    }
};

const errorValidacion = (mensaje) => {
    const error = new Error(mensaje);
    error.status = 400;
    return error;
};

// Valida y normaliza los datos editables de una cabaña.
const datosCabana = (body) => {
    const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
    const descripcion = typeof body.descripcion === 'string' ? body.descripcion.trim() : '';
    const foto = typeof body.foto === 'string' ? body.foto.trim() : '';
    const capacidad = Number(body.capacidad);
    const precio = Number(body.precio_noche);

    if (!nombre || nombre.length > 50) {
        throw errorValidacion('El nombre es obligatorio y no puede superar los 50 caracteres');
    }
    if (descripcion.length > 500) {
        throw errorValidacion('La descripción no puede superar los 500 caracteres');
    }
    if (!Number.isInteger(capacidad) || capacidad < 1 || capacidad > 127) {
        throw errorValidacion('La capacidad debe ser un número entero entre 1 y 127');
    }
    if (!Number.isFinite(precio) || precio < 0 || precio > 99999999) {
        throw errorValidacion('El precio por noche debe ser un número válido');
    }
    if (foto.length > 255) {
        throw errorValidacion('La ruta de la fotografía no puede superar los 255 caracteres');
    }

    return {
        nombre,
        descripcion: descripcion || null,
        capacidad,
        precio_noche: precio,
        foto: foto || null,
        es_recomendada: body.es_recomendada ? 1 : 0
    };
};

// Devuelve null cuando no se enviaron servicios (no hay que tocarlos).
const normalizarServicios = (lista) => {
    if (lista === undefined) return null;
    if (!Array.isArray(lista)) {
        throw errorValidacion('Los servicios deben enviarse como una lista de identificadores');
    }
    const ids = [...new Set(lista.map(Number))];
    if (ids.some(id => !Number.isInteger(id) || id <= 0)) {
        throw errorValidacion('Algún servicio seleccionado no es válido');
    }
    return ids;
};

// Reemplaza la relación cabaña–servicio dentro de una transacción.
const reemplazarServicios = async (conexion, idCabana, ids) => {
    if (ids.length) {
        const [existentes] = await conexion.query(
            'SELECT id_servicio FROM Servicio WHERE id_servicio IN (?)', [ids]);
        if (existentes.length !== ids.length) {
            throw errorValidacion('Algún servicio seleccionado no existe');
        }
    }

    await conexion.query('DELETE FROM Cabana_Servicio WHERE id_cabana = ?', [idCabana]);
    if (ids.length) {
        await conexion.query(
            'INSERT INTO Cabana_Servicio (id_cabana, id_servicio) VALUES ?',
            [ids.map(idServicio => [idCabana, idServicio])]);
    }
};

const responderFallo = (res, error, mensaje) => {
    if (error.status === 400) {
        return res.status(400).json({ error: error.message });
    }
    return responderError(res, error, mensaje);
};

// Solo el administrador. La cabaña nace siempre 'Disponible': el estado no lo elige el cliente.
const crearCabana = async (req, res) => {
    let datos;
    let servicios;
    try {
        datos = datosCabana(req.body || {});
        servicios = normalizarServicios(req.body?.servicios) ?? [];
    } catch (error) {
        return responderFallo(res, error, 'Datos de la cabaña no válidos');
    }

    const conexion = await db.getConnection();
    try {
        await conexion.beginTransaction();
        const [resultado] = await conexion.query(
            `INSERT INTO Cabana (nombre, descripcion, capacidad, precio_noche, foto, id_estado_cabana, es_recomendada)
             VALUES (?, ?, ?, ?, ?, (SELECT id_estado_cabana FROM Estado_Cabana WHERE nombre = 'Disponible'), ?)`,
            [datos.nombre, datos.descripcion, datos.capacidad, datos.precio_noche, datos.foto, datos.es_recomendada]);

        if (servicios.length) {
            await reemplazarServicios(conexion, resultado.insertId, servicios);
        }

        await conexion.commit();
        res.status(201).json({
            mensaje: 'Cabaña registrada exitosamente',
            id_cabana: resultado.insertId
        });
    } catch (error) {
        await conexion.rollback();
        responderFallo(res, error, 'Error al registrar la cabaña');
    } finally {
        conexion.release();
    }
};

// Edición del catálogo. No cambia el estado operativo ni la publicación.
const actualizarCabana = async (req, res) => {
    const { id } = req.params;
    if (!esEntero(id)) return res.status(400).json({ error: 'Cabaña no válida' });

    let datos;
    let servicios;
    try {
        datos = datosCabana(req.body || {});
        servicios = normalizarServicios(req.body?.servicios);
    } catch (error) {
        return responderFallo(res, error, 'Datos de la cabaña no válidos');
    }

    const conexion = await db.getConnection();
    try {
        await conexion.beginTransaction();
        const [existe] = await conexion.query(
            'SELECT id_cabana FROM Cabana WHERE id_cabana = ?', [id]);
        if (!existe.length) {
            await conexion.rollback();
            return res.status(404).json({ error: 'La cabaña no existe' });
        }

        await conexion.query(
            `UPDATE Cabana
             SET nombre = ?, descripcion = ?, capacidad = ?, precio_noche = ?, foto = ?, es_recomendada = ?
             WHERE id_cabana = ?`,
            [datos.nombre, datos.descripcion, datos.capacidad, datos.precio_noche,
             datos.foto, datos.es_recomendada, id]);

        if (servicios !== null) {
            await reemplazarServicios(conexion, Number(id), servicios);
        }

        await conexion.commit();
        res.json({ mensaje: 'Cabaña actualizada exitosamente', id_cabana: Number(id) });
    } catch (error) {
        await conexion.rollback();
        responderFallo(res, error, 'Error al actualizar la cabaña');
    } finally {
        conexion.release();
    }
};

// Publicar o desactivar: la cabaña nunca se elimina.
const cambiarEstadoCabana = async (req, res) => {
    const { id } = req.params;
    const { activa } = req.body || {};

    if (!esEntero(id)) return res.status(400).json({ error: 'Cabaña no válida' });
    if (typeof activa !== 'boolean') {
        return res.status(400).json({ error: 'Indica si la cabaña queda activa (true) o desactivada (false)' });
    }

    try {
        const [resultado] = await db.query(
            'UPDATE Cabana SET activa = ? WHERE id_cabana = ?', [activa ? 1 : 0, id]);
        if (!resultado.affectedRows) {
            // affectedRows puede ser 0 si el valor ya era el mismo: comprobamos que exista.
            const [existe] = await db.query('SELECT id_cabana FROM Cabana WHERE id_cabana = ?', [id]);
            if (!existe.length) return res.status(404).json({ error: 'La cabaña no existe' });
        }
        res.json({
            mensaje: activa ? 'Cabaña publicada nuevamente' : 'Cabaña desactivada',
            id_cabana: Number(id),
            activa
        });
    } catch (error) {
        responderError(res, error, 'Error al cambiar la publicación de la cabaña');
    }
};

// Asigna de una vez todos los servicios incluidos de una cabaña.
const asignarServicios = async (req, res) => {
    const { id } = req.params;
    if (!esEntero(id)) return res.status(400).json({ error: 'Cabaña no válida' });

    let servicios;
    try {
        servicios = normalizarServicios(req.body?.servicios);
    } catch (error) {
        return responderFallo(res, error, 'Servicios no válidos');
    }
    if (servicios === null) {
        return res.status(400).json({ error: 'Envía la lista de servicios de la cabaña' });
    }

    const conexion = await db.getConnection();
    try {
        await conexion.beginTransaction();
        const [existe] = await conexion.query(
            'SELECT id_cabana FROM Cabana WHERE id_cabana = ?', [id]);
        if (!existe.length) {
            await conexion.rollback();
            return res.status(404).json({ error: 'La cabaña no existe' });
        }

        await reemplazarServicios(conexion, Number(id), servicios);
        await conexion.commit();

        const [rows] = await conexion.query(
            `${SELECT_CABANAS} WHERE c.id_cabana = ?`, [id]);
        res.json({
            mensaje: 'Servicios de la cabaña actualizados',
            cabana: rows[0]
        });
    } catch (error) {
        await conexion.rollback();
        responderFallo(res, error, 'Error al actualizar los servicios de la cabaña');
    } finally {
        conexion.release();
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

module.exports = {
    obtenerCabanas,
    obtenerServicios,
    crearCabana,
    actualizarCabana,
    cambiarEstadoCabana,
    asignarServicios,
    consultarDisponibilidad,
    marcarCabanaLista,
    obtenerTrabajo
};
