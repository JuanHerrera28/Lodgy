const db = require('../config/db');

const crearOrden = async (req, res) => {
    const { id_cabana, descripcion, id_usuario_reporta, bloquea_cabana } = req.body;

    try {
        // Nota: Si ya creaste el procedimiento sp_abrir_mantenimiento en MariaDB, 
        // puedes cambiar este INSERT por: CALL sp_abrir_mantenimiento(?, ?, ?, ?)
        const [result] = await db.query(
            `INSERT INTO Mantenimiento 
            (id_cabana, descripcion, id_usuario_reporta, bloquea_cabana) 
            VALUES (?, ?, ?, ?)`,
            [id_cabana, descripcion, id_usuario_reporta, bloquea_cabana ? 1 : 0]
        );

        res.status(201).json({
            mensaje: 'Orden de mantenimiento reportada exitosamente',
            id_mantenimiento: result.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el mantenimiento' });
    }
};
const cerrarOrden = async (req, res) => {
    const { id } = req.params;
    const { responsable, costo } = req.body;

    try {
        // Si ya creaste el procedimiento sp_cerrar_mantenimiento, reemplaza el UPDATE por:
        // await db.query('CALL sp_cerrar_mantenimiento(?, ?, ?)', [id, responsable, costo]);

        const [result] = await db.query(
            `UPDATE Mantenimiento 
            SET estado = 'Resuelta', responsable = ?, costo = ?, fecha_cierre = NOW() 
            WHERE id_mantenimiento = ?`,
            [responsable, costo, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Orden de mantenimiento no encontrada' });
        }

        res.json({ mensaje: 'Orden de mantenimiento cerrada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al cerrar la orden de mantenimiento' });
    }
};

module.exports = { crearOrden, cerrarOrden };