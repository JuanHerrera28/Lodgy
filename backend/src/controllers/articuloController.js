const db = require('../config/db');
const { responderError } = require('../utils/errores');
const { esEntero } = require('../utils/validar');

// Productos con su estado de stock (RN-16): Agotado, Bajo, Medio o Alto
const obtenerArticulos = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT id_producto, nombre, tipo, precio_venta, unidad_medida, stock_actual, stock_minimo,
                    CASE WHEN stock_actual = 0 THEN 'Agotado'
                         WHEN stock_actual <= stock_minimo THEN 'Bajo'
                         WHEN stock_actual <= stock_minimo * 2 THEN 'Medio'
                         ELSE 'Alto' END AS estado_stock
             FROM Producto WHERE activo = TRUE ORDER BY nombre`);
        res.json(rows);
    } catch (error) {
        responderError(res, error, 'Error al consultar los productos');
    }
};

// Solo el administrador. El stock siempre empieza en 0: se carga con movimientos de Entrada.
const crearArticulo = async (req, res) => {
    const { nombre, tipo, precio_venta, unidad_medida, stock_minimo } = req.body || {};

    if (!nombre || !['Venta', 'Insumo'].includes(tipo) || !unidad_medida) {
        return res.status(400).json({ error: "nombre, tipo ('Venta' o 'Insumo') y unidad_medida son obligatorios" });
    }
    try {
        const [resultado] = await db.query(
            `INSERT INTO Producto (nombre, tipo, precio_venta, unidad_medida, stock_minimo)
             VALUES (?, ?, ?, ?, ?)`,
            [nombre, tipo, tipo === 'Venta' ? precio_venta : null, unidad_medida, stock_minimo || 0]);
        res.status(201).json({ mensaje: 'Producto registrado exitosamente', id_producto: resultado.insertId });
    } catch (error) {
        responderError(res, error, 'Error al registrar el producto');
    }
};

// Qué movimientos puede registrar cada rol
const MOVIMIENTOS_POR_ROL = {
    'Administrador': ['Entrada', 'Venta', 'Consumo', 'Ajuste'],
    'Recepcionista': ['Venta'],
    'Servicios generales': ['Consumo']
};

// IMPORTANTE: el stock solo se actualizará cuando exista el trigger de inventario en la base de datos.
const registrarMovimiento = async (req, res) => {
    const { id_producto, tipo_movimiento, cantidad, costo_unitario, id_reserva, observacion } = req.body || {};

    if (!(MOVIMIENTOS_POR_ROL[req.usuario.rol] || []).includes(tipo_movimiento)) {
        return res.status(403).json({ error: 'Tu rol no puede registrar ese tipo de movimiento' });
    }
    if (!esEntero(id_producto) || !esEntero(cantidad)) {
        return res.status(400).json({ error: 'id_producto y cantidad (mayor que cero) son obligatorios' });
    }
    if (tipo_movimiento === 'Venta' && !esEntero(id_reserva)) {
        return res.status(400).json({ error: 'Una venta debe indicar la reserva (id_reserva)' });
    }

    try {
        const [producto] = await db.query('SELECT precio_venta FROM Producto WHERE id_producto = ? AND activo = TRUE', [id_producto]);
        if (producto.length === 0) return res.status(404).json({ error: 'El producto no existe o está desactivado' });

        // El precio de una venta sale del catálogo, no de la petición
        const precioUnitario = tipo_movimiento === 'Venta' ? producto[0].precio_venta : null;

        const [resultado] = await db.query(
            `INSERT INTO Registro_Inventario
             (id_producto, tipo_movimiento, cantidad, costo_unitario, precio_unitario, id_reserva, id_usuario, observacion)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id_producto, tipo_movimiento, cantidad,
             tipo_movimiento === 'Entrada' ? (costo_unitario ?? null) : null,
             precioUnitario,
             tipo_movimiento === 'Venta' ? id_reserva : null,
             req.usuario.id, observacion || null]);

        res.status(201).json({
            mensaje: 'Movimiento registrado exitosamente',
            id_registro_inventario: resultado.insertId
        });
    } catch (error) {
        responderError(res, error, 'Error al registrar el movimiento de inventario');
    }
};

module.exports = { obtenerArticulos, crearArticulo, registrarMovimiento };
