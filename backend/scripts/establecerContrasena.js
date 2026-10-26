// Uso: node scripts/establecerContrasena.js correo@lodgy.com ContrasenaNueva123
// Guarda la contraseña CIFRADA (bcrypt) en la tabla Usuario.
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

(async () => {
    const [correo, contrasena] = process.argv.slice(2);
    if (!correo || !contrasena || contrasena.length < 8) {
        console.log('Uso: node scripts/establecerContrasena.js correo contrasena (mínimo 8 caracteres)');
        process.exit(1);
    }
    const hash = await bcrypt.hash(contrasena, 10);
    const [r] = await db.query('UPDATE Usuario SET contrasena = ? WHERE correo = ?', [hash, correo]);
    console.log(r.affectedRows ? 'Contraseña actualizada.' : 'No existe un usuario con ese correo.');
    process.exit(0);
})();