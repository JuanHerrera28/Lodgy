-- ============================================================
-- PROYECTO LODGY - SUITE DE PRUEBAS Y VERIFICACIÓN
-- ============================================================

-- ------------------------------------------------------------
-- PRUEBA 1: Trigger RN-01 (Evitar reservas cruzadas en fechas)
-- Resultado esperado: Error Code 1644 / 45000 (Bloqueo de inserción)
-- ------------------------------------------------------------
INSERT INTO Reserva (id_cabana, id_cliente, id_estado_reserva, id_usuario, fecha_entrada, fecha_salida, num_personas, precio_noche)
VALUES (
  (SELECT id_cabana FROM Cabana WHERE nombre = 'Cabaña Coral' LIMIT 1),
  (SELECT id_cliente FROM Cliente LIMIT 1),
  (SELECT id_estado_reserva FROM Estado_Reserva WHERE nombre = 'Confirmada' LIMIT 1),
  (SELECT id_usuario FROM Usuario LIMIT 1),
  '2027-01-12', '2027-01-14', 2, 260000
);

-- ------------------------------------------------------------
-- PRUEBA 2: Trigger RN-02 (Validar capacidad máxima)
-- Resultado esperado: Error Code 1644 / 45000 (Bloqueo por sobrecupo)
-- ------------------------------------------------------------
INSERT INTO Reserva (id_cabana, id_cliente, id_estado_reserva, id_usuario, fecha_entrada, fecha_salida, num_personas, precio_noche)
VALUES (
  (SELECT id_cabana FROM Cabana WHERE nombre = 'Cabaña Marea' LIMIT 1),
  (SELECT id_cliente FROM Cliente LIMIT 1),
  (SELECT id_estado_reserva FROM Estado_Reserva WHERE nombre = 'Confirmada' LIMIT 1),
  (SELECT id_usuario FROM Usuario LIMIT 1),
  '2027-02-01', '2027-02-05', 6, 140000
);

-- ------------------------------------------------------------
-- PRUEBA 3: Flujo Completo de Hospedaje (Check-In -> Check-Out)
-- Resultado esperado: Cambios de estado automatizados exitosos
-- ------------------------------------------------------------

-- A. Crear reserva válida
INSERT INTO Reserva (id_cabana, id_cliente, id_estado_reserva, id_usuario, fecha_entrada, fecha_salida, num_personas, precio_noche)
VALUES (
  (SELECT id_cabana FROM Cabana WHERE nombre = 'Cabaña Marea' LIMIT 1),
  (SELECT id_cliente FROM Cliente LIMIT 1),
  (SELECT id_estado_reserva FROM Estado_Reserva WHERE nombre = 'Confirmada' LIMIT 1),
  (SELECT id_usuario FROM Usuario LIMIT 1),
  '2027-05-10', '2027-05-15', 2, 140000
);
SET @id_reserva_prueba = LAST_INSERT_ID();

-- B. Registrar Check-In (La reserva pasa a 'En curso' y la Cabaña a 'Ocupada')
CALL sp_registrar_checkin(@id_reserva_prueba);

-- C. Registrar Check-Out (La reserva pasa a 'Finalizada' y la Cabaña a 'Disponible')
CALL sp_registrar_checkout(@id_reserva_prueba);

-- D. Consultar resultado final
SELECT 
    r.id_reserva, 
    c.nombre AS cabana, 
    ec.nombre AS estado_cabana, 
    er.nombre AS estado_reserva
FROM Reserva r
JOIN Cabana c ON r.id_cabana = c.id_cabana
JOIN Estado_Cabana ec ON c.id_estado_cabana = ec.id_estado_cabana
JOIN Estado_Reserva er ON r.id_estado_reserva = er.id_estado_reserva
WHERE r.id_reserva = @id_reserva_prueba;