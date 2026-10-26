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

module.exports = { crearOrden };