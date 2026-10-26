const db = require('../config/db');

// Obtener todos los artículos / productos
const obtenerArticulos = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM producto');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar los productos' });
    }
};

// Registrar un nuevo artículo / producto
const crearArticulo = async (req, res) => {
    const { nombre, tipo, precio_venta, unidad_medida, stock_actual, stock_minimo, activo } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO producto (nombre, tipo, precio_venta, unidad_medida, stock_actual, stock_minimo, activo) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombre, tipo, precio_venta, unidad_medida, stock_actual, stock_minimo, activo]
        );
        res.status(201).json({
            mensaje: 'Producto registrado exitosamente',
            id_producto: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el producto' });
    }
};
const registrarMovimiento = async (req, res) => {
    const { id_producto, tipo_movimiento, cantidad, costo_unitario, precio_unitario, id_reserva, id_usuario } = req.body;

    try {
        const [result] = await db.query(
            `INSERT INTO Registro_Inventario 
            (id_producto, tipo_movimiento, cantidad, costo_unitario, precio_unitario, id_reserva, fecha_movimiento, id_usuario) 
            VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
            [id_producto, tipo_movimiento, cantidad, costo_unitario, precio_unitario, id_reserva, id_usuario]
        );

        res.status(201).json({
            mensaje: 'Movimiento registrado exitosamente',
            id_registro_inventario: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el movimiento de inventario' });
    }
};

module.exports = {
    obtenerArticulos,
    crearArticulo, registrarMovimiento
};