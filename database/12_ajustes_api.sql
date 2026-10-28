USE lodgy;

-- La API necesita poder reemplazar los servicios de una cabaña.
-- El usuario de la API no tiene DELETE global: se concede solo sobre esta tabla.
GRANT DELETE ON lodgy.Cabana_Servicio TO 'lodgy_api'@'localhost';
FLUSH PRIVILEGES;

-- Retira del catálogo la cabaña creada para pruebas.
-- No se elimina: conserva su historial y puede volver a publicarse.
UPDATE Cabana SET activa = FALSE WHERE nombre = 'Cabaña Tolú Prueba';
