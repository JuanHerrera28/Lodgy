const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    // DATE y DATETIME llegan como texto ('2026-12-01'), sin desfase de zona horaria
    dateStrings: true
});

const promisePool = pool.promise();

promisePool.getConnection()
    .then(connection => {
        console.log('Conexión a MariaDB exitosa.');
        connection.release();
    })
    .catch(err => {
        console.error('Error conectando a la base de datos:', err.message);
    });

module.exports = promisePool;