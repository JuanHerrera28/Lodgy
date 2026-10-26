const db = require('../config/db');
const { responderError } = require('../utils/errores');

// Lista todos los clientes, o busca por documento, nombre o apellido con ?q=texto
const obtenerClientes = async (req, res) => {
    const { q } = req.query;
    try {
        let rows;
        if (q) {
            const like = `%${q}%`;
            [rows] = await db.query(
                `SELECT * FROM Cliente
                 WHERE numero_documento LIKE ? OR nombre LIKE ? OR apellido LIKE ?
                 ORDER BY apellido, nombre LIMIT 50`, [like, like, like]);
        } else {
            [rows] = await db.query('SELECT * FROM Cliente ORDER BY apellido, nombre');
        }
        res.json(rows);
    } catch (error) {
        responderError(res, error, 'Error al consultar los clientes');
    }
};

const crearCliente = async (req, res) => {
    const { tipo_documento, numero_documento, nombre, apellido, telefono, correo } = req.body || {};

    if (!['CC', 'CE', 'TI', 'Pasaporte'].includes(tipo_documento)) {
        return res.status(400).json({ error: "tipo_documento debe ser 'CC', 'CE', 'TI' o 'Pasaporte'" });
    }
    if (!numero_documento || !nombre || !apellido || !telefono) {
        return res.status(400).json({ error: 'numero_documento, nombre, apellido y telefono son obligatorios' });
    }
    try {
        const [resultado] = await db.query(
            `INSERT INTO Cliente (tipo_documento, numero_documento, nombre, apellido, telefono, correo)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [tipo_documento, numero_documento, nombre, apellido, telefono, correo || null]);
        res.status(201).json({ mensaje: 'Cliente registrado exitosamente', id_cliente: resultado.insertId });
    } catch (error) {
        // Un documento repetido llega como 409 gracias a responderError (error 1062)
        responderError(res, error, 'Error al registrar el cliente');
    }
};

module.exports = { obtenerClientes, crearCliente };
