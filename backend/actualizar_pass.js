const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

(async () => {
  try {
    const hash = await bcrypt.hash('Lodgy12345', 10);
    const [r] = await db.query('UPDATE Usuario SET contrasena = ? WHERE correo = ?', [hash, 'servicios@lodgy.com']);
    console.log('updated:', r.affectedRows);
    process.exit(0);
  } catch (e) {
    console.error('err', e.message);
    process.exit(1);
  }
})();
