const db = require('../config/db');

const obtenerClientes = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM cliente');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar los clientes' });
    }
};

const crearCliente = async (req, res) => {
    const { tipo_documento, numero_documento, nombre, apellido, telefono, correo } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO cliente (tipo_documento, numero_documento, nombre, apellido, telefono, correo) VALUES (?, ?, ?, ?, ?, ?)',
            [tipo_documento, numero_documento, nombre, apellido, telefono, correo]
        );
        res.status(201).json({ mensaje: 'Cliente registrado exitosamente', id_cliente: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el cliente' });
    }
};

module.exports = { obtenerClientes, crearCliente };