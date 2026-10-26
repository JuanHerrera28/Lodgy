-- Usuario de base de datos para la API (NO usar root).
-- Solo puede leer, insertar, actualizar y ejecutar procedimientos dentro de lodgy.
-- Nota: la guía lo llama 07_usuario_api.sql; en este repositorio el 07 ya está
-- ocupado por 07_pagos.sql, por eso se numera como 10.
CREATE USER IF NOT EXISTS 'lodgy_api'@'localhost' IDENTIFIED BY 'cambia_esta_clave';
GRANT SELECT, INSERT, UPDATE, EXECUTE ON lodgy.* TO 'lodgy_api'@'localhost';
FLUSH PRIVILEGES;
